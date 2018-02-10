uniform vec2 resolution;

attribute vec2 indexMap, anchor;

attribute vec3 nextPosition, previousPosition;
// attribute float direction, width;

void main () {
	vec4 screenPosition = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1);
	// vec3 screenPosition = screenPosition4.xyz / screenPosition4.w;

	vec4 screenPreviousPosition = projectionMatrix * viewMatrix * modelMatrix * vec4(previousPosition, 1);
	// vec3 screenPreviousPosition = screenPreviousPosition4.xyz / screenPreviousPosition4.w;

	float aspect = resolution.x / resolution.y;
	float aspectInverse = resolution.y / resolution.x;
	screenPosition *= aspectInverse;
	screenPreviousPosition *= aspectInverse;

	float size = .03;

	vec2 offset = normalize(screenPosition.xy - screenPreviousPosition.xy);
	screenPosition.xy += offset * anchor.y * size;

	offset.xy = offset.yx;
	offset.x = -offset.x;
	screenPosition.xy += offset * anchor.x * size * aspect;

	// screenPosition.xy += anchor.xy * .1;

	// vec3 newScreenPosition = screenPosition;
	// newScreenPosition.xy += offset * direction * width;

	// newScreenPosition /= aspectInverse;

	// vec4 pos = modelMatrix * vec4(position, 1.);

	gl_Position = screenPosition;
}
