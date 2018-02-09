var socket = io();

socket.emit('message', 'hello from screen');

socket.on('message', function(msg) {
	console.log(msg);
});
