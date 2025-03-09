#include "common.hpp"

#define STB_IMAGE_IMPLEMENTATION
#include <STB_IMAGE/stb_image.h>

// settings
unsigned int SCR_WIDTH = 1280;
unsigned int SCR_HEIGHT = 720;
unsigned int SCR_WIDTH_PREV = 1280;
unsigned int SCR_HEIGHT_PREV = 720;

// Camera
Camera camera(glm::vec3(0.0f, 0.0f, 3.0f));
float lastX = SCR_WIDTH / 2.0f;
float lastY = SCR_HEIGHT / 2.0f;
bool firstMouse = true;
bool mouseInWindow = false;
bool rightMouseButtonPressed = false;

// ventana
int windowPosX = 0;
int windowPosY = 0;

// timing
float deltaTime = 0.0f; // time between current frame and last frame
float lastFrame = 0.0f;

// iluminacion
glm::vec3 lightPos(1.2f, 1.0f, 2.0f);
bool flashlight = false;

// ---------------------------------------------------------------------------------------------
// dibujar pantalla
// ---------------------------------------------------------------------------------------------

void drawscreen(unsigned int VAO)
{
    glBindVertexArray(VAO);
    glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);
}

// ---------------------------------------------------------------------------------------------
// funcion de cargar imagenes
// ---------------------------------------------------------------------------------------------

unsigned int loadTexture(char const *path)
{
    unsigned int TextureId;
    glGenTextures(1, &TextureId);

    int width, height, nrComponents;
    unsigned char *data = stbi_load(path, &width, &height, &nrComponents, 0);
    if (data)
    {
        GLenum format;
        if (nrComponents == 1)
            format = GL_RED;
        else if (nrComponents == 3)
            format = GL_RGB;
        else if (nrComponents == 4)
            format = GL_RGBA;

        glBindTexture(GL_TEXTURE_2D, TextureId);
        glTexImage2D(GL_TEXTURE_2D, 0, format, width, height, 0, format, GL_UNSIGNED_BYTE, data);
        glGenerateMipmap(GL_TEXTURE_2D);

        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

        stbi_image_free(data);
    }
    else
    {
        std::cout << "Texture failed to load at path: " << path << std::endl;
        stbi_image_free(data);
    }

    return TextureId;
}

// ---------------------------------------------------------------------------------------------
// callback por si se redimensiona la ventana
// ---------------------------------------------------------------------------------------------

void framebuffer_size_callback(GLFWwindow *window, int width, int height)
{
    SCR_WIDTH = width;
    SCR_HEIGHT = height;
    glViewport(0, 0, width, height);
}

void screenPos_callback(GLFWwindow *window, int xpos, int ypos)
{
    std::cout << "Posicion de la ventana: " << xpos << " " << ypos << std::endl;
}

// ---------------------------------------------------------------------------------------------
// proceso que lee la entrada de teclas
// ---------------------------------------------------------------------------------------------

void processInput(GLFWwindow *window, Shader *shader, Shader *shader2)
{
    float cameraSpeed = 2.5f * deltaTime;
    if (glfwGetKey(window, GLFW_KEY_ESCAPE) == GLFW_PRESS)
        glfwSetWindowShouldClose(window, true);

    if (glfwGetKey(window, GLFW_KEY_W) == GLFW_PRESS)
        camera.ProcessKeyboard(FORWARD, deltaTime);
    if (glfwGetKey(window, GLFW_KEY_S) == GLFW_PRESS)
        camera.ProcessKeyboard(BACKWARD, deltaTime);
    if (glfwGetKey(window, GLFW_KEY_A) == GLFW_PRESS)
        camera.ProcessKeyboard(LEFT, deltaTime);
    if (glfwGetKey(window, GLFW_KEY_D) == GLFW_PRESS)
        camera.ProcessKeyboard(RIGHT, deltaTime);
    if (glfwGetKey(window, GLFW_KEY_SPACE) == GLFW_PRESS)
        camera.ProcessKeyboard(UP, deltaTime);
    if (glfwGetKey(window, GLFW_KEY_LEFT_SHIFT) == GLFW_PRESS)
        camera.ProcessKeyboard(DONW, deltaTime);
    if (glfwGetKey(window, GLFW_KEY_R) == GLFW_PRESS)
    {
        shader->recompile();
        shader2->recompile();
    }
}

// ---------------------------------------------------------------------------------------------
// Funcción que lee la entrada del raton
// ---------------------------------------------------------------------------------------------

void mouse_callback(GLFWwindow *window, double xpos, double ypos)
{
    if (firstMouse) // initially set to true
    {
        lastX = xpos;
        lastY = ypos;
        firstMouse = false;
    }

    float xoffset = xpos - lastX;
    float yoffset = lastY - ypos; // reversed since y-coordinates range from bottom to top
    lastX = xpos;
    lastY = ypos - SCR_HEIGHT;

    camera.ProcessMouseMovement(xoffset, yoffset);
}

void cursor_enter_callback(GLFWwindow *window, int entered)
{
    std::cout << "Cursor entered: " << entered << std::endl;
    mouseInWindow = entered;
}

void mouse_button_callback(GLFWwindow *window, int button, int action, int mods)
{
    if (button == GLFW_MOUSE_BUTTON_LEFT)
    {
        // Actualizar el estado cuando se pulsa o se suelta el botón derecho
        if (action == GLFW_PRESS)
        {
            rightMouseButtonPressed = true;
            std::cout << "Mouse button right pressed" << std::endl;
        }
        else if (action == GLFW_RELEASE)
        {
            rightMouseButtonPressed = false;
            std::cout << "Mouse button right released" << std::endl;
        }
    }
}

void scroll_callback(GLFWwindow *window, double xoffset, double yoffset)
{
    camera.ProcessMouseScroll(static_cast<float>(yoffset));
}