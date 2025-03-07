#include "./Common.glsl"

void main(out vec4 fragColor, vec2 fragCoord) {
    vec4 data = texelFetch(iChannel1, ivec2(fragCoord), 0);
    float sd = iFrame != 0 ? data.r : MAX_FLOAT;
    vec3 emissivity = iFrame != 0 ? data.gba : vec3(0.0);
    float d = MAX_FLOAT;

    
    //float t = 20.0f;

    // Definir las posiciones de las esferas
    vec2 center = vec2(0.5, 0.5) * iResolution.xy;
    vec2 moving = center + vec2(0.1 * sin(iTime), 0.1 * cos(iTime)) * iResolution.y;
    vec2 mousePos = iMouse.xy; // Coordenadas del ratón

    // Calcular las distancias
    float sd_center = sdCircle(fragCoord, center, 10.);
    float sd_moving = sdCircle(fragCoord, moving, 10.);
    float sd_mouse = sdCircle(fragCoord, mousePos, 10.);

    // Determinar el SDF mínimo (la esfera más cercana)
    sd = min(min(sd_center, sd_moving),sd_mouse);

    vec3 color_center = vec3(5.); // Rojo para el círculo central
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
    fragColor = vec4(sd, emissivity);
}