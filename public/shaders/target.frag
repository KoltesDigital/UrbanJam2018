
uniform sampler2D targetTexture, velocityTexture;
uniform vec3 target;
uniform float time, dimension, spawnIndex;
varying vec2 vUv;

void main () {
	float e = .00001;
  vec4 targetBuffer = texture2D(targetTexture, vUv);
	float index = floor(vUv.x * dimension) + floor(vUv.y * dimension * dimension);
	float fade = 1.-smoothstep(0., 30., length(index-spawnIndex));
	fade *= step(index, spawnIndex);
	targetBuffer.xyz = mix(targetBuffer.xyz, target, fade);
	gl_FragColor = targetBuffer;
}