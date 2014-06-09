var canvas, ctx;
var oldCanvas;
var startPosition, finalPosition;
var mouseDown = false;

$(function() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    $("#canvas").mousedown(function(e) {
	saveCanvas();
	startPosition = finalPosition = mousePosition(e);
	mouseDown = true;
    });
    $("#canvas").mousemove(function(e) {
	if (mouseDown) {
	    restoreCanvas();
	    redrawLine(e);
	};
    });

    $("#canvas").mouseup(function(e) {
	redrawLine(e);
	mouseDown = false;
    });
});

function redrawLine(e) {
    restoreCanvas();
    finalPosition = mousePosition(e);
    ctx.beginPath();
    ctx.moveTo(startPosition.x, startPosition.y);
    ctx.lineTo(finalPosition.x, finalPosition.y);
    ctx.stroke();
};

function saveCanvas() {
    oldCanvas = new Image();
    oldCanvas.src = canvas.toDataURL("image/png");
}

function restoreCanvas() {
    canvas.width = canvas.width;
    ctx.drawImage(oldCanvas, 0, 0);
}

function mousePosition(e) {
    return {
	"x": e.clientX - canvas.offsetLeft,
	"y": e.clientY - canvas.offsetTop
    };
};

