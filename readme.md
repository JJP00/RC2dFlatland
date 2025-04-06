# Proyecto RC2dFlatland - Español

Proyecto simple para estudiar los fundamentos de Radiance Cascades. Fork directo de mi proyecto de OpenGL.

El algoritmo es similar al que implementó el **Yaazarai** pero adaptado a mi propio motor en OpenGL. De hecho, es el mismo pipeline donde primero calculo las distancias de una escena, en mi caso, esta hardcodeado en el shader **distance.frag** con una luz en el centro y 2 obstáculos: uno dando vueltas y otro controlado por el ratón.

Luego, entra en un loop donde calculo el resultado de cada cascada (renderizado ping pong).
El resultado de la pasada anterior es leída y procesada por la pasada actual para que una vez más se le de a la siguiente pasada.

Finalmente, en el **main.frag** dibujo en pantalla la última pasada del shader.

## Controles

- R: recompila los shaders
- Mouse: Mover el circulo

## Proceso

Se ha implementado la versión vanilla de RC, es decir, con artefactos como un anillo rodeando la luz y algún que otro error que no he podido identificar.

La idea es continuar estudiando diferentes soluciones y eventualmente pasar al 3D.

<img src="Resultados\RC_Vanilla.png" width=640 height=480>

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

The algorithm is similar to the one implemented by **Yaazarai** but adapted to my own OpenGL engine. In fact, it is the same pipeline where I first calculate the distances of a scene, in my case, it is hardcoded in the **distance.frag** shader with a light in the center and 2 obstacles: one going around and the other controlled by the mouse.

Then, it enters in a loop where I calculate the result of each cascade (ping pong rendering).
The result of the previous pass is read and processed by the current pass so that once again it is given to the next pass.

Finally, in the **main.frag** I draw on screen the last pass of the shader.

Translated with DeepL.com (free version)

## Controls

- R: recompile the shaders
- Mouse : Moves the circle

## Process

The vanilla version of RC has been implemented, i.e. with artifacts such as a ring around the light and some other bugs that I have not been able to identify.

The idea is to continue studying different solutions and eventually move to 3D.

<img src="Resultados\RC_Vanilla.png" width=640 height=480>

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
