#include <glad/glad.h>
#include <GLFW/glfw3.h>

#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>

#include <iostream>

#include "class/shader.hpp"
#include "common.hpp"

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

    Shader distaceProgram("../resources/vertex/shader.vert", "../resources/fragment/distance.frag");
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

    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void *)0); // vertice position
    glEnableVertexAttribArray(0);

    glBindBuffer(GL_ARRAY_BUFFER, 0);
    glBindVertexArray(0);

    // glPolygonMode(GL_FRONT_AND_BACK, GL_LINE);

    // ---------------------------------------------------------------------------------------------
    // Buffers para las pasadas
    // ---------------------------------------------------------------------------------------------

    unsigned int iChannel1, FBO;

    glGenTextures(1, &iChannel1);
    glBindTexture(GL_TEXTURE_2D, iChannel1);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA32F, SCR_WIDTH, SCR_HEIGHT, 0, GL_RGBA, GL_FLOAT, NULL);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);

    glGenFramebuffers(1, &FBO);
    glBindFramebuffer(GL_FRAMEBUFFER, FBO);
    glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, iChannel1, 0);

    if (glCheckFramebufferStatus(GL_FRAMEBUFFER) != GL_FRAMEBUFFER_COMPLETE)
        std::cout << "ERROR::FRAMEBUFFER:: Framebuffer is not complete!" << std::endl;

    while (!glfwWindowShouldClose(ventana))
    {
        // per-frame time logic
        // --------------------
        float currentFrame = static_cast<float>(glfwGetTime());
        deltaTime = currentFrame - lastFrame;
        lastFrame = currentFrame;

        // input
        // -----
        processInput(ventana, &distaceProgram, &shaderProgram);

        // render
        // ------
        glClearColor(0.1f, 0.1f, 0.1f, 1.0f);
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

        // update shader uniform
        // ---------------------
        glm::vec3 mouse = glm::vec3(float(SCR_WIDTH) / 2., float(SCR_HEIGHT) / 2., 0.0f);
        glm::vec3 resolution = glm::vec3(float(SCR_WIDTH), float(SCR_HEIGHT), 0.0f);

        // update texture size if window size changes
        if (SCR_HEIGHT != SCR_HEIGHT_PREV || SCR_WIDTH != SCR_WIDTH_PREV)
        {
            glBindTexture(GL_TEXTURE_2D, iChannel1);
            glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA32F, SCR_WIDTH, SCR_HEIGHT, 0, GL_RGBA, GL_FLOAT, NULL);
            SCR_HEIGHT_PREV = SCR_HEIGHT;
            SCR_WIDTH_PREV = SCR_WIDTH;
        }

        if (mouseInWindow && rightMouseButtonPressed)
            mouse = glm::vec3(lastX, -lastY, 1.0f);
        else
            mouse = glm::vec3(lastX, -lastY, 0.0f);

        // pass 1 - render distance field
        glBindFramebuffer(GL_FRAMEBUFFER, FBO);
        glViewport(0, 0, SCR_WIDTH, SCR_HEIGHT);

        glActiveTexture(GL_TEXTURE0);
        glBindTexture(GL_TEXTURE_2D, iChannel1);
        distaceProgram.use();

        distaceProgram.setVec3("iResolution", resolution);
        distaceProgram.setFloat("iTime", currentFrame);
        distaceProgram.setFloat("iTimeDelta", deltaTime);
        distaceProgram.setVec3("iMouse", mouse);

        drawscreen(VAO);

        // pass 2 - render final image color pallete
        glBindFramebuffer(GL_FRAMEBUFFER, 0);
        glViewport(0, 0, SCR_WIDTH, SCR_HEIGHT);

        glActiveTexture(GL_TEXTURE0);
        glBindTexture(GL_TEXTURE_2D, iChannel1);

        shaderProgram.use();

        shaderProgram.setVec3("iResolution", resolution);
        shaderProgram.setFloat("iTime", currentFrame);
        shaderProgram.setFloat("iTimeDelta", deltaTime);
        shaderProgram.setVec3("iMouse", mouse);

        drawscreen(VAO);

        // glfw: swap buffers and poll IO events (keys pressed/released, mouse moved etc.)
        // -------------------------------------------------------------------------------
        glfwSwapBuffers(ventana);
        glfwPollEvents();
    }

    glDeleteVertexArrays(1, &VAO);
    glDeleteBuffers(1, &VBO);
    glDeleteBuffers(1, &EBO);
    glDeleteFramebuffers(1, &FBO);
    distaceProgram.deleteProgram();
    shaderProgram.deleteProgram();
    glDeleteTextures(1, &iChannel1);

    glfwTerminate();
    return 0;
}