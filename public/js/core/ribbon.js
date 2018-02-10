function Ribbon(renderer) {

	THREE.Object3D.call(this);

	var uniforms = {
		resolution: {
			value: [1, 1],
		},
	};

	var count = 64;

	createGeometry({
		position: {
			array: count*3,
			itemSize: 3
		},
		nextPosition: {
			array: count*3,
			itemSize: 3
		},
		previousPosition: {
			array: count*3,
			itemSize: 3
		},
		direction: {
			array: count,
			itemSize: 1
		},
		width: {
			array: count,
			itemSize: 1
		},
	}).forEach(geometry => {
		this.add(new THREE.Mesh(geometry, new THREE.ShaderMaterial({
			vertexShader: shaders['header'] + shaders['ribbon.vert'],
			fragmentShader: shaders['header'] + shaders['ribbon.frag'],
			uniforms: uniforms,
			side: THREE.DoubleSide,
		})))
	})

	this.update = function (elapsed) {
		for (var c = this.children.count - 1; c >= 0; --c) {
			//c.geometry.attributes.position.copyWithin(1;
			for (var i = 0; i < count; ++i) {
				c.geometry.attributes.position[i * 3] = Math.cos(i * .1);
				c.geometry.attributes.position[i * 3 + 1] = Math.sin(i * .1);
				c.geometry.attributes.position[i * 3 + 2] = 0;
			}

			for (var i = 0; i < count - 1; ++i) {
				c.geometry.attributes.previousPosition[i * 3] = c.geometry.attributes.position[i * 3 + 3];
				c.geometry.attributes.previousPosition[i * 3 + 1] = c.geometry.attributes.position[i * 3 + 4];
				c.geometry.attributes.previousPosition[i * 3 + 2] = c.geometry.attributes.position[i * 3 + 5];
			}

			c.geometry.attributes.previousPosition[count * 3 - 3] = c.geometry.attributes.position[count * 3 - 3];
			c.geometry.attributes.previousPosition[count * 3 - 2] = c.geometry.attributes.position[count * 3 - 2];
			c.geometry.attributes.previousPosition[count * 3 - 1] = c.geometry.attributes.position[count * 3 - 1];

			for (var i = 0; i < count - 1; ++i) {
				c.geometry.attributes.previousPosition[i * 3] = c.geometry.attributes.position[i * 3 + 3];
			}
		}
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
