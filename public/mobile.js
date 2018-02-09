var socket = io();

socket.emit('message', 'hello from mobile');

socket.on('message', function(msg) {
	console.log(msg);
});
