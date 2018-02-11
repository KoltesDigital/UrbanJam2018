
varying vec3 vNormal, vView;

void main () {
	vNormal = normal;
	vec4 pos = modelMatrix * vec4(position, 1);
	vView = pos.xyz - cameraPosition;
	gl_Position = projectionMatrix * viewMatrix * pos;
}