#version 330 core

// Number of cascades all together
const int nCascades = 6;

// Brush radius used for drawing, measured as fraction of iResolution.y
const float brushRadius = 0.02;

const float MAX_FLOAT = uintBitsToFloat(0x7f7fffffu);
const float PI = 3.1415927;
const float MAGIC = 1e25;

float sdCircle(vec2 p, vec2 c, float r) {
    return distance(p, c) - r;
}

float sdBox( in vec2 p, in vec2 b )
{
    vec2 d = abs(p)-b;
    return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}

float sdOrientedBox( in vec2 p, in vec2 a, in vec2 b, float th )
{
    float l = length(b-a);
    // Evitar división por cero si a y b son iguales
    if (l < 0.0001) return length(p-a)-th*0.5;
    vec2  d = (b-a)/l;
    vec2  q = (p-(a+b)*0.5);
          // Rotación para alinear la caja con los ejes
          q = mat2(d.x, d.y, -d.y, d.x) * q; // Corregido orden de matriz de rotación
          // q = mat2(d.x,-d.y,d.y,d.x)*q; // Esta es la transpuesta, usar la de arriba
          q = abs(q)-vec2(l,th)*0.5;
    return length(max(q,vec2(0.0))) + min(max(q.x,q.y),0.0);
}