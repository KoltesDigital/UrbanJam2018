function Particle (renderer) {

	THREE.Object3D.call(this);

	var color = [1,1,1];

	var dimension = 64;
	var uniforms = {
		color: { value: color },
		positionTexture: { value: createDataTexture(getRandomPoints(dimension*dimension), 3) },
		velocityTexture: { value: createDataTexture(getPoints(dimension*dimension), 3) },
		dimension: { value: dimension },
		spawnIndex: { value: 0 },
		target: { value: [0,0,0] },
		time: { value: 0 },
	};

	var framerate = 120;
	var lastframe = 0;

	createGeometry(randomPositionAttribute(dimension*dimension)).forEach(geometry => {
		this.add(new THREE.Mesh(geometry, new THREE.ShaderMaterial({
			vertexShader: shaders['header']+shaders['particle.vert'],
			fragmentShader: shaders['header']+shaders['particle.frag'],
			uniforms: uniforms,
			side: THREE.DoubleSide,
		})))
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

	this.update = function(elapsed) {
		uniforms.time.value = elapsed;
		uniforms.positionTexture.value = bufferPosition.getTexture();
		uniforms.velocityTexture.value = bufferVelocity.getTexture();
		bufferPosition.update();
		bufferVelocity.update();
	}

	this.spray = function() {
		if (lastframe + 1./framerate < uniforms.time.value) {
			uniforms.spawnIndex.value = (uniforms.spawnIndex.value + 5) % (dimension * dimension);
			lastframe = uniforms.time.value;
		}
	}

	this.setPressure = function() {

	}

	this.setTarget = function(target) {
		uniforms.target.value = target;
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