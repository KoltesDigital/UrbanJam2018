
var textures = {};
var textureLoader = new THREE.TextureLoader();
var textureLoaded = 0;
var textureUrls = [
	// { name:'cursor', url:'images/cursor.png' },
];
var textureCount = 0;

var shaders = {};
var shaderLoader = new THREE.FileLoader();
var shaderLoaded = 0;
var shaderUrls = [
	// { name:'cable.frag', url:'shaders/cable.frag' },
];
var shaderCount = 0;

var callbackOnLoad = null;

function loadedTexture (key, data) {
	textures[key] = data;
	if (Object.keys(textures).length == textureCount && Object.keys(shaders).length == shaderCount) {
		if (callbackOnLoad != null) {
			callbackOnLoad();
		}
	}
}

function loadedShader (key, data) {
	shaders[key] = data;
	if (Object.keys(textures).length == textureCount && Object.keys(shaders).length == shaderCount) {
		if (callbackOnLoad != null) {
			callbackOnLoad();
		}
	}
}

function load (textureUrls_, shaderUrls_, callback) {
	textureUrls = textureUrls_ || [];
	shaderUrls = shaderUrls_ || [];
	textureCount = textureUrls.length
	shaderCount = shaderUrls.length;
	callbackOnLoad = callback;
	textureUrls.forEach(item => {
		textureLoader.load(item.url, data => loadedTexture(item.name, data));});
	shaderUrls.forEach(item => {
		shaderLoader.load(item.url, data => loadedShader(item.name, data)); });
}