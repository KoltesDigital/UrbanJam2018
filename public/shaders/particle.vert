
uniform sampler2D positionTexture;
attribute vec2 indexMap, anchor;
varying vec2 vAnchor;

void main () {
	vAnchor = anchor;
	vec3 pos = texture2D(positionTexture, indexMap).xyz;
	lookAt(pos.xyz, cameraPosition, anchor * .01);
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(pos, 1);
}