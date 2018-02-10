var socket = io();

socket.on('connect', function() {
	socket.emit('mobile');
});

if (window.DeviceOrientationEvent) {
	window.addEventListener("deviceorientation", function (event) {
		socket.emit('orientation', [event.alpha, event.beta, event.gamma]);
	}, true);
} else {
	window.addEventListener("MozOrientation", function (event) {
		socket.emit('orientation', [event.alpha, event.beta, event.gamma]);
	}, true);
}

if (window.DeviceMotionEvent) {
	window.addEventListener('devicemotion', function (event) {
		var acc = event.acceleration;
		socket.emit('acceleration', [acc.x,acc.y,acc.z]);
		console.log(acc);
	}, true);
}

window.onload = function() {
	var sprayContainer = document.getElementById('spray-container');
	var colorContainer = document.getElementById('color-container');

	var colors = [
		'#ff6cc7',
		'#84f460',
		'#fee471',
		'#6e94ff',
		'#fff',
	];

	function chooseColor(color) {
		sprayContainer.style.background = color;
		socket.emit('color', color);
	}

	chooseColor(colors[Math.floor(Math.random() * colors.length)]);

	var colorElements = colors.map(function(color) {
		var element = document.createElement('div');
		element.className = 'color';
		element.style.background = color;
		element.addEventListener('click', function(event) {
			event.preventDefault();
			chooseColor(color);
		}, false);
		colorContainer.appendChild(element);
		return element;
	});

	resize();
	window.addEventListener('resize', resize, false);

	function resize() {
		var width = window.innerWidth;
		var height = window.innerHeight;

		var colorWidth;

		if (width > height) {
			sprayContainer.style.top = '0px';
			sprayContainer.style.left = ((width - height) / 2) + 'px';
			sprayContainer.style.width = sprayContainer.style.height = height + 'px';
			colorContainer.style.height = '100%';
			colorContainer.style.width = '0px';
			colorWidth = .15 * height;
		} else {
			sprayContainer.style.left = '0px';
			sprayContainer.style.top = ((height - width) / 2) + 'px';
			sprayContainer.style.width = sprayContainer.style.height = width + 'px';
			colorContainer.style.width = '100%';
			colorContainer.style.height = 'initial';
			colorWidth = .15 * width;
		}

		colorElements.forEach(function(element) {
			element.style.width = colorWidth + 'px';
		});
	}
};
