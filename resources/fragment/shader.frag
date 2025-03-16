out vec4 FragColor;

uniform sampler2D iChannel1;

uniform vec3 iResolution;           // viewport resolution (in pixels)
uniform float iTime;                // shader playback time (in seconds)
uniform float iTimeDelta;           // render time (in seconds)
uniform vec3 iMouse;                // mouse pixel coords. xy: current (if MLB down), zw: click

void main ()
{
    vec2 uv = gl_FragCoord.xy / iResolution.xy;

    vec4 bufferdata = texture(iChannel1, uv);
    float t = bufferdata.r;
 
    FragColor = vec4(t,t,t, 1.0);
}