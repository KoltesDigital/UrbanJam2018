
uniform sampler2D positionTexture, velocityTexture;
uniform vec3 target;
uniform float time, dimension, spawnIndex;
varying vec2 vUv;

void main () {
	float e = .00001;
  vec4 position = texture2D(positionTexture, vUv);
	vec4 velocity = texture2D(velocityTexture, vUv);
	float index = floor(vUv.x * dimension) + floor(vUv.y * dimension * dimension);
	gl_FragColor = position + velocity * step(length(index-spawnIndex), 30.);
}