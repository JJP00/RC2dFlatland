out vec4 FragColor;

in vec3 rayDirection;
flat in int faceIndex;

uniform vec3 iResolution;           // viewport resolution (in pixels)
uniform float iTime;                // shader playback time (in seconds)
uniform float iTimeDelta;           // render time (in seconds)
uniform vec3 iMouse;                // mouse pixel coords. xy: current (if MLB down), zw: click

uniform samplerCube iChannel0;
uniform sampler2D iChannel1;

vec4 CastMergedIntervalBilinearFix(vec2 screen_pos, vec2 dir, vec2 interval_length, int prev_cascade_index, int prev_dir_index)
{
    ivec2 face_size = textureSize(iChannel0, 0);
    ivec2 viewport_size = textureSize(iChannel1, 0);
    CascadeSize c0_size = GetC0Size(viewport_size);
    CascadeSize prev_cascade_size = GetCascadeSize(prev_cascade_index, c0_size);

    BilinearSamples bilineal_samples = GetProbeBilinearSamples(screen_pos, prev_cascade_index, c0_size);
    vec4 weights = GetBilinearWeights(bilineal_samples.ratio);
    vec4 merged_inteval = vec4(0.0f);
    for (int i = 0; i < 4; i++)
    {
        ProbeLocation prev_probe_location;
        prev_probe_location.cascade_index = prev_cascade_index;
        prev_probe_location.probe_index = clamp(bilineal_samples.base_index + GetBilinearOffset(i), ivec2(0), prev_cascade_size.probes_count - ivec2(1));
        prev_probe_location.dir_index = prev_dir_index;

        int pixel_index = ProbeLocationToPixelIndex(prev_probe_location, c0_size);
        ivec3 texel_index = PixelIndexToCubemapTexel(face_size, pixel_index);

        vec4 prev_interval = vec4(0.0f, 0.0f, 0.0f, 1.0f);
        if(prev_cascade_index < nCascades)
            prev_interval = cubemapFetch(iChannel0, texel_index.z, texel_index.xy);

        vec2 prev_screen_pos = GetProbeScreenPos(vec2(prev_probe_location.probe_index), prev_probe_location.cascade_index, c0_size);

        vec2 ray_start = screen_pos * vec2(viewport_size) + dir * interval_length.x;
        vec2 ray_end = prev_screen_pos * vec2(viewport_size) + dir * interval_length.y;

        RayHit  ray_hit = radiance(iChannel1, ray_start, normalize(ray_end - ray_start), length(ray_end - ray_start));
        merged_inteval += MergeIntervals(ray_hit.radiance, prev_interval) * weights[i];
    }
    return merged_inteval;
}

vec4 mainCubemap(vec2 fragCoord, vec3 fragRO, vec3 fragRD)
{
    vec4 fragColor = vec4(0.0f);
	// Calculate the index for this cubemap texel
    int face;
    if (abs(fragRD.x) > abs(fragRD.y) && abs(fragRD.x) > abs(fragRD.z)) {
        face = fragRD.x > 0.0 ? 0 : 1;
    } else if (abs(fragRD.y) > abs(fragRD.z)) {
        face = fragRD.y > 0.0 ? 2 : 3;
    } else {
        face = fragRD.z > 0.0 ? 4 : 5;
    }

    ivec2 face_size =  textureSize(iChannel0, 0);

    
    ivec2 face_pixel = ivec2(fragCoord.xy);
    int face_index = face;
    int pixel_index =  face_pixel.x + face_pixel.y * face_size.x + face_index * (face_size.x * face_size.y);

    //obtener la cascada

    ivec2 viewport_size = textureSize(iChannel1, 0);
    CascadeSize c0_size = GetC0Size(viewport_size);
    ProbeLocation probe_location = PixelIndexToProbeLocation(pixel_index, c0_size);

    if(probe_location.cascade_index >= nCascades)
    {
        fragColor = vec4(0.0f,0.0f,0.0f,1.0f);
        return fragColor;
    }

    vec2 interval_overlap = vec2(1.0f,1.0f);

    vec2 interval_length = GetCascadeIntervalScale(probe_location.cascade_index) * GetC0IntervalLength(viewport_size) * interval_overlap;
    CascadeSize cascade_size = GetCascadeSize(probe_location.cascade_index, c0_size);
    int prev_cascade_index = probe_location.cascade_index + 1;
    CascadeSize prev_cascade_size = GetCascadeSize(prev_cascade_index, c0_size);

    vec2 screen_pos = GetProbeScreenPos(vec2(probe_location.probe_index), probe_location.cascade_index, c0_size);

    int avg_dirs_count = prev_cascade_size.dirs_count / cascade_size.dirs_count;

    vec4 merged_avg_interval = vec4(0.0f);
    
    //logica de merge

    for(int dir_number = 0; dir_number < avg_dirs_count ; dir_number++)
    {
        int prev_dir_index = probe_location.dir_index * avg_dirs_count + dir_number;
        vec2 ray_dir = GetProbeDir(float(prev_dir_index), prev_cascade_size.dirs_count);

        vec4 merged_inteval = CastMergedIntervalBilinearFix(screen_pos, ray_dir, interval_length, prev_cascade_index, prev_dir_index);

        merged_avg_interval += merged_inteval / float(avg_dirs_count);
    }
    fragColor = merged_avg_interval;
    return fragColor;
}

void main() {
    vec2 uv = gl_FragCoord.xy / vec2(textureSize(iChannel1, 0)) * 2.0 - 1.0;
    
    // Determine ray direction based on which face we're rendering
    vec3 ray_dir;
    switch (faceIndex) {
    case 0: ray_dir = vec3(+1.0, -uv.y, -uv.x); break; // right
    case 1: ray_dir = vec3(-1.0, -uv.y, +uv.x); break; // left
    case 2: ray_dir = vec3(+uv.x, +1.0, +uv.y); break; // up
    case 3: ray_dir = vec3(+uv.x, -1.0, -uv.y); break; // down
    case 4: ray_dir = vec3(+uv.x, -uv.y, +1.0); break; // front
    case 5: ray_dir = vec3(-uv.x, -uv.y, -1.0); break; // back
    }
    ray_dir = normalize(ray_dir);
    
    // Call your existing mainCubemap function
    vec4 result;
    result = mainCubemap(gl_FragCoord.xy, vec3(0.0), ray_dir);
    FragColor = vec4(1.0,1.,1.,1.);
}