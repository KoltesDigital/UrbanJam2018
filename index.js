'use strict';

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/public/mobile.html');
});

var screenSocket = null;

io.on('connection', function(socket) {
	socket.on('disconnect', function() {
		if (socket === screenSocket) {
			screenSocket = null;
		} else if (screenSocket) {
			screenSocket.emit('client-disconnect', socket.id);
		}
	});

	socket.on('screen', function() {
		screenSocket = socket;
	});

	socket.on('mobile', function() {
		if (screenSocket)
			screenSocket.emit('client-connect', socket.id);
	});

	socket.on('orientation', function (data) {
		if (screenSocket)
			socket.broadcast.emit('orientation', socket.id, data);
	});
	socket.on('acceleration', function (data) {
		if (screenSocket)
			socket.broadcast.emit('acceleration', socket.id, data);
	});
});

http.listen(3000, function() {
	console.log('listening on *:3000');
});
