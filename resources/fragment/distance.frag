out vec4 FragColor;

uniform vec3 iResolution;           // viewport resolution (in pixels)
uniform float iTime;                // shader playback time (in seconds)
uniform float iTimeDelta;           // render time (in seconds)
uniform vec3 iMouse;                // mouse pixel coords. xy: current (if MLB down), zw: click

void getColorBoxCoord(float centX, float centY, out vec2 box_a, out vec2 box_b)
{
    // 1. Definir tamaño
    float boxLength = iResolution.y * 0.29;  // Altura de la caja
    float boxThickness = iResolution.y * 0.1; // Anchura de la caja

    // 2. Definir orientación fija (por ejemplo, vertical)
    vec2 boxDir = vec2(0.0, 1.0); // Eje apunta hacia arriba (vertical)
    // Si prefieres horizontal: vec2 boxDir = vec2(1.0, 0.0); y ajusta los cálculos de centro X/Y

    // 3. Calcular posición FIJA del centro para la esquina superior izquierda
    
    float boxCenterX = boxThickness * centX; // Centro X: Para pegar a la izquierda (X=0), el centro debe estar a mitad de anchura.
    float boxCenterY = iResolution.y - boxLength * centY; // Centro Y: Para pegar arriba (Y=iResolution.y), el centro debe estar a la altura total menos mitad de altura.
    vec2 boxCenter = vec2(boxCenterX, boxCenterY); // Combinar en un vector de centro fijo

    // 4. Calcular puntos finales del eje (ahora son fijos)
    box_a = boxCenter - boxDir * boxLength * 0.0; // Punto inferior del eje
    box_b = boxCenter + boxDir * boxLength * -0.5; // Punto superior del eje
}

