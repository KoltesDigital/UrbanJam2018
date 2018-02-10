var Mouse = {}

Mouse.x = 0
Mouse.y = 0
Mouse.down = false

Mouse.lastX = 0
Mouse.lastY = 0
Mouse.panX = 0
Mouse.panY = 0
Mouse.panStartX = 0
Mouse.panStartY = 0
Mouse.panStarted = false

Mouse.onMove = function(event)
{
	Mouse.lastX = Mouse.x;
	Mouse.lastY = Mouse.y;
	Mouse.x = event.clientX
	Mouse.y = event.clientY
	if (Mouse.panStarted)
	{
		Mouse.panX = Mouse.x - Mouse.panStartX
		Mouse.panY = Mouse.y - Mouse.panStartY
	}
}

Mouse.onMouseDown = function(event)
{
	Mouse.x = event.clientX
	Mouse.y = event.clientY
	Mouse.down = true

	// Pan
	Mouse.panStartX = Mouse.x - Mouse.panX
	Mouse.panStartY = Mouse.y - Mouse.panY
	Mouse.panStarted = true
}

Mouse.onMouseUp = function(event)
{
	Mouse.down = false
	Mouse.panStarted = false
} 

Mouse.onTouchMove = function(event)
{
	event.preventDefault()
	Mouse.lastX = Mouse.x;
	Mouse.lastY = Mouse.y;
	Mouse.x = event.changedTouches[0].pageX
	Mouse.y = event.changedTouches[0].pageY
	if (Mouse.panStarted)
	{
		Mouse.panX = Mouse.x - Mouse.panStartX
		Mouse.panY = Mouse.y - Mouse.panStartY
	}
}

Mouse.onTouchDown = function(event)
{
	event.preventDefault()
	Mouse.x = event.changedTouches[0].pageX
	Mouse.y = event.changedTouches[0].pageY
	Mouse.down = true

	// Pan
	Mouse.panStartX = Mouse.x - Mouse.panX
	Mouse.panStartY = Mouse.y - Mouse.panY
	Mouse.panStarted = true
}

Mouse.onTouchUp = function(event)
{

	event.preventDefault()
	Mouse.down = false
	Mouse.panStarted = false
} 