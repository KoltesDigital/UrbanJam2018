
uniform vec3 color;

varying vec2 vAnchor;
varying vec3 vColor;
varying vec3 vVelocity;

void main () {
	if (length(vAnchor)>1.) { discard; }
	float shade = dot(normalize(vVelocity), vec3(0,1,0)) * .5 + .5;
	shade = smoothstep(.0, .5, shade);
	gl_FragColor = vec4(color/* * shade*/, 1);
}