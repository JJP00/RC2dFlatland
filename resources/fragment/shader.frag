#version 330 core
out vec4 FragColor;

uniform sampler2D iChannel1;

uniform vec3 iResolution;           // viewport resolution (in pixels)
uniform float iTime;                // shader playback time (in seconds)
uniform float iTimeDelta;           // render time (in seconds)
uniform vec3 iMouse;                // mouse pixel coords. xy: current (if MLB down), zw: click

vec3 palette ( float t) 
{
    vec3 a = vec3(0.5,0.5,0.5);
    vec3 b = vec3(0.5,0.5,0.5);
    vec3 c = vec3(1.0,1.0,1.0);
    vec3 d = vec3(0.263,0.416,0.557);
    
    return a + b * cos(6.28318*(c*t+d));
}

void main ()
{
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    vec3 col = vec3(0);

    vec4 bufferdata = texture(iChannel1, uv);
    float t = bufferdata.r;
    float i = bufferdata.g;
    
    //colorings
    col = palette(t*.04 + i*.005);

    FragColor = vec4(col, 1.0);
}