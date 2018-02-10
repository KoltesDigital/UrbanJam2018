
uniform sampler2D positionTexture, velocityTexture, seedTexture;
uniform vec3 target;
uniform float time;
varying vec2 vUv;

void main () {
	float e = .00001;
	vec3 position = texture2D(positionTexture, vUv).xyz;
	vec3 velocity = texture2D(velocityTexture, vUv).xyz;

	velocity *= .99;
	vec3 offset = vec3(0);

	vec3 seed = texture2D(seedTexture, vUv).xyz;
  seed += position;
  seed.xz *= rot(time*.09);
  seed.xy *= rot(time*.06);
  seed.yz *= rot(time*.03);
  offset.x += .4*(noiseIQ(seed)*2.-1.);
  offset.y += .4*(noiseIQ(seed+vec3(123.3210,51.96,123.4398))*2.-1.);
  offset.z += .4*(noiseIQ(seed+vec3(54.,459.54,648.549))*2.-1.);

	offset += normalize(e+target-position) * clamp(length(target-position), 0., 1.);

	velocity = mix(velocity, offset, .01);

	gl_FragColor = vec4(velocity, 0);
}