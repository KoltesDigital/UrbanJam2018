
uniform vec3 color;
varying vec3 vDirection, vView;

void main () {
	//if (length(vAnchor)>1.) { discard; }
	//gl_FragColor = vec4(vColor, 1);
	// float shade = abs(dot(normalize(vDirection), vec3(0,1,0)));
	float shade = dot(normalize(vDirection), vec3(0,1,0))*.5+.5;
	// shade = smoothstep(.0, .3, shade);
	// float segments = 8.;
	// shade = floor(shade * segments) / segments;
	gl_FragColor = vec4(color, 1);
}
