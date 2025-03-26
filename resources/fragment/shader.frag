out vec4 FragColor;

uniform sampler2D readTex;

uniform vec3 iResolution;           // viewport resolution (in pixels)
uniform float iTime;                // shader playback time (in seconds)
uniform float iTimeDelta;           // render time (in seconds)
uniform vec3 iMouse;                // mouse pixel coords. xy: current (if MLB down), zw: click

void main()
{
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    FragColor = texture(readTex, uv);
    //FragColor = vec4(0.7,0.7,0.,1.0);
}