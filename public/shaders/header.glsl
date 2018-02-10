

#define PI 3.14159
#define TAU (PI*2.)

mat2 rot (float a) { float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }

float rand (vec2 seed) { return fract(sin(dot(seed*.1684,vec2(54.649,321.547)))*450315.); }

float luminance (vec3 color) { return (color.r+color.b+color.g)/3.; }

void lookAt (inout vec3 pos, vec3 target, vec2 anchor)
{
	vec3 forward = normalize(target-pos);
	vec3 right = normalize(cross(vec3(0,1,0), forward));
	vec3 up = normalize(cross(forward, right));
	pos += right * anchor.x + up * anchor.y;
}

void lookAtUp (inout vec3 pos, vec3 target, vec2 anchor)
{
	vec3 forward = normalize(target-pos);
	vec3 right = normalize(cross(vec3(0,1,0), forward));
	pos += right * anchor.x + vec3(0,1,0) * anchor.y;
}

// hash based 3d value noise
// function taken from https://www.shadertoy.com/view/XslGRr
// Created by inigo quilez - iq/2013
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

// ported from GLSL to HLSL
float hash( float n )
{
	return fract(sin(n)*43758.5453);
}

float noiseIQ( vec3 x )
{
	// The noise function returns a value in the range -1.0f -> 1.0f
	vec3 p = floor(x);
	vec3 f = fract(x);
	f       = f*f*(3.0-2.0*f);
	float n = p.x + p.y*57.0 + 113.0*p.z;
	return mix(mix(mix( hash(n+0.0), hash(n+1.0),f.x),
	 mix( hash(n+57.0), hash(n+58.0),f.x),f.y),
	mix(mix( hash(n+113.0), hash(n+114.0),f.x),
	 mix( hash(n+170.0), hash(n+171.0),f.x),f.y),f.z);
}

float fbm (vec3 p) {
    float value = 0.0;
    float amplitud = .5;
    for (float i = 1.; i <= 5.; i++) {
        value += amplitud * noiseIQ(p);
        p *= 2.;
        amplitud *= .5;
    }
    return value;
}

float pattern (vec3 p) {
  vec3 q = vec3(fbm(p), fbm(p+vec3(10.5,51.5,7.5423)), fbm(p+vec3(1501.24,1254.324,658.6)));
	// q.xz *= rot(iGlobalTime*.2);
  return fbm(p + 8. * q);
}