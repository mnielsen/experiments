// Draw a chessboard

$(function() {
    var canvas = $("#board")[0]
    var board = canvas.getContext("2d");
    var size = 32; 
    var xmin = 0;
    var ymin = 0;

    var data = {};
    for (var x = 0; x < 8; x++) {
	for (var y = 0; y < 8; y++) {
	    data[[x,y]] = (x+y) % 2;
	    drawSquare(x, y, data);
	}
    }
	
    function drawSquare(x, y, data) {
	board.fillStyle = (data[[x, y]] == 0 ? "white" : "black");
	board.fillRect(xmin+x*size, ymin+y*size, size, size);
    }

    canvas.addEventListener("click", function(e) {
	var mousePos = getMousePos(canvas, e);
	var mouseX = mousePos.x;
	var mouseY = mousePos.y;
	var x = Math.floor(mouseX/size);
	var y = Math.floor(mouseY/size);
	data[[x, y]] = 1-data[[x, y]];
	drawSquare(x, y, data);
    }, false);

    function getMousePos(canvas, e) {
	var rect = canvas.getBoundingClientRect();
	return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
	};
    }

});
