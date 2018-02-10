window.onload = function () {  // Fix up prefixing
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	context = new AudioContext();

	bufferLoader = new BufferLoader(
		context,
		[
			'sounds/shaking.mp3',
			'sounds/spray.mp3',
		],
		finishedLoading
	);

	bufferLoader.load();
}

function createSource(buffer) {
	var source = context.createBufferSource();
	var gainNode = context.createGain();
	source.buffer = buffer;
	source.loop = true;
	source.connect(gainNode);
	gainNode.connect(context.destination);

	var started = false;

	return {
		source: source,
		gainNode: gainNode,
		start: function() {
			if (started) return;
			source.start(0);
			started = true;
		}
	};
}

function finishedLoading(bufferList) {
	var audioShaking = createSource(bufferList[0]);
	var audioSpray = createSource(bufferList[1]);
	var currTime = context.currentTime;
	audioShaking.gainNode.gain.linearRampToValueAtTime(0, currTime);
	audioSpray.gainNode.gain.linearRampToValueAtTime(0, currTime);

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
		'#ee4035',
		'#f37736',
		'#fdf498',
		'#7bc043',
		'#0392cf',
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
		element.addEventListener('touchstart', function(event) {
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

		sprayContainer.classList.add('spray-on');

		previousDate = Date.now();

		if (isSprayOn()) {
			clearInterval(sprayId);
		}

		sprayId = setInterval(function () {
			var delta = (Date.now() - previousDate) * PRESSURE_DECREASE;
			previousDate = Date.now();
			updatePressure(delta);
		});

		audioShaking.start();
		audioSpray.start();

		audioSpray.gainNode.gain.linearRampToValueAtTime(.5, context.currentTime + .1);
	}, false);

	sprayContainer.addEventListener('touchend', function (event) {
		event.preventDefault();
		socket.emit('spray-off');

		clearInterval(sprayId);
		sprayId = null;

		sprayContainer.classList.remove('spray-on');

		audioSpray.gainNode.gain.linearRampToValueAtTime(0, context.currentTime + .1);
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

			var increased = false;
			if (!isSprayOn()) {
				var length = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
				if (length >= PRESSURE_INCREASE_ACCELERATION_THRESHOLD) {
					var delta = (Date.now() - previousMotionDate) * length * PRESSURE_INCREASE;
					updatePressure(delta);
					increased = true;
				}
			}

			audioShaking.gainNode.gain.setTargetAtTime(increased ? 1 : 0, context.currentTime, .1);

			previousMotionDate = Date.now();
		}, true);
	}
};
