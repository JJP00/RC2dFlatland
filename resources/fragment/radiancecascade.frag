out vec4 FragColor;

// in vec3 rayDirection; // necesario para procesar el cubemap
// flat in int faceIndex;

uniform vec3 iResolution;           // viewport resolution (in pixels)
uniform float iTime;                // shader playback time (in seconds)
uniform float iTimeDelta;           // render time (in seconds)
uniform vec3 iMouse;                // mouse pixel coords. xy: current (if MLB down), zw: click

//exclusivo de RC

#define EPS 0.00010

uniform float in_CascadeIndex;
float in_CascadeLinear = 1.;
float in_CascadeInterval = 2.0;
ivec2 in_CascadeExtent = ivec2(iResolution.xy / in_CascadeLinear);

#define TAU 6.283185

uniform sampler2D iChannel1;    // r = distancia, gba = radiancia

vec3 tosrgb(vec3 color) { 
    return pow(color, vec3(2.2)); 
}

struct probe_info {
    float angular;
    vec2 linear, size, probe;
    float index, offset, range, scale;
};

probe_info cascadeTexelInfo(vec2 coord) {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    
    float angular = pow(2.0, in_CascadeIndex); // numero de rayos, potencia de 2.. 4,8,16,32,64,128...
    vec2 linear = vec2(in_CascadeLinear * pow(2.0, in_CascadeIndex)); // distacnia entre probes
    vec2 size = in_CascadeExtent / angular; // en cuentos "bloques" se dibide una textura para representar los probes
    vec2 probe = mod(floor(coord), size); // posicion del probe 
    vec2 raypos = floor(uv * angular); // coordenadas de textura a posicion de rayo
    float index = raypos.x + (angular * raypos.y); //2d ray pos a 1d array index
    float offset = (in_CascadeInterval * (1.0 - pow(4.0, in_CascadeIndex))) / (1.0 - 4.0);
    float range = in_CascadeInterval * pow(4.0, in_CascadeIndex);
    range += length(vec2(in_CascadeLinear * pow(2.0, in_CascadeIndex + 1.0)));
    float scale = length(iResolution.xy);
    return probe_info(angular * angular, linear, size, probe, index, offset, range, scale); // Output probe information struct.
}

vec4 raymarch(vec2 point, float theta, probe_info info) 
{
    vec2 texel = 1.0 / iResolution.xy;           // convertir coordenadas pixel a espacio de pantalla UV
    vec2 delta = vec2(cos(theta), -sin(theta));     // componente del rayo para moverlo a la direccion de theta
    vec2 ray = (point + (delta * info.offset)) * texel; // Origen del rayo  

    for(float i = 0.0, df = 0.0, rd = 0.0; i < info.range; i++)
    {
        df = texture(iChannel1, ray).r;             //obtener la distacioa calculada en el shader pass anterior
        rd += df * info.scale;                      // suma de distancia total, escalado distancia UV a coordenada de pixel
        ray += (delta * df * info.scale * texel);   //mover el rayo

        if (rd >= info.range || floor(ray) != vec2(0.0)) // si se sale de los limites, no hit
            break;
        if (df <= EPS && rd <= EPS && in_CascadeIndex != 0.0) return vec4(0.0); // emitir luz solo en la superficie 
        if (df <= EPS) return vec4(tosrgb(texture(iChannel1, ray).gba), 0.0);  // si hay hit, devolver la radiacia
    }
    return vec4(0.0,0.0,0.0,1.0);
}

vec4 merge(vec4 rinfo, float index, probe_info pinfo)
{
    if (rinfo.a == 0.0 || in_CascadeIndex >= nCascades - 1.0)
        return vec4(rinfo.rgb, 1.0 - rinfo.a);
    
    float angularN1 = pow(2.0, in_CascadeIndex + 1.0);
    vec2 sizeN1 = pinfo.size * 0.5;
    vec2 probeN1 = vec2(mod(index, angularN1), floor(index / angularN1)) * sizeN1;
    vec2 interpUVN1 = (pinfo.probe * 0.5) + 0.25;
    vec2 clampedUVN1 = max(vec2(1.0), min(interpUVN1, sizeN1 - 1.0));
    vec2 probeUVN1 = probeN1 + clampedUVN1;
    vec4 interpolated = texture(iChannel1, probeUVN1 * (1.0 / in_CascadeExtent));
    return rinfo + vec4(interpolated.gba, 1.0);															// Return original radiance input and merge with lookup sample.
}

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;

    probe_info pinfo = cascadeTexelInfo(floor(uv * in_CascadeExtent));
    vec2 origin = (pinfo.probe + 0.5) * pinfo.linear;
    float preavg_index = pinfo.index * 4.0;
    float theta_scalar = TAU / (pinfo.angular * 4.0);

    for(float i = 0.0; i < 4.0; i++)
    {
        float index = preavg_index + float(i);
        float theta = (index + 0.5) * theta_scalar;
        
        vec4 rinfo = raymarch(origin, theta, pinfo);
        FragColor += merge(rinfo, index, pinfo) * 0.25;
    }

    if (in_CascadeIndex == 0.0)
        FragColor = vec4(pow(FragColor.rgb, vec3(1.0 / 2.2)), 1.0);

    //vec2 uv = gl_FragCoord.xy / iResolution.xy;
    //FragColor = texture(iChannel1, uv);
    //FragColor = vec4(0.1,0.7,0.,1.0);
}