
uniform sampler2D positionTexture;
uniform vec3 target;
uniform float time;
varying vec2 vUv;

void main () {
  vec4 position = texture2D(positionTexture, vUv);
	gl_FragColor = position;
}