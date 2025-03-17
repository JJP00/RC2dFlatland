#version 330 core

#define MERGE_FIX 1
#define C_MINUS1_GATHERING 1
// Number of cascades all together
const int nCascades = 6;

// Brush radius used for drawing, measured as fraction of iResolution.y
const float brushRadius = 0.02;

const float MAX_FLOAT = uintBitsToFloat(0x7f7fffffu);
const float PI = 3.1415927;
const float MAGIC = 1e25;

#define probe_center vec2(0.5f)

#define BRANCHING_FACTOR 2

#define SPATIAL_SCALE_FACTOR 1

struct CascadeSize {
    ivec2 probes_count;  // Number of probes in this cascade 
    int dirs_count;    // Number of directions in this cascade
};

struct ProbeLocation
{
    ivec2 probe_index;
    int dir_index;
    int cascade_index;
};

struct BilinearSamples
{
    ivec2 base_index;
    vec2 ratio;
};

struct RayHit
{
    vec4 radiance;
    float dist;
};

vec2 screenRes;

CascadeSize GetC0Size(ivec2 viewport_size) 
{
    CascadeSize c0_size;
    c0_size.probes_count = ivec2(512) * ivec2(1, viewport_size.y) / ivec2(1, viewport_size.x);//viewport_size / 10;
    c0_size.dirs_count = 4;
    return c0_size;
}

float GetC0IntervalLength(ivec2 viewport_size) 
{
    return float(viewport_size.x) * 0.5f * 1e-3f;
}

vec4 cubemapFetch(samplerCube sampler, int face, ivec2 P) {
    // Look up a single texel in a cubemap
    ivec2 cubemapRes = textureSize(sampler, 0);
    if (clamp(P, ivec2(0), cubemapRes - 1) != P || face < 0 || face > 5) {
        return vec4(0.0);
    }

    vec2 p = (vec2(P) + 0.5) / vec2(cubemapRes) * 2.0 - 1.0;
    vec3 c;
    
    switch (face) {
        case 0: c = vec3( 1.0, -p.y, -p.x); break;
        case 1: c = vec3(-1.0, -p.y,  p.x); break;
        case 2: c = vec3( p.x,  1.0,  p.y); break;
        case 3: c = vec3( p.x, -1.0, -p.y); break;
        case 4: c = vec3( p.x, -p.y,  1.0); break;
        case 5: c = vec3(-p.x, -p.y, -1.0); break;
    }
    
    return texture(sampler, normalize(c));
}

float GetCascadeIntervalStartScale(int cascade_index)
{
        return (cascade_index == 0 ? 0.0f : float(1 << (2 * cascade_index))) + float(C_MINUS1_GATHERING);
}

vec2 GetCascadeIntervalScale(int cascade_index)
{
    return vec2(GetCascadeIntervalStartScale(cascade_index), GetCascadeIntervalStartScale(cascade_index + 1));
}

vec4 GetBilinearWeights(vec2 ratio)
{
    return vec4(
        (1.0f - ratio.x) * (1.0f - ratio.y),
        ratio.x * (1.0f - ratio.y),
        (1.0f - ratio.x) * ratio.y,
        ratio.x * ratio.y);
}

ivec2 GetBilinearOffset(int offset_index)
{
    ivec2 offsets[4] = ivec2[4](ivec2(0, 0), ivec2(1, 0), ivec2(0, 1), ivec2(1, 1));
    return offsets[offset_index];
}

BilinearSamples GetBilinearSamples(vec2 pixel_index2f)
{
    BilinearSamples samples;
    samples.base_index = ivec2(floor(pixel_index2f));
    samples.ratio = fract(pixel_index2f);
    return samples;
}

CascadeSize GetCascadeSize(int cascade_index, CascadeSize c0_size)
{
    CascadeSize cascade_size;
    cascade_size.probes_count = max(ivec2(1), c0_size.probes_count >> (SPATIAL_SCALE_FACTOR * cascade_index));
    cascade_size.dirs_count = c0_size.dirs_count * (1 << (BRANCHING_FACTOR * cascade_index));
    return cascade_size;
}

int GetCascadeLinearOffset(int cascade_index, CascadeSize c0_size)
{
    int c0_pixel_count = c0_size.probes_count.x * c0_size.probes_count.y * c0_size.dirs_count;
    int offset = 0;

    for(int i = 0; i < cascade_index; i++)
    {
        CascadeSize cascade_size = GetCascadeSize(i, c0_size);
        offset += cascade_size.probes_count.x * cascade_size.probes_count.y * cascade_size.dirs_count;
    }
    return offset;  
}

ProbeLocation PixelIndexToProbeLocation(int pixel_index, CascadeSize c0_size)
{
    ProbeLocation probe_location;

    for(
        probe_location.cascade_index = 0;
        GetCascadeLinearOffset(probe_location.cascade_index + 1, c0_size) <= pixel_index && probe_location.cascade_index < 10;
        probe_location.cascade_index++);

    int offset_in_cascade = pixel_index - GetCascadeLinearOffset(probe_location.cascade_index, c0_size);
    CascadeSize cascade_size = GetCascadeSize(probe_location.cascade_index, c0_size);
    
    probe_location.dir_index = offset_in_cascade % cascade_size.dirs_count;
    int probe_linear_index = offset_in_cascade / cascade_size.dirs_count;
    probe_location.probe_index = ivec2(probe_linear_index % cascade_size.probes_count.x, probe_linear_index / cascade_size.probes_count.x);
    return probe_location;
}

