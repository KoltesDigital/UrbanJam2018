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
	camera.position.z = 60;
	var controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;
	controls.dampingFactor = 0.5;
	controls.rotateSpeed = 0.25;
	var accelerationDamping = .9;
	var orientationDamping = .1;
	var resetDamping = .1;
	var accelerationSpeed = 2.;
	var lookAtTarget = new THREE.Vector3();

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

	var totalAngleRotate = new THREE.Quaternion();

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

			var particle = new Particle(renderer, spray.position);
			particle.update(elapsed);
			scene.add(particle);

			var client = {
				spray: spray,
				particle: particle,
				ribbons: [],
				rawAcceleration: new THREE.Vector3(),
				acceleration: new THREE.Vector3(),
				quaternion: new THREE.Quaternion(),
				spraying: false,
				pressureRaw: 0,
				color: [1,1,1],
				pressure: 0,
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

			client.rawAcceleration.set(data[0], data[1], data[2]);
		});

		socket.on('color', function (id, data) {
			var client = clients[id];
			if (!client) return;

			client.color = new THREE.Color(data);
			client.particle.setColor(client.color);
			client.spray.material.uniforms.color.value = client.color;
		});

		var eulerOrientation = new THREE.Euler();
		socket.on('orientation', function (id, data) {
			var client = clients[id];
			if (!client) return;

			eulerOrientation.set(
				THREE.Math.degToRad(data[1] - 180),
				THREE.Math.degToRad(- data[0]),
				-THREE.Math.degToRad(data[2]),
				'YXZ');

			client.quaternion.setFromEuler(eulerOrientation);
			client.quaternion.multiply(totalAngleRotate);
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

			var ribbon = new Ribbon(renderer, client.spray.position);
			ribbon.start();
			ribbon.setColor(client.color);
			scene.add(ribbon);
			client.ribbons.push(ribbon);
		});

		socket.on('spray-pressure', function (id, pressure) {
			var client = clients[id];
			if (!client) return;

			client.pressureRaw = pressure;
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
		if (Mouse.down == false) {
			controls.setOffsetTheta(delta * .1);
		}

		var upVector = new THREE.Vector3(0, 1, 0);
		var angleRotate = new THREE.Quaternion();
		angleRotate.setFromAxisAngle(upVector, delta * .1);

		totalAngleRotate.multiply(angleRotate);

		var zeroVector = new THREE.Vector3();
		Object.keys(clients).forEach(function(id) {
			var client = clients[id];

			client.spray.quaternion.multiply(angleRotate);
			client.spray.quaternion.slerp(client.quaternion, .5);
			client.acceleration.lerp(client.rawAcceleration, .5);
			client.spray.translateOnAxis(client.acceleration, .05);

			if (client.spraying == false) {
				client.spray.position.lerp(zeroVector, 1 * delta);
			}

			client.pressure = lerp(client.pressure, client.pressureRaw, .5);

			if (client.pressure > 0.01 && client.spraying && client.ribbons.length > 0) {
				var ribbon = client.ribbons[client.ribbons.length-1];
				ribbon.update(elapsed);
				var magnitude = distance3(client.acceleration[0], client.acceleration[1], client.acceleration[2], 0, 0, 0);
				ribbon.setAccelerationMagnitude(magnitude);
			}

			client.particle.update(elapsed);
			client.particle.setSpraying(client.spraying);

			if (client.spraying) {
				client.particle.spray();
			}
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
