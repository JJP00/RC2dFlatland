#version 330 core
layout(points) in;
layout(triangle_strip, max_vertices = 24) out;

out vec3 rayDirection;
flat out int faceIndex;

void main() {
    // For each face of the cubemap
    for (int face = 0; face < 6; ++face) {
        faceIndex = face;
        
        // Emit a full-screen quad for this face
        // First triangle (bottom-left, top-left, bottom-right)
        gl_Layer = face; // Set the cubemap face we're rendering to
        
        // Bottom-left
        gl_Position = vec4(-1.0, -1.0, 0.0, 1.0);
        EmitVertex();
        
        // Top-left
        gl_Position = vec4(-1.0, 1.0, 0.0, 1.0);
        EmitVertex();
        
        // Bottom-right
        gl_Position = vec4(1.0, -1.0, 0.0, 1.0);
        EmitVertex();
        
        // Top-right
        gl_Position = vec4(1.0, 1.0, 0.0, 1.0);
        EmitVertex();
        
        EndPrimitive();
    }
}