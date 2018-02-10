
varying vec2 vAnchor;

void main () {
	if (length(vAnchor)>1.) { discard; }
	gl_FragColor = vec4(1);
}