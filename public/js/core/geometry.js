
function createGeometry (attributes, subdivisions) {
	subdivisions = subdivisions || [1,1];
	var count = attributes.position.array.length / attributes.position.itemSize;
	var geometries = [];
	var verticesMax = 65000;
	var dimension = closestPowerOfTwo(Math.sqrt(count));
	var geometryCount = 1 + Math.floor(count / verticesMax);
	var faces = [subdivisions[0]+1, subdivisions[1]+1];
	var quadCount = subdivisions[0] * subdivisions[1];
	for (var m = 0; m < geometryCount; ++m) {

		var vertexCount = count;
		if (geometryCount > 1) {
			if (m == geometryCount - 1) count = count % verticesMax;
			else vertexCount = verticesMax;
		}

		var arrays = {};
		var anchors = [];
		var indexMap = [];
		var indices = [];
		var vIndex = 0;
		var attributeNames = Object.keys(attributes);
		attributeNames.forEach(name => { arrays[name] = []; });

		for (var index = 0; index < vertexCount; ++index) {
			var u = (index % dimension) / dimension;
			var v = Math.floor(index / dimension) / dimension;
			for (var y = 0; y < faces[1]; ++y) {
				for (var x = 0; x < faces[0]; ++x) {
					attributeNames.forEach(name => {
						var itemSize = attributes[name].itemSize;
						var array = attributes[name].array;
						for (var i = 0; i < itemSize; i++) {
							arrays[name].push(array[index*itemSize+i]);
						}
					});
					var anchorX = x / subdivisions[0];
					var anchorY = y / subdivisions[1];
					anchors.push(anchorX*2.-1., anchorY*2.-1.);
					indexMap.push(u,v);
				}
			}
			for (var y = 0; y < subdivisions[1]; ++y) {
				for (var x = 0; x < subdivisions[0]; ++x) {
					indices.push(vIndex, vIndex+1, vIndex+1+subdivisions[0]);
					indices.push(vIndex+1+subdivisions[0], vIndex+1, vIndex+2+subdivisions[0]);
					vIndex += 1;
				}
				vIndex += 1;
			}
			vIndex += faces[0];
		}

		var geometry = new THREE.BufferGeometry();
		attributeNames.forEach(name => {
			var array = new Float32Array(arrays[name]);
			geometry.addAttribute(name, new THREE.BufferAttribute(array, attributes[name].itemSize));
		});
		geometry.addAttribute( 'anchor', new THREE.BufferAttribute( new Float32Array(anchors), 2 ) );
		geometry.addAttribute( 'indexMap', new THREE.BufferAttribute( new Float32Array(indexMap), 2 ) );
		geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
		geometries.push(geometry);
	}
	return geometries;
}

function getPoints (count) {
    var points = [];
    for (var i = 0; i < count * 3; ++i) points.push(0);
    return points;
}

function getValues (count) {
    var values = [];
    for (var i = 0; i < count; ++i) values.push(0);
    return values;
}

function getRandomPoints (count) {
    var points = [];
    for (var i = 0; i < count * 3; ++i) points.push(randomRange(-1,1));
    return points;
}

function randomPositionAttribute (count) {
    return {
        position: {
            array: getRandomPoints(count),
            itemSize: 3
        }
    };
}