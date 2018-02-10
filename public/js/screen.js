var socket = io();

socket.emit('message', 'hello from screen');

socket.on('message', function(msg) {
	console.log(msg);
});

var PI2 = Math.PI/2.;

window.onload = function () {

	var frameElapsed = 0;
	var elapsed = 0;

	var renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 100);
	camera.position.z = 5;
	var controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;
	controls.dampingFactor = 0.25;
	controls.rotateSpeed = 0.25;
	controls.enableZoom = false;

	var uniforms, bufferPosition, bufferVelocity;
	var target = [0,0,0];
	var rotation = [0,0,0];
	var dimension = 128;
	var accelerationSpeed = .01;
	var accelerationDamping = .1;
	var orientationDamping = .1;
	var cube;

	load([
		// { name:'cursor', url:'images/cursor.png' },
	],[
		{ name:'header', url:'shaders/header.glsl' },
		{ name:'buffer.vert', url:'shaders/buffer.vert' },
		{ name:'particle.vert', url:'shaders/particle.vert' },
		{ name:'particle.frag', url:'shaders/particle.frag' },
		{ name:'position.frag', url:'shaders/position.frag' },
		{ name:'velocity.frag', url:'shaders/velocity.frag' },
	], setup);

	function setup () {

		uniforms = {};
		uniforms.seedTexture = { value: createDataTexture(getRandomPoints(dimension*dimension), 3) };
		uniforms.positionTexture = { value: uniforms.seedTexture.value };
		uniforms.velocityTexture = { value: createDataTexture(getPoints(dimension*dimension), 3) };
		uniforms.target = { value: target };
		uniforms.time = { value: 0 };

		createGeometry(randomPositionAttribute(dimension*dimension)).forEach(geometry => {
			scene.add(new THREE.Mesh(geometry, new THREE.ShaderMaterial({
				vertexShader: shaders['header']+shaders['particle.vert'],
				fragmentShader: shaders['header']+shaders['particle.frag'],
				uniforms: uniforms,
				side: THREE.DoubleSide,
			})))
		})

		bufferPosition = new FrameBuffer({
			render: renderer, width: dimension, height: dimension,
			material: new THREE.ShaderMaterial({
				vertexShader: shaders['header']+shaders['buffer.vert'],
				fragmentShader: shaders['header']+shaders['position.frag'],
				uniforms: uniforms,
			}),
		});

		bufferVelocity = new FrameBuffer({
			render: renderer, width: dimension, height: dimension,
			material: new THREE.ShaderMaterial({
				vertexShader: shaders['header']+shaders['buffer.vert'],
				fragmentShader: shaders['header']+shaders['velocity.frag'],
				uniforms: uniforms,
			}),
		});

		var geometry = new THREE.BoxGeometry( .3, .6, .3 );
		var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
		cube = new THREE.Mesh( geometry, material );
		scene.add( cube );

		socket.on('acceleration', function(data) {
			for (var v = 0; v < 3; ++v) {
				target[v] = data[v];
			}
		});

		socket.on('orientation', function(data) {
			for (var v = 0; v < 3; ++v) {
				rotation[v] = data[v];
			}
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
		uniforms.time.value = elapsed;
		
		var mousex = (Mouse.x/window.innerWidth)*2.-1.;
		var mousey = (1.-Mouse.y/window.innerHeight)*2.-1.;
		var lastMouseX = (Mouse.lastX/window.innerWidth)*2.-1.;
		var lastMouseY = (1.-Mouse.lastY/window.innerHeight)*2.-1.;

		controls.update();

		for (var v = 0; v < 3; ++v) {
			uniforms.target.value[v] += target[v] * accelerationSpeed;
			uniforms.target.value[v] = lerp(uniforms.target.value[v], 0., accelerationDamping);
			cube.position.set(uniforms.target.value[0],uniforms.target.value[1],uniforms.target.value[2]);
		}

		// rotation[v] = lerp(rotation[v], data[v], orientationDamping);
		// cube.rotation.set(rotation[0]/360,rotation[1]/180,rotation[2]/90);

		uniforms.positionTexture.value = bufferPosition.getTexture();
		uniforms.velocityTexture.value = bufferVelocity.getTexture();
		bufferPosition.update();
		bufferVelocity.update();

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