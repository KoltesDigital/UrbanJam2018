uniform vec2 resolution;

attribute vec3 position, nextPosition, previousPosition;
attribute float direction, width;

void main () {
	vec4 screenPosition4 = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1);
	vec3 screenPosition = screenPosition4.xyz / screenPosition4.w;

	vec4 screenPreviousPosition4 = projectionMatrix * viewMatrix * modelMatrix * vec4(previousPosition, 1);
	vec3 screenPreviousPosition = screenPreviousPosition4.xyz / screenPreviousPosition4.w;

	float aspectInverse = resolution.y / resolution.x;
	screenPosition *= aspectInverse;
	screenPreviousPosition *= aspectInverse;

	vec2 offset = normalize(screenPosition - screenPreviousPosition);
	offset.xy = offset.yx;
	offset.x = -offset.x;

	vec3 newScreenPosition = screenPosition;
	newScreenPosition.xy += offset * direction * width;

	newScreenPosition /= aspectInverse;

	gl_Position = vec4(newScreenPosition, 1.);
}
