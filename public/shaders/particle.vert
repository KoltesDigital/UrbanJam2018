
uniform sampler2D positionTexture, velocityTexture;
attribute vec2 indexMap, anchor;
varying vec2 vAnchor;
varying vec3 vColor;
varying vec3 vVelocity;

void main () {
	vAnchor = anchor;
	vec4 pos = texture2D(positionTexture, indexMap);
	vec3 velocity = texture2D(velocityTexture, indexMap).xyz;
	vVelocity = velocity;
	vColor = normalize(velocity) * .5 + .5;
	float size = .2 + .2 * rand(indexMap);
	size *= smoothstep(.0,.1,pos.w);
	size *= 1.-smoothstep(.9,1.,pos.w);
	// velocity = normalize(velocity);
	// pos.xyz += velocity * anchor.y * size;
	// pos.xyz += normalize(cross(velocity, vec3(0,1,0))) * anchor.x * size;
	lookAt(pos.xyz, cameraPosition, anchor * size);
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(pos.xyz, 1);
}