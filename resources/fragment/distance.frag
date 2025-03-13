out vec4 FragColor;

uniform vec3 iResolution;           // viewport resolution (in pixels)
uniform float iTime;                // shader playback time (in seconds)
uniform float iTimeDelta;           // render time (in seconds)
uniform vec3 iMouse;                // mouse pixel coords. xy: current (if MLB down), zw: click

float map(vec3 p) { 
    p.z += iTime * .4;

    p.xy = fract(p.xy) - .5;
    p.z = mod(p.z, 0.25) - .125;

    float box = sdOctahedron(p, 0.15);   

    return box;
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2. - iResolution.xy) / iResolution.y;
    vec2 m = (iMouse.xy * 2. - iResolution.xy) / iResolution.y;

    vec3  ro = vec3(0, 0, -3);   // ray origin
    vec3  rd = normalize(vec3(uv, 1));    // ray direction
   
    float t = 0.; // distancia recorrida

    if (iMouse.z < 0.001) m = vec2(cos(iTime *.2), sin(iTime*.2));

    // Raymarching
    int i;
    for (i; i< 80; i++) {
        vec3 p = ro + rd * t;

        p.xy *= rot2D(t*.2 * m.x);

        p.y += sin(t*(m.y+1.))*.35;

        float d = map(p);

        t += d;

        if (d < .001 || t > 100.) break;
    }
    
    FragColor = vec4(t, float(i), 0.0, 1);
}