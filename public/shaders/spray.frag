
uniform vec3 color;
varying vec3 vNormal, vView;

void main () {
	float shade = dot(normalize(vNormal), -normalize(vView))*.5+.5;
	gl_FragColor = vec4(color * shade, 1);
}