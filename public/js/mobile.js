var socket = io();

socket.emit('message', 'hello from mobile');

socket.on('message', function(msg) {
	console.log(msg);
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
	}, true);
}