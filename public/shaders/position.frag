
uniform sampler2D positionTexture, velocityTexture;
uniform vec3 target;
uniform float time, dimension, spawnIndex;
varying vec2 vUv;

void main () {
	float e = .00001;
  vec4 position = texture2D(positionTexture, vUv);
	vec4 velocity = texture2D(velocityTexture, vUv);
	float index = floor(vUv.x * dimension) + floor(vUv.y * dimension * dimension);
	float fade = 1.-smoothstep(0., 30., length(index-spawnIndex));
	fade *= step(index, spawnIndex);
	// float fade = step(length(index-spawnIndex), 30.);
	// gl_FragColor = position + velocity * fade;
	position.xyz = mix(position.xyz, target, fade);
	gl_FragColor = position + velocity * .01;
}