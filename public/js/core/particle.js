function Particle(renderer, targetPosition) {

	THREE.Object3D.call(this);
	this.frustumCulled = false;

	var color = [1,1,1];

	var dimension = 32;
	var uniforms = {
		color: { value: color },
		positionTexture: { value: createDataTexture(getRandomPoints(dimension*dimension), 3) },
		velocityTexture: { value: createDataTexture(getPoints(dimension*dimension), 3) },
		targetTexture: { value: createDataTexture(getPoints(dimension*dimension), 3) },
		dimension: { value: dimension },
		spawnIndex: { value: 0 },
		target: { value: [0,0,0] },
		time: { value: 0 },
		reset: { value: 1 },
		spraying: { value: 0 },
	};

	var framerate = 60;
	var lastframe = 0;

	createGeometry(randomPositionAttribute(dimension*dimension)).forEach(geometry => {
		var material = new THREE.ShaderMaterial({
			vertexShader: shaders['header']+shaders['particle.vert'],
			fragmentShader: shaders['header']+shaders['particle.frag'],
			uniforms: uniforms,
			side: THREE.DoubleSide,
		});
		var mesh = new THREE.Mesh(geometry, material);
		mesh.frustumCulled = false;
		this.add(mesh);
	})

	var bufferPosition = new FrameBuffer({
		render: renderer, width: dimension, height: dimension,
		material: new THREE.ShaderMaterial({
			vertexShader: shaders['header']+shaders['buffer.vert'],
			fragmentShader: shaders['header']+shaders['position.frag'],
			uniforms: uniforms,
		}),
	});

	var bufferVelocity = new FrameBuffer({
		render: renderer, width: dimension, height: dimension,
		material: new THREE.ShaderMaterial({
			vertexShader: shaders['header']+shaders['buffer.vert'],
			fragmentShader: shaders['header']+shaders['velocity.frag'],
			uniforms: uniforms,
		}),
	});

	// var bufferTarget = new FrameBuffer({
	// 	render: renderer, width: dimension, height: dimension,
	// 	material: new THREE.ShaderMaterial({
	// 		vertexShader: shaders['header']+shaders['buffer.vert'],
	// 		fragmentShader: shaders['header']+shaders['target.frag'],
	// 		uniforms: uniforms,
	// 	}),
	// });

	this.updateBuffers = function() {
		uniforms.positionTexture.value = bufferPosition.getTexture();
		uniforms.velocityTexture.value = bufferVelocity.getTexture();
		// uniforms.targetTexture.value = bufferTarget.getTexture();
		bufferPosition.update();
		bufferVelocity.update();
		// bufferTarget.update();
	}

	this.updateBuffers();
	uniforms.reset.value = 0;
	this.updateBuffers();

	this.update = function(elapsed) {
		uniforms.target.value = [targetPosition.x, targetPosition.y, targetPosition.z];
		uniforms.time.value = elapsed;
		this.updateBuffers();
	}

	this.setSpraying = function(spraying) {
		uniforms.spraying.value = spraying;
	}

	this.spray = function() {
		if (lastframe + 1./framerate < uniforms.time.value) {
			uniforms.spawnIndex.value = (uniforms.spawnIndex.value + 5) % (dimension * dimension);
			lastframe = uniforms.time.value;
		}
	}

	this.setPressure = function() {

	}

	this.setColor = function (color_) {
		color[0] = color_.r;
		color[1] = color_.g;
		color[2] = color_.b;
		uniforms.color.value = color;
	}

	this.dispose = function() {
		this.children.forEach(item => {
			item.geometry.dispose();
			this.remove(item);
		})
	}
}

Particle.prototype = Object.create(THREE.Object3D.prototype)
Particle.prototype.constructor = Particle
