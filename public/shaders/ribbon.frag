
uniform vec3 color;

void main () {
	//if (length(vAnchor)>1.) { discard; }
	//gl_FragColor = vec4(vColor, 1);
	gl_FragColor = vec4(color, 1);
}
