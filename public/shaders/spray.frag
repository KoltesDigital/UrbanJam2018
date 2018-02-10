
varying vec3 vNormal, vView;

void main () {
	gl_FragColor = vec4(normalize(vNormal)*.5+.5, 1);
}