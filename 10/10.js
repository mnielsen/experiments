function scrubbableNumber(n, id) {
    this.n = n;
    this.number = $(id);
    this.content = $(id+"Content");
    this.lineIcon = $(id+"LineIcon");
    this.exponentialIcon = $(id+"ExponentialIcon");
    this.newN = undefined;
    this.futureContract = undefined;
    this.startX = undefined;


    
    this.content.text(format(this.n));
    drawLineIcon(this.lineIcon);
    drawExponentialIcon(this.exponentialIcon);

    this.number.mouseover(function() {
	this.number.css("backgroundColor", "#ddd");
	this.lineIcon.show();
	this.exponentialIcon.show();
    }.bind(this));
    this.number.mouseout(function() {
	if (!this.linearSelected && !this.exponentialSelected) {
	    this.lineIcon.hide();
	    this.exponentialIcon.hide();
	    this.number.css("backgroundColor", "white");
	}
    }.bind(this));

    this.lineIcon.selectionFlag = false;
    this.createIconEvents(this.lineIcon, this.lineIconScaling);

    this.exponentialIcon.selectionFlag = false;
    this.createIconEvents(this.exponentialIcon, this.exponentialIconScaling);


};


scrubbableNumber.prototype.createIconEvents = function(icon, rescaling) {
    icon.mouseover(function() {
	icon.css("border", "solid 1px red"); 
    } )
    icon.mouseout(function() {
	if (!icon.selectionFlag) {
	    icon.css("border", "solid 1px #888");
	} else {
	    this.futureContract = true;
	};
    }.bind(this));
    icon.mousedown(function(e) {
	icon.selectionFlag = true;
	this.startX = mousePosition(e).x;
	this.newN = this.n;
    }.bind(this));
    $("html").mousemove(function(e) {
	if (icon.selectionFlag) {
	    var delta = mousePosition(e).x-this.startX;
	    this.newN = rescaling(this.n, delta);
	    this.content.text(format(this.newN));
	};
    }.bind(this));
    $("html").mouseup(function() {
	if (icon.selectionFlag) {
	    icon.selectionFlag = false;
	    this.n = this.newN;
	    this.content.text(this.n);
	    icon.css("border", "solid 1px #888");
	    if (this.futureContract) {
		this.futureContract = false;
		this.exponentialIcon.hide();
		this.lineIcon.hide();
		this.number.css("backgroundColor", "white");
	    };
	};
    }.bind(this));
};

scrubbableNumber.prototype.lineIconScaling = function(n, delta) {
    return n+Math.round(delta/3);
}

scrubbableNumber.prototype.exponentialIconScaling = function(n, delta) {
    return Math.round(n*Math.pow(1.1, Math.round(delta/3)));
}

$(function() {
    var n1 = new scrubbableNumber(21, "#n1");
    var n2 = new scrubbableNumber(47, "#n2");
});

function format(n) {
    return Math.round(n).toString();
};

function mousePosition(e) {
    return {"x": e.pageX, "y": e.pageY};
};


function drawLineIcon(lineIcon) {
    var context = lineIcon[0].getContext("2d");
    context.beginPath();
    context.moveTo(1,10);
    context.lineTo(10, 1);
    context.strokeStyle = "red"; // "#2a6ea6";
    context.stroke();
}

function drawExponentialIcon(exponentialIcon) {
    // Compute the points to be plotted
    var exponentialData = [];
    var c = Math.log(100)/9;
    for (var x = 0; x < 10; x++) {
	exponentialData.push({"x": x+1.5, "y": 9.5-Math.round((1/10)*Math.exp(c*x))});
    }
    // Plot the points
    var context = exponentialIcon[0].getContext("2d");
    context.beginPath();
    for (var x = 0; x < 9; x++) {
	context.moveTo(exponentialData[x].x, exponentialData[x].y);
	context.lineTo(exponentialData[x+1].x, exponentialData[x+1].y);
    }
    context.strokeStyle = "#2a6ea6";
    context.stroke();
}
