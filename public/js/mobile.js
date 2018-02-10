var socket = io();

socket.on('connect', function() {
	socket.emit('mobile');
});

if (window.DeviceOrientationEvent) {
	window.addEventListener("deviceorientation", function (event) {
		socket.emit('orientation', [event.alpha, event.beta, event.gamma]);
	}, true);
} else {
	window.addEventListener("MozOrientation", function (event) {
		socket.emit('orientation', [event.alpha, event.beta, event.gamma]);
	}, true);
}

if (window.DeviceMotionEvent) {
	window.addEventListener('devicemotion', function (event) {
		var acc = event.acceleration;
		socket.emit('acceleration', [acc.x,acc.y,acc.z]);
		console.log(acc);
	}, true);
}
