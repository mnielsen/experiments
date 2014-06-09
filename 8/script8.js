var flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false;

var x = "black",
    y = 2;

$(function() {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext("2d");
    w = canvas.width;
    h = canvas.height;
    canvas.addEventListener("mousemove", function (e) {
        findxy(canvas, ctx, 'move', e)
    }, false);
    canvas.addEventListener("mousedown", function (e) {
        findxy(canvas, ctx, 'down', e)
    }, false);
    canvas.addEventListener("mouseup", function (e) {
        findxy(canvas, ctx, 'up', e)
    }, false);
    canvas.addEventListener("mouseout", function (e) {
        findxy(canvas, ctx, 'out', e)
    }, false);
});

function color(obj) {
    x = obj.id;
}

function draw(ctx) {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = x;
    ctx.lineWidth = y;
    ctx.stroke();
    ctx.closePath();
}

function findxy(canvas, ctx, res, e) {
    if (res == 'down') {
        prevX = currX;
        prevY = currY;
        currX = e.clientX - canvas.offsetLeft;
        currY = e.clientY - canvas.offsetTop;

        flag = true;
        dot_flag = true;
        if (dot_flag) {
            ctx.beginPath();
            ctx.fillStyle = x;
            ctx.fillRect(currX, currY, 2, 2);
            ctx.closePath();
            dot_flag = false;
        }
    }
    if (res == 'up' || res == "out") {
        flag = false;
    }
    if (res == 'move') {

        if (flag) {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - canvas.offsetLeft;
            currY = e.clientY - canvas.offsetTop;
            draw(ctx);
        }
    }
}
