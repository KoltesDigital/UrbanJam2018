
uniform sampler2D positionTexture, velocityTexture;
attribute vec2 indexMap, anchor;
varying vec2 vAnchor;
varying vec3 vColor;

void main () {
	vAnchor = anchor;
	vec3 pos = texture2D(positionTexture, indexMap).xyz;
	vec3 velocity = texture2D(velocityTexture, indexMap).xyz;
	vColor = normalize(velocity) * .5 + .5;
	lookAt(pos.xyz, cameraPosition, anchor * .05);
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(pos, 1);
}