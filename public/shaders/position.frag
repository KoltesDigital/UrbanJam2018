
uniform sampler2D positionTexture, velocityTexture, targetTexture;
uniform vec3 target;
uniform float time, dimension, spawnIndex, reset;
varying vec2 vUv;

void main () {
	float e = .00001;
	float salt = rand(vUv);
  vec4 position = texture2D(positionTexture, vUv);
	vec4 velocity = texture2D(velocityTexture, vUv);
	vec4 targetBuffer = texture2D(targetTexture, vUv);
	float index = floor(vUv.x * dimension) + floor(vUv.y * dimension * dimension);
	float fade = 1.-smoothstep(0., 30., length(index-spawnIndex));
	fade *= step(index, spawnIndex);
	position.xyz = mix(position.xyz, target, fade);
	position.w += .01 + .01 * salt;
	position.xyz = mix(position.xyz, targetBuffer.xyz, step(1., position.w));
	position.w = mod(position.w, 1.);
	position.w = mix(position.w, 0., reset);
	fade = 1.-smoothstep(.0, .1, position.w);
	gl_FragColor = position + velocity * (.03 + .03 * salt + .5 * fade);
}