void getBoxCoord(float centX, float centY, out vec2 box_a, out vec2 box_b)
{
    // 1. Definir tamaño
    float boxLength = iResolution.y * 0.29;  // Altura de la caja
    float boxThickness = iResolution.y * 0.1; // Anchura de la caja

    // 2. Definir orientación fija (por ejemplo, vertical)
    vec2 boxDir = vec2(0.0, 1.0); // Eje apunta hacia arriba (vertical)
    // Si prefieres horizontal: vec2 boxDir = vec2(1.0, 0.0); y ajusta los cálculos de centro X/Y

    // 3. Calcular posición FIJA del centro para la esquina superior izquierda
    
    float boxCenterX = boxThickness * centX; // Centro X: Para pegar a la izquierda (X=0), el centro debe estar a mitad de anchura.
    float boxCenterY = iResolution.y - boxLength * centY; // Centro Y: Para pegar arriba (Y=iResolution.y), el centro debe estar a la altura total menos mitad de altura.
    vec2 boxCenter = vec2(boxCenterX, boxCenterY); // Combinar en un vector de centro fijo

    // 4. Calcular puntos finales del eje (ahora son fijos)
    box_a = boxCenter - boxDir * boxLength * 0.0; // Punto inferior del eje
    box_b = boxCenter + boxDir * boxLength * -1.9; // Punto superior del eje
}

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
    float sd_mouse = sdCircle(gl_FragCoord.xy, mousePos, 50.);
    
    vec2 box_a = vec2(0.0); // Punto inferior del eje
    vec2 box_b = vec2(0.0); // Punto superior del eje

    getColorBoxCoord(0.0, 0.0, box_a, box_b);

    float sd_box = sdOrientedBox(gl_FragCoord.xy, box_a, box_b, 15.); // Usar el grosor total aquí, la función lo divide por 2

    getColorBoxCoord(0.0, 0.5, box_a, box_b);

    float sd_box2 = sdOrientedBox(gl_FragCoord.xy, box_a, box_b, 15.); // Usar el grosor total aquí, la función lo divide por 2

    getColorBoxCoord(0.0, 1.0, box_a, box_b);

    float sd_box3 = sdOrientedBox(gl_FragCoord.xy, box_a, box_b, 15.); // Usar el grosor total aquí, la función lo divide por 2

    getColorBoxCoord(0.0, 1.5, box_a, box_b);

    float sd_box4 = sdOrientedBox(gl_FragCoord.xy, box_a, box_b, 15.); // Usar el grosor total aquí, la función lo divide por 2

    getColorBoxCoord(0.0, 2.0, box_a, box_b);

    float sd_box5 = sdOrientedBox(gl_FragCoord.xy, box_a, box_b, 15.); // Usar el grosor total aquí, la función lo divide por 2

    getColorBoxCoord(0.0, 2.5, box_a, box_b);

    float sd_box6 = sdOrientedBox(gl_FragCoord.xy, box_a, box_b, 15.); // Usar el grosor total aquí, la función lo divide por 2

    getColorBoxCoord(0.0, 3.0, box_a, box_b);

    float sd_box7 = sdOrientedBox(gl_FragCoord.xy, box_a, box_b, 15.); // Usar el grosor total aquí, la función lo divide por 2

    getBoxCoord(12.0, 0.0, box_a, box_b);

    float sd_box8 = sdOrientedBox(gl_FragCoord.xy, box_a, box_b, 15.); // Usar el grosor total aquí, la función lo divide por 2

    getBoxCoord(12.0, 2, box_a, box_b);

    float sd_box9 = sdOrientedBox(gl_FragCoord.xy, box_a, box_b, 15.); // Usar el grosor total aquí, la función lo divide por 2


    // Determinar el SDF mínimo (la esfera más cercana)
    //sd = min(sd, sd_center);
    //sd = min(sd, sd_moving);
    sd = min(sd, sd_mouse);
    sd = min(sd, sd_box);
    sd = min(sd, sd_box2);
    sd = min(sd, sd_box3);
    sd = min(sd, sd_box4);
    sd = min(sd, sd_box5);
    sd = min(sd, sd_box6);
    sd = min(sd, sd_box7);
    sd = min(sd, sd_box8);
    sd = min(sd, sd_box9);

    vec3 color_center = vec3(1.0,1.0,1.0); 
    vec3 color_mouse  = vec3(0.0,0.0,0.0);
    vec3 color_moving = vec3(0.); 

    vec3 color_box    = vec3(1.0, 0.0, 0.0); // rojo
    vec3 color_box2   = vec3(1.0, 0.498, 0.0); // naranja
    vec3 color_box3   = vec3(1.0, 1.0, 0.0); // amarillo
    vec3 color_box4   = vec3(0.0, 1.0, 0.0); // verde
    vec3 color_box5   = vec3(0.0, 0.0, 1.0); // azul
    vec3 color_box6   = vec3(0.294, 0.0, 0.510); // índigo
    vec3 color_box7   = vec3(0.58, 0.0, 0.827); // violeta


    // Determinar el color del píxel actual
    if (sd == sd_center) {
        emissivity = color_center;
    } 
    else if (sd == sd_mouse) {
        emissivity = color_mouse;
    } 
    else if (sd == sd_moving) {
        emissivity = color_moving;
    } 
    else if (sd == sd_box) { // Comprobar la caja
        emissivity = color_box;
    } 
    else if (sd == sd_box2) {
        emissivity = color_box2;
    } 
    else if (sd == sd_box3) {
        emissivity = color_box3;
    }
    else if (sd == sd_box4) {
        emissivity = color_box4;
    }
    else if (sd == sd_box5) {
        emissivity = color_box5;
    }
    else if (sd == sd_box6) {
        emissivity = color_box6;
    }
    else if (sd == sd_box7) {
        emissivity = color_box7;
    }
    else if (sd == sd_box8 || sd == sd_box9) {
        emissivity = vec3(0.0);
    }


    // Aplicar emisividad solo al círculo central
    //emissivity = (sd == sd_center) ? vec3(8.0) : vec3(0.0);
    FragColor = vec4(sd , emissivity);
}