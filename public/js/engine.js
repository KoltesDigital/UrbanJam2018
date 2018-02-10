
var PI2 = Math.PI/2.;

window.onload = function () {

	var frameElapsed = 0;
	var elapsed = 0;

	var renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 100);
	camera.position.z = 5;
	var level, cursor, ui;
	var round = 0;
	var win = false;
	var transitionIn = false;
	var transitionOut = false;
	var transitionDelayIn = 1.;
	var transitionDelay = 10;
	var transitionStart = 0.;
	var transitionCanceled = false;
	load(setup);

	function setup () {

		document.body.style.cursor = 'none';

		level = generateLevel(scene, round);

		cursor = new Cursor();
		scene.add(cursor);

		ui = new UI();
		scene.add(ui);

		document.addEventListener('keydown', Keyboard.onKeyDown);
		document.addEventListener('keyup', Keyboard.onKeyUp);
		document.addEventListener('mousemove', Mouse.onMove);
		document.addEventListener('mousedown', Mouse.onMouseDown);
		document.addEventListener('mouseup', Mouse.onMouseUp);
		document.addEventListener('touchmove', Mouse.onTouchMove, {passive: false});
		document.addEventListener('touchstart', Mouse.onTouchDown, {passive: false});
		document.addEventListener('touchend', Mouse.onTouchUp, {passive: false});
		window.addEventListener('resize', resize, false);

		requestAnimationFrame( update );
	}

	function checkGlobalConnexion(start, outlets){
		var toVisit = [];
		toVisit.push(start);
		var visited = [];
		var connected = [];
		var visiting = null;
		while(toVisit.length > 0){
			visiting = toVisit[toVisit.length-1];
			toVisit.pop();
			if(connected.indexOf(visiting) == -1){
				connected.push(visiting);
			}
			visited.push(visiting);
			if (outlets[visiting] != undefined) {
				for(var i =0; i< outlets[visiting].neighbors.length; i++){
					var neighborNum = outlets[visiting].neighbors[i];
					if(visited.indexOf(neighborNum) == -1){
						toVisit.push(neighborNum);
					}
				}
			}
		}
		return connected;
	}

	function skipTransition(){
		transitionCanceled = true;
	}
	
	function update (elapsed) {
		elapsed *= .001;
		var delta = Math.max(0, Math.min(1, elapsed - frameElapsed));
		var mousex = (Mouse.x/window.innerWidth)*2.-1.;
		var mousey = (1.-Mouse.y/window.innerHeight)*2.-1.;
		var lastMouseX = (Mouse.lastX/window.innerWidth)*2.-1.;
		var lastMouseY = (1.-Mouse.lastY/window.innerHeight)*2.-1.;
		var mouse = [mousex, mousey, 0];
		cursor.uniforms.mouse.value = mouse;
		cursor.setDefault();

		var plugRatioTotal = 0;
		var plugCount = 0;

		if (transitionCanceled || (transitionOut && transitionStart + transitionDelay < elapsed)) {
			transitionOut = false;
			transitionIn = true;
			transitionStart = elapsed;
			resetLevel(scene, level);
			round += 1;
			level = generateLevel(scene, round);
			document.removeEventListener("mousedown", skipTransition);
			document.removeEventListener("touchstart", skipTransition);
			transitionCanceled = false;
		}
		
		if (transitionIn && transitionStart + transitionDelayIn < elapsed) {
			transitionIn = false;
		}
		
		if (transitionIn && transitionStart + transitionDelayIn > elapsed) {
			var ratio = Math.max(0, Math.min(1, (elapsed-transitionStart)/transitionDelayIn));
			level.outlets.forEach(function(outlet){
				outlet.updateUniforms(elapsed);
				outlet.uniforms.alpha.value = ratio;
			})
			level.cables.forEach(function(cable){
				cable.update(elapsed, delta);
				cable.updatePlugs();
				cable.updateGeometry();
				cable.updateUniforms(elapsed);
				cable.uniforms.alpha.value = ratio;
				cable.plugs.forEach(function(plug){
					plug.uniforms.alpha.value = ratio;
				});
			})
		}

		if (transitionIn == false && transitionOut == false) {
			var colliding = [];
			if (cursor.drag) {
				if (Mouse.down) {
					cursor.setGrab();
					var s = 0;
					var count = cursor.selecteds.length;
					cursor.selecteds.forEach(function(selected){
						var x = .03*Math.cos(2*Math.PI*s/count);
						var y = .03*Math.sin(2*Math.PI*s/count);
						level.cables[selected].move([mouse[0]+x,mouse[1]+y,0], delta);
						++s;
					})

				} else {
					cursor.drag = false;
					cursor.selecteds = [];
				}
			}

			var hitList = [];

			for (var c = 0; c < level.cables.length; ++c) {

				var pointSelected = level.cables[c].hitTest(mouse);
				if (!cursor.drag && pointSelected != -1) {
					cursor.setHover();
					hitList.push([c, pointSelected]);
				}

				level.cables[c].update(elapsed, delta);

				var plugs = level.cables[c].plugs;
				for (var p = 0; p < plugs.length; ++p) {
					var outlets = level.outlets;

					var plugged = false;
					var outletTarget = [0,0,0];
					for (var o = 0; o < outlets.length; ++o) {
						
						if (outlets[o].hitTestCircle(plugs[p].target[0], plugs[p].target[1], plugs[p].size)) {
							plugged = true;
							outletTarget = outlets[o].target;
							if(plugs[1-p].outlet != null){
								outlets[o].addNeighBor(plugs[1-p].outlet);
								outlets[plugs[1-p].outlet].addNeighBor(o);
							}
							if(plugs[p].outlet != o){
								plugs[p].outlet = o;
								var connexions = checkGlobalConnexion(o, outlets);
								if(connexions.length == outlets.length){
									win = true;
								}
							}
						} else {
							if(plugs[p].outlet == o){
								plugs[p].outlet = null;
								if(plugs[1-p].outlet != null){
									outlets[o].rmNeighBor(plugs[1-p].outlet);
									outlets[plugs[1-p].outlet].rmNeighBor(o);
								}
							}
						}
					}
					for (var o = 0; o < outlets.length; ++o) {
						for (var n =0; n< outlets[o].neighbors.lenght; n++){
							if(outlets[outlets[o].neighbors[n]].neighbors.indexOf(o) == -1){
								outlets[o].rmNeighBor(outlets[o].neighbors[n]);
							}
						}
					}

					if (plugged) {
						plugs[p].ratio = Math.min(1, plugs[p].ratio + .01);
						var points = level.cables[c].points;
						var index = p*(points.length-1);
						level.cables[c].moveAt(index, outletTarget, delta);
					} else {
						plugs[p].ratio = Math.max(0, plugs[p].ratio - .01);
					}

					plugRatioTotal += plugs[p].ratio;
					plugCount += 1;
				}

				level.cables[c].updatePlugs();
				level.cables[c].updateGeometry();
				level.cables[c].updateUniforms(elapsed);
			}

			for (var o = 0; o < level.outlets.length; ++o) {
				level.outlets[o].updateUniforms(elapsed);
			}

			if (hitList.length > 0) {
				if (!cursor.drag && Mouse.down) {
					cursor.drag = true;
					hitList.forEach(function(hit){
						cursor.selecteds.push(hit[0]);
						level.cables[hit[0]].selected = hit[1];
					})
				}
			}
		}
		
		if (transitionOut && transitionStart + transitionDelay > elapsed) {
			var ratio = Math.max(0, Math.min(1, (elapsed-transitionStart)/transitionDelay));
			var fadeOut = 1.-smoothstep(.9,1.,ratio);
			level.outlets.forEach(function(outlet){
				outlet.updateUniforms(elapsed);
				outlet.uniforms.alpha.value = fadeOut;
			})
			level.cables.forEach(function(cable){
				cable.swing(elapsed, delta);
				cable.updatePlugs();
				cable.updateGeometry();
				cable.updateUniforms(elapsed);
				cable.uniforms.alpha.value = fadeOut;
				cable.plugs.forEach(function(plug){
					plug.uniforms.alpha.value = 1.-smoothstep(.8,.99,ratio);
				});
			})
		}

		if (plugRatioTotal == plugCount && win) {
			win = false;
			transitionOut = true;
			transitionStart = elapsed;
			transitionCanceled = false;
			document.addEventListener("mousedown", skipTransition);
			document.addEventListener("touchstart", skipTransition);
		}

		renderer.render( scene, camera );
		frameElapsed = elapsed;
		requestAnimationFrame( update );
	}

	function resize () {
		var width = window.innerWidth;
		var height = window.innerHeight;
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize( width, height );
		level.cables.forEach(function(cable){
			cable.resize(width, height);
		});
		level.outlets.forEach(function(outlet){
			outlet.resize(width, height);
		});
		cursor.resize(width, height);
		ui.resize(width, height);
	}
}