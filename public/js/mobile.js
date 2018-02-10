window.onload = function () {
	var PRESSURE_INCREASE = 0.00002; // when shaking, m.s-2.ms-1
	var PRESSURE_INCREASE_ACCELERATION_THRESHOLD = 10; // when shaking, m.s-2
	var PRESSURE_DECREASE = - 0.0001; // when spraying, ms-1

	var socket = io();

	socket.on('connect', function () {
		socket.emit('mobile');
	});

	var sprayContainer = document.getElementById('spray-container');
	var sprayColor = document.getElementById('spray-color');
	var colorContainer = document.getElementById('color-container');

	var colors = [
		'#ff6cc7',
		'#84f460',
		'#fee471',
		'#6e94ff',
		'#fff',
	];

	function chooseColor(color) {
		sprayColor.style.background = color;
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

	var sprayId = null;

	function isSprayOn() {
		return sprayId !== null;
	}

	sprayContainer.addEventListener('touchstart', function (event) {
		event.preventDefault();
		socket.emit('spray-on');

		previousDate = Date.now();

		sprayId = setInterval(function () {
			var delta = (Date.now() - previousDate) * PRESSURE_DECREASE;
			previousDate = Date.now();
			updatePressure(delta);
		});
	}, false);

	sprayContainer.addEventListener('touchend', function (event) {
		event.preventDefault();
		clearInterval(sprayId);
		sprayId = null;
	}, false);

	var pressure = 1;
	function updatePressure(delta) {
		pressure += delta;
		if (pressure < 0) pressure = 0;
		if (pressure > 1) pressure = 1;
		sprayColor.style.height = (pressure * 100) + '%';
		socket.emit('spray-pressure', pressure);
	}

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
		var previousMotionDate = Date.now();
		window.addEventListener('devicemotion', function (event) {
			var acc = event.acceleration;
			socket.emit('acceleration', [acc.x, acc.y, acc.z]);

			if (!isSprayOn()) {
				var length = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
				if (length >= PRESSURE_INCREASE_ACCELERATION_THRESHOLD) {
					var delta = (Date.now() - previousMotionDate) * length * PRESSURE_INCREASE;
					updatePressure(delta);
				}
			}

			previousMotionDate = Date.now();
		}, true);
	}
};
