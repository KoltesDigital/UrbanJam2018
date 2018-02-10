
uniform sampler2D positionTexture, velocityTexture;
uniform vec3 target;
uniform float time;
varying vec2 vUv;

void main () {
	float e = .00001;
  vec4 position = texture2D(positionTexture, vUv);
	vec4 velocity = texture2D(velocityTexture, vUv);
	gl_FragColor = position + velocity;
}