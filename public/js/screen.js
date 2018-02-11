var socket = io();

socket.on('connect', function () {
	socket.emit('screen');
});

var PI2 = Math.PI/2.;

var clients = {};

window.onload = function () {

	var frameElapsed = 0;
	var elapsed = 0;

	var renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.01, 1000);
	camera.position.z = 30;
	var controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;
	controls.dampingFactor = 0.25;
	controls.rotateSpeed = 0.25;
	var accelerationDamping = .9;
	var orientationDamping = .1;
	var resetDamping = .01;
	var accelerationSpeed = 5.;

	load([
		{ name:'particleBrush', url:'images/spray_point.jpg' },
	],[
		{ name:'header', url:'shaders/header.glsl' },
		{ name:'buffer.vert', url:'shaders/buffer.vert' },
		{ name:'particle.vert', url:'shaders/particle.vert' },
		{ name:'particle.frag', url:'shaders/particle.frag' },
		{ name:'position.frag', url:'shaders/position.frag' },
		{ name:'velocity.frag', url:'shaders/velocity.frag' },
		{ name:'target.frag', url:'shaders/target.frag' },
		{ name:'ribbon.vert', url:'shaders/ribbon.vert' },
		{ name:'ribbon.frag', url:'shaders/ribbon.frag' },
		{ name:'spray.vert', url:'shaders/spray.vert' },
		{ name:'spray.frag', url:'shaders/spray.frag' },
	],[
		{ name:'spray', url:'meshes/spray.obj' },
	], setup);

	function setup () {

		var geometry = meshes['spray'].children[0].geometry;

		socket.on('client-connect', function (id) {

			var material = new THREE.ShaderMaterial({
				vertexShader: shaders['header']+shaders['spray.vert'],
				fragmentShader: shaders['header']+shaders['spray.frag'],
				uniforms: {
					color: { value: [1,1,1] },
				}
			});

			var spray = new THREE.Mesh(geometry, material);
			scene.add(spray);

			var particle = new Particle(renderer);
			particle.update(elapsed);
			// scene.add(particle);

			var client = {
				spray: spray,
				particle: particle,
				ribbons: [],
				accelerationRaw: [0,0,0],
				orientationRaw: [0,0,0],
				acceleration: [0,0,0],
				orientation: [0,0,0],
				position: [0,0,0],
				spraying: false,
				euler: new THREE.Euler(),
			};
			clients[id] = client;
		});

		socket.on('client-disconnect', function (id) {
			var client = clients[id];
			if (!client) return;

			scene.remove(client.spray);

			client.particle.dispose();
			scene.remove(client.particle);

			client.ribbons.forEach(ribbon => {
				ribbon.dispose();
				scene.remove(ribbon);
			})

			delete clients[id];
		});

		socket.on('acceleration', function (id, data) {
			var client = clients[id];
			if (!client) return;

			for (var v = 0; v < 3; ++v) {
				client.accelerationRaw[v] = data[v];
			}
		});

		socket.on('color', function (id, data) {
			var client = clients[id];
			if (!client) return;

			client.color = new THREE.Color(data);
			client.particle.setColor(client.color);
			client.spray.material.uniforms.color.value = client.color;
		});

		socket.on('orientation', function (id, data) {
			var client = clients[id];
			if (!client) return;

			for (var v = 0; v < 3; ++v) {
				client.orientationRaw[v] = data[v];
			}
		});

		socket.on('spray-off', function (id) {
			var client = clients[id];
			if (!client) return;

			client.spraying = false;
		});

		socket.on('spray-on', function (id) {
			var client = clients[id];
			if (!client) return;

			client.spraying = true;

			var ribbon = new Ribbon(renderer);
			ribbon.startAt(client.position);
			ribbon.setColor(client.color);
			scene.add(ribbon);
			client.ribbons.push(ribbon);
		});

		socket.on('spray-pressure', function (id, pressure) {
			var client = clients[id];
			if (!client) return;

		});

		document.body.style.cursor = 'none';

		document.addEventListener('keydown', Keyboard.onKeyDown);
		document.addEventListener('keyup', Keyboard.onKeyUp);
		document.addEventListener('mousemove', Mouse.onMove);
		document.addEventListener('mousedown', Mouse.onMouseDown);
		document.addEventListener('mouseup', Mouse.onMouseUp);
		window.addEventListener('resize', resize, false);

		requestAnimationFrame(update);
	}

	function update (elapsed) {
		requestAnimationFrame(update);

		elapsed *= .001;
		var delta = Math.max(0, Math.min(1, elapsed - frameElapsed));

		var mousex = (Mouse.x/window.innerWidth)*2.-1.;
		var mousey = (1.-Mouse.y/window.innerHeight)*2.-1.;
		var lastMouseX = (Mouse.lastX/window.innerWidth)*2.-1.;
		var lastMouseY = (1.-Mouse.lastY/window.innerHeight)*2.-1.;

		controls.update();

		Object.keys(clients).forEach(function(id) {
			var client = clients[id];


			for (var v = 0; v < 3; ++v) {
				client.acceleration[v] = lerp(client.acceleration[v], client.accelerationRaw[v], accelerationDamping);
				client.orientation[v] = lerp(client.orientation[v], client.orientationRaw[v], orientationDamping);
				client.position[v] += accelerationSpeed * client.acceleration[v] * delta;
				client.position[v] = lerp(client.position[v], 0., resetDamping);
				client.spray.position.set(client.position[0], client.position[1], client.position[2]);
			}


			// var PI2 = Math.PI * 2.;
			client.spray.rotation.set(
				THREE.Math.degToRad(client.orientation[1]),
				THREE.Math.degToRad(client.orientation[0]),
				-THREE.Math.degToRad(client.orientation[2]),
				'YXZ');

			if (client.spraying && client.ribbons.length > 0) {
				var ribbon = client.ribbons[client.ribbons.length-1];
				ribbon.update(elapsed);
				ribbon.setTarget(client.position);
			}
			
			// client.particle.update(elapsed);
			
			// if (client.spraying) {
			// 	client.particle.spray();
			// 	client.particle.setTarget(client.position);
			// }
		});

		renderer.render( scene, camera );
		frameElapsed = elapsed;
	}

	function resize () {
		var width = window.innerWidth;
		var height = window.innerHeight;
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize( width, height );
	}
}
