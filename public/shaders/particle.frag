
varying vec2 vAnchor;
varying vec3 vColor;

void main () {
	if (length(vAnchor)>1.) { discard; }
	gl_FragColor = vec4(vColor, 1);
}