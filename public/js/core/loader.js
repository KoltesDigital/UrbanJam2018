
var textures = {};
var textureLoader = new THREE.TextureLoader();
var textureLoaded = 0;
var textureUrls = [];
var textureCount = 0;

var shaders = {};
var shaderLoader = new THREE.FileLoader();
var shaderLoaded = 0;
var shaderUrls = [];
var shaderCount = 0;

var meshes = {};
var meshLoader = new THREE.OBJLoader();
var meshLoaded = 0;
var meshUrls = [];
var meshCount = 0;

var callbackOnLoad = null;

function loadedAll () {
	return Object.keys(textures).length == textureCount
	&& Object.keys(shaders).length == shaderCount
	&& Object.keys(meshes).length == meshCount;
}

function loadedTexture (key, data) {
	textures[key] = data;
	if (loadedAll()) {
		if (callbackOnLoad != null) {
			callbackOnLoad();
		}
	}
}

function loadedShader (key, data) {
	shaders[key] = data;
	if (loadedAll()) {
		if (callbackOnLoad != null) {
			callbackOnLoad();
		}
	}
}

function loadedMesh (key, data) {
	meshes[key] = data;
	if (loadedAll()) {
		if (callbackOnLoad != null) {
			callbackOnLoad();
		}
	}
}

function load (textureUrls_, shaderUrls_, meshUrls_, callback) {
	textureUrls = textureUrls_ || [];
	shaderUrls = shaderUrls_ || [];
	meshUrls = meshUrls_ || [];
	textureCount = textureUrls.length
	shaderCount = shaderUrls.length;
	meshCount = meshUrls.length;
	callbackOnLoad = callback;
	textureUrls.forEach(item => { textureLoader.load(item.url, data => loadedTexture(item.name, data));});
	shaderUrls.forEach(item => { shaderLoader.load(item.url, data => loadedShader(item.name, data)); });
	meshUrls.forEach(item => { meshLoader.load(item.url, data => loadedMesh(item.name, data)); });
}