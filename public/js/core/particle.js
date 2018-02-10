function Particle (scene, renderer) {

	var dimension = 128;
	var uniforms = {
		positionTexture: { value: createDataTexture(getRandomPoints(dimension*dimension), 3) },
		target: { value: [0,0,0] },
		time: { value: 0 },
	};

	createGeometry(randomPositionAttribute(dimension*dimension)).forEach(geometry => {
		scene.add(new THREE.Mesh(geometry, new THREE.ShaderMaterial({
			vertexShader: shaders['header']+shaders['particle.vert'],
			fragmentShader: shaders['header']+shaders['particle.frag'],
			uniforms: uniforms,
			side: THREE.DoubleSide,
		})))
	})

	var buffer = new FrameBuffer({
		render: renderer, width: dimension, height: dimension,
		material: new THREE.ShaderMaterial({
			vertexShader: shaders['header']+shaders['buffer.vert'],
			fragmentShader: shaders['header']+shaders['position.frag'],
			uniforms: uniforms,
		}),
	});

	this.update = function(elapsed) {
		uniforms.time.value = elapsed;
		uniforms.positionTexture.value = buffer.getTexture();
		buffer.update();
	}

	this.setTarget = function(target) {
		uniforms.target.value = target;
	}
}