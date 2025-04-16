# Proyecto RC2dFlatland - Español

Proyecto simple para estudiar los fundamentos de Radiance Cascades. Fork directo de mi proyecto de OpenGL.

El algoritmo es similar al que implementó el **Yaazarai** pero adaptado a mi propio motor en OpenGL. De hecho, es el mismo pipeline donde primero calculo las distancias de una escena, en mi caso, esta hardcodeado en el shader **distance.frag**.

Luego, entra en un loop donde calculo el resultado de cada cascada (renderizado ping pong).
El resultado de la pasada anterior es leída y procesada por la pasada actual para que una vez más se le de a la siguiente pasada.

Finalmente, en el **main.frag** dibujo en pantalla la última pasada del shader.

## Controles

- R: recompila los shaders
- Mouse: Mover el circulo

## Proceso

El proyecto de Radiance cascade se va ha dejar en este punto, implementado ya la solución bilinear.

En la siguiente figura muestro un experimento frecuente cuando se implementa RC.

![image](https://raw.githubusercontent.com/JJP00/RC2dFlatland/refs/heads/main/Resultados/RC_bilinearFix_Pinhole.png)

## Enlaces y referencias

- Radiance Cascades: A Novel Approach to Calculating Global - <https://drive.google.com/file/d/1L6v1_7HY2X-LV3Ofb6oyTIxgEaP4LOI6/view>
- GMShaders Radiance Cascade - <https://github.com/Yaazarai/GMShaders-Radiance-Cascades>
- Radiance Cascades por fad - <https://www.shadertoy.com/view/mtlBzX>
- LearnOpenGL - <https://learnopengl.com/>
- Documentación OpenGL - <https://www.khronos.org/opengl/>

## Librerías necesarias para la compilación

- glad <https://glad.dav1d.de/>
- GLFW <https://www.glfw.orgglm>
- glm <https://github.com/g-truc/glm>
- STB_IMAGE <https://github.com/nothings/stb/blob/master/stb_image.h>

# RC2dFlatland project - English

Simple project to study the basics of Radiance Cascades. Fork directly from my OpenGL project.

The algorithm is similar to the one implemented by **Yaazarai** but adapted to my own OpenGL engine. In fact, it is the same pipeline where I first calculate the distances of a scene, in my case, it is hardcoded in the **distance.frag**.

Then, it enters in a loop where I calculate the result of each cascade (ping pong rendering).
The result of the previous pass is read and processed by the current pass so that once again it is given to the next pass.

Finally, in the **main.frag** I draw on screen the last pass of the shader.

Translated with DeepL.com (free version)

## Controls

- R: recompile the shaders
- Mouse : Moves the circle

## Process

I will leave this Radiance cascade project at this point, I already implemented bilinear fix.

In the next figure, it shows a common experiment when implementing RC.

![image](https://raw.githubusercontent.com/JJP00/RC2dFlatland/refs/heads/main/Resultados/RC_bilinearFix_Pinhole.png)

## Links and references

- Radiance Cascades: A Novel Approach to Calculating Global - <https://drive.google.com/file/d/1L6v1_7HY2X-LV3Ofb6oyTIxgEaP4LOI6/view>
- GMShaders Radiance Cascade - <https://github.com/Yaazarai/GMShaders-Radiance-Cascades>
- Radiance Cascades by fad - <https://www.shadertoy.com/view/mtlBzX>
- LearnOpenGL - <https://learnopengl.com/>
- OpenGL documentation - <https://www.khronos.org/opengl/>

## Libraries needed for compilation

- glad <https://glad.dav1d.de/>
- GLFW <https://www.glfw.orgglm>
- glm <https://github.com/g-truc/glm>
- STB_IMAGE <https://github.com/nothings/stb/blob/master/stb_image.h>
