out vec4 FragColor;

uniform vec3 iResolution;           // viewport resolution (in pixels)
uniform float iTime;                // shader playback time (in seconds)
uniform float iTimeDelta;           // render time (in seconds)
uniform vec3 iMouse;                // mouse pixel coords. xy: current (if MLB down), zw: click

void main() {
    float sd = MAX_FLOAT;
    vec3 emissivity = vec3(0.0);

    // Definir las posiciones de las esferas
    vec2 center = vec2(0.5, 0.5) * iResolution.xy;
    vec2 moving = center + vec2(0.1 * sin(iTime), 0.1 * cos(iTime)) * iResolution.y;
    vec2 mousePos = iMouse.xy; // Coordenadas del ratón

    // Calcular las distancias
    float sd_center = sdCircle(gl_FragCoord.xy, center, 15.);
    float sd_moving = sdCircle(gl_FragCoord.xy, moving, 15.);
    float sd_mouse = sdCircle(gl_FragCoord.xy, mousePos, 15.);

    // Determinar el SDF mínimo (la esfera más cercana)
    sd = min(min(sd_center, sd_moving),sd_mouse);

    vec3 color_center = vec3(5.0); // Rojo para el círculo central
    vec3 color_mouse  = vec3(0.); // Verde para el círculo del ratón
    vec3 color_moving = vec3(0.);           // Gris para el círculo en movimiento

    // Determinar el color del píxel actual
    if (sd == sd_center) {
        emissivity = color_center;
    } else if (sd == sd_mouse) {
        emissivity = color_mouse;
    } else {
        emissivity = color_moving;
    }

    // Aplicar emisividad solo al círculo central
    //emissivity = (sd == sd_center) ? vec3(8.0) : vec3(0.0);
    FragColor = vec4(sd, emissivity);
}