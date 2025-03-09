#version 330 core
out vec4 FragColor;

uniform vec3 iResolution;           // viewport resolution (in pixels)
uniform float iTime;                // shader playback time (in seconds)
uniform float iTimeDelta;           // render time (in seconds)
uniform vec3 iMouse;                // mouse pixel coords. xy: current (if MLB down), zw: click

float sdSphere(vec3 p, float s) {
    return length(p) - s;
}

float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q,0.0)) + min(max(q.x, max(q.y,q.z)), 0.0);
}

float sdOctahedron(vec3 p, float s) {
    p = abs(p);
    return (p.x + p.y + p.z - s) * 0.57735027;
}

float smin(float a, float b, float k) {
    float h = max(k-abs(a-b), 0.0) /k;
    return min(a,b) - h*h*h*k*(1.0/6.0);
}

mat2 rot2D(float angle)
{
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
}

vec3 rot3D(vec3 p, vec3 axis, float angle) {
    //rodrigues rotation 
    return mix(dot(axis,p) * axis, p, cos(angle)) + cross(axis, p) * sin(angle);
}


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