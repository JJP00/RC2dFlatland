#include <glad/glad.h>
#include <GLFW/glfw3.h>
#define STB_IMAGE_IMPLEMENTATION
#include <STB_IMAGE/stb_image.h>

#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>

#include "class/camera.hpp"
#include "class/shader.hpp"

#include <iostream>

// settings
unsigned int SCR_WIDTH = 800;
unsigned int SCR_HEIGHT = 600;

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
bool flashlightKeyPressed;
unsigned int loops;

// ---------------------------------------------------------------------------------------------
// callback por si se redimensiona la ventana
// ---------------------------------------------------------------------------------------------

void framebuffer_size_callback(GLFWwindow *window, int width, int height)
{
    SCR_WIDTH = width;
    SCR_HEIGHT = height;
    glViewport(0, 0, width, height);
}

// ---------------------------------------------------------------------------------------------
// proceso que lee la entrada de teclas
// ---------------------------------------------------------------------------------------------

void processInput(GLFWwindow *window)
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

    if (glfwGetKey(window, GLFW_KEY_F) == GLFW_PRESS)
    {
        if (!flashlightKeyPressed)
        {
            flashlight = !flashlight;
            flashlightKeyPressed = true;
        }
    }
    else
    {
        flashlightKeyPressed = false;
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

// ---------------------------------------------------------------------------------------------
// funcion que lee la entrada de la rueda del raton
// ---------------------------------------------------------------------------------------------

void scroll_callback(GLFWwindow *window, double xoffset, double yoffset)
{
    camera.ProcessMouseScroll(static_cast<float>(yoffset));
}

void screenPos_callback(GLFWwindow *window, int xpos, int ypos)
{
    std::cout << "Posicion de la ventana: " << xpos << " " << ypos << std::endl;
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

int main(void)
{
    /* Initialize the library */
    if (!glfwInit())
        return -1;

    // Inicializar la version de opengl
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

    // Definicion de la ventana GLFW -> libreria que maneja ventanas
    GLFWwindow *ventana = glfwCreateWindow(SCR_WIDTH, SCR_HEIGHT, "Primerita ventanita jiji uwu", NULL, NULL);

    // setup de las entradas que va a leer la ventana
    glfwSetInputMode(ventana, GLFW_CURSOR, GLFW_CURSOR_NORMAL);
    glfwSetCursorPosCallback(ventana, mouse_callback);
    glfwSetScrollCallback(ventana, scroll_callback);
    glfwSetCursorEnterCallback(ventana, cursor_enter_callback);
    glfwSetMouseButtonCallback(ventana, mouse_button_callback);
    glfwSetWindowPosCallback(ventana, screenPos_callback);
    // un callback por si se redimensiona la ventana
    glfwSetFramebufferSizeCallback(ventana, framebuffer_size_callback);

    if (ventana == NULL)
    {
        std::cout << "No se ha creado la ventana correctamente" << std::endl;
        glfwTerminate;
        return -1;
    }
    glfwMakeContextCurrent(ventana);

    glfwGetWindowPos(ventana, &windowPosX, &windowPosY);
    std::cout << "Posicion de la ventana: " << windowPosX << " " << windowPosY << std::endl;

    // iniciar glad
    if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress))
    {
        std::cout << "Fallo al iniciar GLAD" << std::endl;
        return -1;
    }

    glEnable(GL_DEPTH_TEST);

    Shader shaderProgram("../resources/vertex/shader.vert", "../resources/fragment/shader.frag");

    float vertices[] = {
        1.0f, 1.0f, 0.0f,   // top right
        1.0f, -1.0f, 0.0f,  // bottom right
        -1.0f, -1.0f, 0.0f, // bottom left
        -1.0f, 1.0f, 0.0f   // top left
    };

    unsigned int indices[] = {
        // note that we start from 0!
        0, 1, 3, // first Triangle
        1, 2, 3  // second Triangle
    };

    // ---------------------------------------------------------------------------------------------
    // VAO y VBO
    // ---------------------------------------------------------------------------------------------

    // first, configure the cube's VAO (and VBO)
    unsigned int VBO, VAO, EBO;
    glGenVertexArrays(1, &VAO);
    glGenBuffers(1, &VBO);
    glGenBuffers(1, &EBO);

    glBindVertexArray(VAO);

    glBindBuffer(GL_ARRAY_BUFFER, VBO);
    glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, EBO);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW);

    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void *)0);
    glEnableVertexAttribArray(0);

    glBindBuffer(GL_ARRAY_BUFFER, 0);
    glBindVertexArray(0);

    // glPolygonMode(GL_FRONT_AND_BACK, GL_LINE);

    while (!glfwWindowShouldClose(ventana))
    {
        // per-frame time logic
        // --------------------
        float currentFrame = static_cast<float>(glfwGetTime());
        deltaTime = currentFrame - lastFrame;
        lastFrame = currentFrame;

        // input
        // -----
        processInput(ventana);

        // render
        // ------
        glClearColor(0.1f, 0.1f, 0.1f, 1.0f);
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

        // update shader uniform
        // ---------------------
        glm::vec3 mouse = glm::vec3(float(SCR_WIDTH) / 2., float(SCR_HEIGHT) / 2., 0.0f);
        glm::vec3 resolution = glm::vec3(float(SCR_WIDTH), float(SCR_HEIGHT), 0.0f);

        if (mouseInWindow && rightMouseButtonPressed)
            mouse = glm::vec3(lastX, -lastY, 1.0f);
        else
            mouse = glm::vec3(lastX, -lastY, 0.0f);

        shaderProgram.setVec3("iResolution", resolution);
        // std::cout << "iResolution: " << resolution.x << " " << resolution.y << " " << resolution.z << std::endl;
        shaderProgram.setFloat("iTime", currentFrame);
        // std::cout << "iTime: " << currentFrame << std::endl;
        shaderProgram.setFloat("iTimeDelta", deltaTime);
        // std::cout << "iTimeDelta: " << deltaTime << std::endl;
        shaderProgram.setVec3("iMouse", mouse);
        // std::cout << "iMouse: " << mouse.x << " " << mouse.y << " " << mouse.z << std::endl;

        // render the cube
        shaderProgram.use();
        glBindVertexArray(VAO);
        glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);

        // glfw: swap buffers and poll IO events (keys pressed/released, mouse moved etc.)
        // -------------------------------------------------------------------------------
        glfwSwapBuffers(ventana);
        glfwPollEvents();
    }

    glDeleteVertexArrays(1, &VAO);
    glDeleteBuffers(1, &VBO);
    glDeleteBuffers(1, &EBO);

    glfwTerminate();
    return 0;
}