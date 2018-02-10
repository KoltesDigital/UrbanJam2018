

function lerp(v0, v1, t) {
	return v0*(1-t)+v1*t;
}

function closestPowerOfTwo (num) {
	return Math.pow(2, Math.ceil(Math.log(num) / Math.log(2)));
}

function distance (ax,ay,bx,by) {
  return Math.sqrt((ax-bx)*(ax-bx)+(ay-by)*(ay-by));
}

function distance3 (ax,ay,az,bx,by,bz) {
	return Math.sqrt((ax-bx)*(ax-bx)+(ay-by)*(ay-by)+(az-bz)*(az-bz));
}

function direction (ax,ay,bx,by) {
	return [bx-ax, by-ay];
}

function directionNorm (ax,ay,bx,by) {
	return [bx-ax/Math.sqrt((ax-bx)*(ax-bx)+(ay-by)*(ay-by)), by-ay/Math.sqrt((ax-bx)*(ax-bx)+(ay-by)*(ay-by))];
}

function shuffle (array) {
  for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
  return array;
}

function smoothstep (edge0, edge1, x) {
  var t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function randomRange (min, max) {
    return min+Math.random()*(max-min);
}