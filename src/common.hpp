#ifndef COMMON_HPP
#define COMMON_HPP

#include <glad/glad.h>
#include <iostream>

#include "class/camera.hpp"

// settings
extern unsigned int SCR_WIDTH;
extern unsigned int SCR_HEIGHT;
extern unsigned int SCR_WIDTH_PREV;
extern unsigned int SCR_HEIGHT_PREV;

// Camera
extern Camera camera;
extern float lastX;
extern float lastY;
extern bool firstMouse;
extern bool mouseInWindow;
extern bool rightMouseButtonPressed;

// ventana
extern int windowPosX;
extern int windowPosY;

// timing
extern float deltaTime;
extern float lastFrame;

// ---------------------------------------------------------------------------------------------
// dibujar pantalla
// ---------------------------------------------------------------------------------------------

void drawscreen(unsigned int VAO);

// ---------------------------------------------------------------------------------------------
// funcion de cargar imagenes
// ---------------------------------------------------------------------------------------------

unsigned int loadTexture(char const *path);

// ---------------------------------------------------------------------------------------------
// callback por si se redimensiona la ventana
// ---------------------------------------------------------------------------------------------

void framebuffer_size_callback(GLFWwindow *window, int width, int height);

// ---------------------------------------------------------------------------------------------
// Callback para la posicion de la ventana
// ---------------------------------------------------------------------------------------------

void screenPos_callback(GLFWwindow *window, int xpos, int ypos);

// ---------------------------------------------------------------------------------------------
// proceso que lee la entrada de teclas
// ---------------------------------------------------------------------------------------------

void processInput(GLFWwindow *window);

// ---------------------------------------------------------------------------------------------
// Funcción que lee la entrada del raton
// ---------------------------------------------------------------------------------------------

void mouse_callback(GLFWwindow *window, double xpos, double ypos);

void cursor_enter_callback(GLFWwindow *window, int entered);

void mouse_button_callback(GLFWwindow *window, int button, int action, int mods);

void scroll_callback(GLFWwindow *window, double xoffset, double yoffset);

#endif