int ProbeLocationToPixelIndex(ProbeLocation probe_location, CascadeSize c0_size)
{
    CascadeSize cascade_size = GetCascadeSize(probe_location.cascade_index, c0_size);
    int probe_lineal_index = probe_location.probe_index.x + probe_location.probe_index.y * cascade_size.probes_count.x;
    int offset_in_cascade = probe_lineal_index * cascade_size.dirs_count + probe_location.dir_index;
    return GetCascadeLinearOffset(probe_location.cascade_index, c0_size) + offset_in_cascade ;
}

ivec3 PixelIndexToCubemapTexel(ivec2 face_size, int pixel_index)
{
    int face_pixels_count = face_size.x * face_size.y;
    int face_index = pixel_index / face_pixels_count;
    int face_pixel_index = pixel_index - face_pixels_count * face_index;
    ivec2 face_pixel = ivec2(face_pixel_index % face_size.x , face_pixel_index / face_size.x);

    return ivec3(face_pixel, face_index); 
}

vec2 GetProbeScreenSize(int cascade_index, CascadeSize c0_size)
{
    vec2 c0_probe_screen_size = vec2(1.0f) / vec2(c0_size.probes_count);
    return c0_probe_screen_size * float(1 << (SPATIAL_SCALE_FACTOR * cascade_index));
}

BilinearSamples GetProbeBilinearSamples(vec2 screen_pos, int cascade_index, CascadeSize c0_size)
{
    vec2 probe_screen_size = GetProbeScreenSize(cascade_index, c0_size);

    vec2 prev_probe_index2f = screen_pos / probe_screen_size - probe_center;
    return GetBilinearSamples(prev_probe_index2f);
}

vec2 GetProbeScreenPos(vec2 probe_index2f, int cascade_index, CascadeSize c0_size)
{
    vec2 probe_screen_size = GetProbeScreenSize(cascade_index, c0_size);
    
    return (probe_index2f + probe_center) * probe_screen_size;
}

vec2 GetProbeDir(float dir_indexf, int dirs_count)
{
    float ang_ratio = (dir_indexf + 0.5f) / float(dirs_count);
    float ang = ang_ratio * 2.0f * PI;
    return vec2(cos(ang), sin(ang));
}

vec4 MergeIntervals(vec4 near_interval, vec4 far_interval)
{
    return vec4(near_interval.rgb + near_interval.a * far_interval.rgb, near_interval.a * far_interval.a);
}

float sdOrientedBox( in vec2 p, in vec2 a, in vec2 b, float th )
{
    float l = length(b-a);
    vec2  d = (b-a)/l;
    vec2  q = p-(a+b)*0.5;
          q = mat2(d.x,-d.y,d.y,d.x)*q;
          q = abs(q)-vec2(l*0.5,th);
    return length(max(q,0.0)) + min(max(q.x,q.y),0.0);    
}

float sdCircle(vec2 p, vec2 c, float r) {
    return distance(p, c) - r;
}

vec4 sampleDrawing(sampler2D drawingTex, vec2 P) {
    // Return the drawing (in the format listed at the top of Buffer B) at P
    vec4 data = texture(drawingTex, P / vec2(textureSize(drawingTex, 0)));
  
    return data;
}

float sdDrawing(sampler2D drawingTex, vec2 P) {
    // Return the signed distance for the drawing at P
    return sampleDrawing(drawingTex, P).r;
}

vec2 intersectAABB(vec2 ro, vec2 rd, vec2 a, vec2 b)
{
    vec2 ta = (a - ro) / rd;
    vec2 tb = (b - ro) / rd;
    vec2 t1 = min(ta, tb);
    vec2 t2 = max(ta, tb);
    vec2 t = vec2(max(t1.x, t1.y), min(t2.x, t2.y));
    return t.x > t.y ? vec2(-1.0) : t;  
}

float intersect(sampler2D sdf_tex, vec2 ro, vec2 rd, float tMax)
{
    screenRes = vec2(textureSize(sdf_tex, 0));
    float tOffset = 0.0; 

    vec2 tAABB = intersectAABB(ro, rd, vec2(0.0001), screenRes - 0.0001);

    if (tAABB.x > tMax || tAABB.y < 0.0)
        return -1.0;
    
    if (tAABB.x > 0.0) {
        ro += tAABB.x * rd;
        tOffset += tAABB.x;
        tMax -= tAABB.x;
    }

    if (tAABB.y < tMax) {
        tMax = tAABB.y;
    }

    float t = 0.0;

    for (int i = 0; i < 100; i++)
    {
        float d = sdDrawing(sdf_tex, ro+rd * t);

        t+= (d);
        if ((d) < 0.01)
            return t;
        
        if( t >= tMax)
            break;
    }

    return -1.0;

}

RayHit radiance(sampler2D sdf_tex, vec2 ro, vec2 rd, float tMax)
{
    vec4 p = sampleDrawing(sdf_tex, ro);
    float t = 1e6f;

    if(p.r > 0.0) {
        t = intersect(sdf_tex, ro, rd, tMax);

        if (t == -1.0)
            return RayHit(vec4(0.0, 0.0, 0.0, 1.0), 1e5f);

        p = sampleDrawing(sdf_tex, ro + rd * t);
    } 
    return RayHit(vec4(p.gba, 0.0), t);
}