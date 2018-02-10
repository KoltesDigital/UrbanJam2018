
varying vec3 vNormal, vView;

void main () {
	vNormal = (modelMatrix * vec4(normal, 1)).xyz;
	vec4 pos = modelMatrix * vec4(position, 1);
	vView = pos.xyz - cameraPosition;
	gl_Position = projectionMatrix * viewMatrix * pos;
}