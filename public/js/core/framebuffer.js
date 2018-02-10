
function FrameBuffer (options) {
	options = options || {};
	this.renderTextures = [];
	this.currentIndex = 0;
	this.count = options.count || 2;
	for (var i = 0; i < this.count; ++i) {
		this.renderTextures.push(new THREE.WebGLRenderTarget(
			options.width || window.innerWidth,
			options.height || window.innerHeight, {
				format: options.format || THREE.RGBAFormat,
				type: options.type || THREE.FloatType,
				minFilter: options.min || THREE.NearestFilter,
				magFilter: options.mag || THREE.NearestFilter,
				stencilBuffer: options.stencil || true,
				depthBuffer: options.depth || true
			}));
	}

	this.quad = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), options.material);
	this.camera = new THREE.PerspectiveCamera(75, 1, 0.01, 100);
	this.camera.position.z = 5;
	this.renderer = options.render;

	this.update = function() {
		this.swap();
		this.renderer.render(this.quad, this.camera, this.getRenderTarget(), true);
	}

	this.getRenderTarget = function() {
		return this.renderTextures[this.currentIndex];
	}

	this.getTexture = function() {
		return this.renderTextures[this.currentIndex].texture;
	}

	this.swap = function() {
		this.currentIndex = (this.currentIndex + 1) % this.count;
	}

	this.setSize = function(width, height) {
		for (var i = 0; i < this.count; ++i) {
			this.renderTextures[i].setSize(width, height);
		}
	}

	this.update();
}

function createDataTexture (dataArray, itemSize) {
    var dimension = closestPowerOfTwo(Math.sqrt(dataArray.length / itemSize));
    var array = [];
    var count = dimension * dimension;
    for (var t = 0; t < count; ++t) {
        if (t*itemSize+itemSize-1 < dataArray.length) {
            for (var i = 0; i < 3; ++i) {
                if (i < itemSize) {
                    array.push(dataArray[t*itemSize+i]);
                } else {
                    array.push(0);
                }
            }
        } else {
            array.push(0,0,0);
        }
    }
    var typedArray = new Float32Array(array);
    var texture = new THREE.DataTexture(typedArray, dimension, dimension, THREE.RGBFormat, THREE.FloatType);
    texture.needsUpdate = true;
    return texture;
}