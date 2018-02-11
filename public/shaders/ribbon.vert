uniform vec2 resolution;
attribute vec2 indexMap, anchor;
attribute vec3 previousPosition;
attribute float accelerationMagnitude;
varying vec3 vDirection, vView;

void main () {
	float size = .1;

	vDirection = previousPosition-position;
	// vView = cameraPosition-position;
	vView = -position;

	// vec4 pos = modelMatrix * vec4(position, 1.);
	// // lookAt(pos.xyz, vec3(0), anchor * .5);

	// vec4 screenPosition = projectionMatrix * viewMatrix * pos;
	// vec4 screenPreviousPosition = projectionMatrix * viewMatrix * modelMatrix * vec4(previousPosition, 1);
	// float aspect = resolution.x / resolution.y;
	// float aspectInverse = resolution.y / resolution.x;
	// screenPosition *= aspectInverse;
	// screenPreviousPosition *= aspectInverse;
	// vec2 offset = normalize(screenPosition.xy - screenPreviousPosition.xy);
	// screenPosition.xy += offset * anchor.y * size;
	// offset.xy = offset.yx;
	// offset.x = -offset.x;
	// screenPosition.xy += offset * anchor.x * size * aspect;

	// gl_Position = screenPosition;

	vec4 pos = modelMatrix * vec4(position, 1.);
	float magnitude = clamp(accelerationMagnitude / 15., 0., 1.);
	lookAtUp(pos.xyz, vec3(0), anchor * (.5+.5*magnitude));
	gl_Position = projectionMatrix * viewMatrix * pos;

	// vec3 pos = position;
	// vec3 dir = normalize(vDirection);
	// dir = normalize(cross(dir, vec3(0,1,0)));
	// pos += dir * anchor.x * .3;

	// gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(pos, 1);
}
