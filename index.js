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
			console.log('screen disconnected')
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

	socket.on('acceleration', function(data) {
		if (screenSocket)
			screenSocket.emit('acceleration', socket.id, data);
	});
	socket.on('color', function(data) {
		if (screenSocket)
			screenSocket.emit('color', socket.id, data);
	});
	socket.on('orientation', function(data) {
		if (screenSocket)
			screenSocket.emit('orientation', socket.id, data);
	});
	socket.on('spray-off', function() {
		if (screenSocket)
			screenSocket.emit('spray-off', socket.id);
	});
	socket.on('spray-off', function() {
		if (screenSocket)
			screenSocket.emit('spray-off', socket.id);
	});
	socket.on('spray-pressure', function(data) {
		if (screenSocket)
			screenSocket.emit('spray-pressure', socket.id, data);
	});
});

http.listen(3000, function() {
	console.log('listening on *:3000');
});
