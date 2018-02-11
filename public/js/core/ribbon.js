function Ribbon(renderer) {

	THREE.Object3D.call(this);
	this.frustumCulled = false;
	
	var segments = 200;
	var segmentLength = .1;

	var target = [0,0,0];
	var targetRaw = [0,0,0];
	var targetDamping = .5;

	var accelerationMagnitude = 0;

	var uniforms = {
		color: { value: [1,1,1] },
		resolution: { value: [1, 1] },
		target: { value: target },
	};

	var attributes = randomPositionAttribute(1);
	attributes.previousPosition = {
		array: [getPoints(attributes.position.array.length/3)],
		itemSize: 3,
	}
	attributes.accelerationMagnitude = {
		array: [getValues(attributes.position.array.length/3)],
		itemSize: 1,
	}

	createGeometry(attributes, [1,segments]).forEach(geometry => {
		var mesh = new THREE.Mesh(geometry, new THREE.ShaderMaterial({
			vertexShader: shaders['header'] + shaders['ribbon.vert'],
			fragmentShader: shaders['header'] + shaders['ribbon.frag'],
			uniforms: uniforms,
			side: THREE.DoubleSide,
		}));
		mesh.frustumCulled = false;
		this.add(mesh);
	})

	this.update = function (elapsed) {

		for (var p = 0; p < 3; ++p) {
			target[p] = lerp(target[p], targetRaw[p], targetDamping);
		}

		for (var c = this.children.length - 1; c >= 0; --c) {
			var geometry = this.children[c].geometry;
			var array = geometry.attributes.position.array;
			var arrayMagnitude = geometry.attributes.accelerationMagnitude.array;

			for (var p = 0; p < 2; ++p) {
				for (var v = 0; v < 3; ++v) {
					array[p*3 + v] = target[v];
				}
				arrayMagnitude[p] = lerp(arrayMagnitude[p], accelerationMagnitude, .5);
			}

			var index2nd = 2*3;
			var dist = distance3(target[0],target[1],target[2],array[index2nd],array[index2nd+1],array[index2nd+2]);
			if (dist > segmentLength) {
				for (var i = segments; i > 0; --i) {
					for (var p = 0; p < 2; ++p) {
						for (var v = 0; v < 3; ++v) {
							array[i*3*2 + p*3 + v] = array[(i-1)*3*2 + p*3 + v];
						}
						arrayMagnitude[i*2 + p] = arrayMagnitude[(i-1)*2 + p];
					}
				}
				geometry.attributes.position.needsUpdate = true;
				geometry.attributes.accelerationMagnitude.needsUpdate = true;
			}

			var arrayPrev = geometry.attributes.previousPosition.array;
			for (var i = 0; i < segments - 1; ++i) {
				for (var p = 0; p < 2; ++p) {
					arrayPrev[i*3*2 + p*3 + 0] = array[(i+1)*3*2 + p*3 + 0];
					arrayPrev[i*3*2 + p*3 + 1] = array[(i+1)*3*2 + p*3 + 1];
					arrayPrev[i*3*2 + p*3 + 2] = array[(i+1)*3*2 + p*3 + 2];
				}
			}
			geometry.attributes.previousPosition.needsUpdate = true;


		}
	}

	this.startAt = function (target_) {
		targetRaw = target_;
		for (var c = this.children.length - 1; c >= 0; --c) {
			var geometry = this.children[c].geometry;
			var array = geometry.attributes.position.array;
			for (var p = 0; p < array.length/3; ++p) {
				for (var v = 0; v < 3; ++v) {
					array[p*3 + v] = targetRaw[v];
				}
			}
		}
		geometry.attributes.position.needsUpdate = true;
	}

	this.setAccelerationMagnitude = function (magnitude) {
		accelerationMagnitude = magnitude;
	}

	this.setTarget = function (target_) {
		targetRaw = target_;
	}

	this.setColor = function (color_) {
		uniforms.color.value = color_;
	}

	this.dispose = function () {
		this.children.forEach(item => {
			item.geometry.dispose();
			this.remove(item);
		})
	}
}

Ribbon.prototype = Object.create(THREE.Object3D.prototype)
Ribbon.prototype.constructor = Ribbon
