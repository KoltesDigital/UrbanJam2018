var socket = io();

socket.emit('message', 'hello from mobile');

socket.on('message', function(msg) {
	console.log(msg);
});

if (window.DeviceOrientationEvent) {
	window.addEventListener("deviceorientation", function () {
		console.log([event.beta, event.gamma]);
		socket.emit('message', [event.beta, event.gamma]);
	}, true);
} else if (window.DeviceMotionEvent) {
	window.addEventListener('devicemotion', function () {
		console.log([event.acceleration.x * 2, event.acceleration.y * 2]);
		socket.emit('message', [event.beta, event.gamma]);
	}, true);
} else {
	window.addEventListener("MozOrientation", function () {
		console.log([orientation.x * 50, orientation.y * 50]);
		socket.emit('message', [event.beta, event.gamma]);
	}, true);
}