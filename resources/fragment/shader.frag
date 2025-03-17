out vec4 FragColor;

uniform samplerCube iChannel0;

uniform vec3 iResolution;           // viewport resolution (in pixels)
uniform float iTime;                // shader playback time (in seconds)
uniform float iTimeDelta;           // render time (in seconds)
uniform vec3 iMouse;                // mouse pixel coords. xy: current (if MLB down), zw: click

void main()
{
    ivec2 viewport_size = ivec2(iResolution.xy);
    ivec2 face_size = textureSize(iChannel0, 0);
    
    vec2 screen_pos = gl_FragCoord.xy / vec2(viewport_size);
    CascadeSize c0_size = GetC0Size(viewport_size);
    int src_cascade_index = 0;
    
    CascadeSize cascade_size = GetCascadeSize(src_cascade_index, c0_size);
    
    BilinearSamples bilinear_samples = GetProbeBilinearSamples(screen_pos, src_cascade_index, c0_size);
    vec4 weights = GetBilinearWeights(bilinear_samples.ratio);
    
    vec4 fluence = vec4(0.0f);
    for(int dir_index = 0; dir_index < cascade_size.dirs_count; dir_index++)
    {
       
        vec4 c_minus1_radiance = vec4(vec3(0.0f), 1.0f);

        vec4 c0_radiance = vec4(0.0f);
        for(int i = 0; i < 4; i++)
        {
            ProbeLocation probe_location;
            probe_location.cascade_index = src_cascade_index;
            probe_location.probe_index = clamp(bilinear_samples.base_index + GetBilinearOffset(i), ivec2(0), cascade_size.probes_count- ivec2(1));
            probe_location.dir_index = dir_index;
            
            int pixel_index = ProbeLocationToPixelIndex(probe_location, c0_size);
            ivec3 texel_index = PixelIndexToCubemapTexel(face_size, pixel_index);
            
            vec4 src_radiance = cubemapFetch(iChannel0, texel_index.z, texel_index.xy);
            
            c0_radiance += src_radiance * weights[i];
        }
        fluence += MergeIntervals(c_minus1_radiance, c0_radiance) / float(cascade_size.dirs_count);
    }
    FragColor = vec4(1.0 - 1.0 / pow(1.0 + fluence.rgb, vec3(2.5)), 1.0);
}