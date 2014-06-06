// Draw a chessboard

$(function() {
    var canvas = $("#board")[0]
    var ctx = canvas.getContext("2d");
    var size = 32; 
    var xmin = 0;
    var ymin = 0;

    var data = {};
    for (var x = 0; x < 8; x++) {
	for (var y = 0; y < 8; y++) {
	    data[label(x,y)] = (x+y) % 2;
	    drawSquare(x, y, data);
	}
    }
	
    function label(x, y) {
	return (x+y*8).toString()
    }

    function drawSquare(x, y, data) {
	ctx.fillStyle = (data[label(x, y)] == 0 ? "white" : "black");
	ctx.fillRect(xmin+x*size, ymin+y*size, size, size);
    }

    canvas.addEventListener("click", function(e) {
	var mousePos = getMousePos(canvas, e);
	var mouseX = mousePos.x;
	var mouseY = mousePos.y;
	var x = Math.floor(mouseX/size);
	var y = Math.floor(mouseY/size);
	data[label(x,y)] = 1-data[label(x, y)];
	drawSquare(x, y, data);
    });

    function getMousePos(canvas, e) {
	var rect = canvas.getBoundingClientRect();
	return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
	};
    }

});
