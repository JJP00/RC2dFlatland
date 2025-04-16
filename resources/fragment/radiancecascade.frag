out vec4 FragColor;

// in vec3 rayDirection; // necesario para procesar el cubemap
// flat in int faceIndex;

uniform vec3 iResolution;           // viewport resolution (in pixels)
uniform float iTime;                // shader playback time (in seconds)
uniform float iTimeDelta;           // render time (in seconds)
uniform vec3 iMouse;                // mouse pixel coords. xy: current (if MLB down), zw: click

//exclusivo de RC

#define EPS 0.000100

uniform float in_CascadeIndex;
float in_CascadeLinear = 1.;
float in_CascadeInterval = 2.;
ivec2 in_CascadeExtent = ivec2(iResolution.xy / in_CascadeLinear);

#define TAU 6.283185

uniform sampler2D iChannel1;    // r = distancia, gba = radiancia
uniform sampler2D readTex;      // la textura del paso anterior

vec3 tosrgb(vec3 color) { 
    return pow(color, vec3(2.2)); 
}

struct probe_info {
    float angular;
    vec2 linear, linearN1;
    vec4 probe;
    float interval, limit;
};

probe_info cascadeTexelInfo(vec2 coord) {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    
    float angular = pow(2.0, in_CascadeIndex); // numero de rayos, potencia de 2.. 4,8,16,32,64,128...
    vec2 extent = floor(in_CascadeExtent /  angular);
    vec4 probe = vec4(mod(floor(coord), extent), floor(coord / extent)); // posición del probe 
    float offset = (in_CascadeInterval * (1.0 - pow(4.0, in_CascadeIndex))) / (1.0 - 4.0);
    float range = in_CascadeInterval * pow(4.0, in_CascadeIndex);

    float interval_start = offset;
    float interval_end = offset + range;

    vec2 linear = vec2(in_CascadeLinear * pow(2.0, in_CascadeIndex)); // Distancia entre probes
    vec2 linearN1 = vec2(in_CascadeLinear * pow(2.0, in_CascadeIndex + 1)); // Distancia entre probes

    return probe_info(angular, linear, linearN1, probe, offset, range); // Output probe information struct.
}

void getBilinearProbes(vec2 probe, out vec2 probes[4])
{
    vec2 probeN1 = floor((probe - 1.0) / 2.0);
    probes[0] = probeN1 + vec2(0.0,0.0);
    probes[1] = probeN1 + vec2(1.0,0.0);
    probes[2] = probeN1 + vec2(0.0,1.0);
    probes[3] = probeN1 + vec2(1.0,1.0);
}

float ATAN2(float yy, float xx) { return mod(atan(yy, xx), TAU); }

vec4 raymarch(vec2 origin, vec2 delta, float interval) 
{
    vec2 texel = 1.0 / iResolution.xy;           // convertir coordenadas pixel a espacio de pantalla UV
    for(float i = 0.0, df = 0.0, rd = 0.0; i < interval; i++)
    {
        vec2 ray = (origin + (delta * rd)) * texel;
        df = texture(iChannel1, ray).r;             //obtener la distancia calculada en el shader pass anterior
        rd += df;                      // suma de distancia total, escalado distancia UV a coordenada de pixel
        
        if (rd >= interval || floor(ray) != vec2(0.0)) // si se sale de los limites, no hit
            break;
        //if (df <= EPS && rd <= EPS && in_CascadeIndex != 0.0) return vec4(0.0); // emitir luz solo en la superficie 
        if (df <= EPS) return vec4(tosrgb(texture(iChannel1, ray).gba), 0.0);  // si hay hit, devolver la radiancia
    }
    return vec4(0.0,0.0,0.0,1.0);
}

vec4 mergeNearestProbe(vec4 rinfo, float index, vec2 probe)
{
    // el canal alfa nos indica si ha habido un hit o no, si ha habido un hit no se fusiona, solo aquellos que tiene el canal alpha a 1 se fusionan con la cascada anterior
    // Si estamos en la cascada superior no se debe fusionar.
    if (rinfo.a == 0.0 || in_CascadeIndex >= nCascades - 1.0) 
        return vec4(rinfo.rgb, 1.0 - rinfo.a);
    
    float angularN1 = pow(2.0, floor(in_CascadeIndex + 1.0));
    vec2 extentN1 = floor(in_CascadeExtent / angularN1);
    vec2 interpN1 = vec2(mod(index, angularN1), floor(index / angularN1)) * extentN1;
    interpN1 += clamp(probe + 0.5, vec2(0.5), extentN1 - vec2(0.5));
    return texture(readTex, interpN1 * (1.0 / in_CascadeExtent));
}

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;

    probe_info pinfo = cascadeTexelInfo(floor(uv * in_CascadeExtent));

    vec4 probe = pinfo.probe;
    float sqr_angular = pinfo.angular;
    vec2 origin = (probe.xy + 0.5) * pinfo.linear;
    float angular = sqr_angular * sqr_angular * 4.0;
    float index = (probe.z + (probe.w * sqr_angular)) * 4.0;

    //BILINEAR FIX
    vec2 bilinearN1[4];
    getBilinearProbes(probe.xy, bilinearN1);
    vec2 texelIndexN1 = floor((vec2(probe.xy) - 1.0) / 2.0);
    vec2 texelIndexN1_N = floor((texelIndexN1 * 2.0) + 1.0);
    vec2 weight = vec2(0.25) + (vec2(probe.xy) - texelIndexN1_N) * vec2(0.5);
    //BILINEAR FIX

    
    FragColor = vec4(0.0);
    for(float i = 0.0; i < 4.0; i++)
    {
        float preavg = index + float(i);
        float theta = (preavg + 0.5) * (TAU / angular);
        float thetaNm1 = (floor(preavg/4.0) + 0.5) * (TAU/(angular/4.0));
        vec2 delta = vec2(cos(theta), -sin(theta));
        vec2 deltaNm1 = vec2(cos(thetaNm1), -sin(thetaNm1));
        vec2 ray_start = origin + (deltaNm1 * pinfo.interval);

        //BILINEAR FIX
        vec4 samples[4];
        for(float j = 0.0; j < 4.0; j++) {
            vec2 originN1 = (bilinearN1[int(j)] + 0.5) * pinfo.linearN1;
            vec2 ray_end = originN1 + (delta * (pinfo.interval + pinfo.limit));
            samples[int(j)] = raymarch(ray_start, normalize(ray_end - ray_start), length(ray_end - ray_start));
            samples[int(j)] = mergeNearestProbe(samples[int(j)], preavg, bilinearN1[int(j)]);
        }

        vec4 top = mix(samples[0], samples[1], weight.x);
        vec4 bot = mix(samples[2], samples[3], weight.x);
        vec4 rad = mix(top, bot, weight.y);
        //BILINEAR FIX

        FragColor += rad * 0.25;
    }

    if (in_CascadeIndex < 1.0)
        FragColor = vec4(pow(FragColor.rgb, vec3(1.0 / 2.2)), 1.0);

    //vec2 uv = gl_FragCoord.xy / iResolution.xy;
    //FragColor = texture(iChannel1, uv);
    //FragColor = vec4(0.1,0.7,0.,1.0);
}