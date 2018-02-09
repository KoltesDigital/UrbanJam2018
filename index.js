'use strict';

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

io.on('connection', function(socket) {
	console.log('a user connected');
});

io.on('connection', function(socket) {
	socket.on('message', function (msg) {
		console.log('message:', msg);
		socket.broadcast.emit('message', msg);
	});
});

http.listen(3000, function() {
	console.log('listening on *:3000');
});
