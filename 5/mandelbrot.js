function mandelbrot(p0, p) {return [p[0]*p[0]-p[1]*p[1]+p0[0], 2*p[0]*p[1]+p0[1]];}

function normSquared(p) {return p[0]*p[0]+p[1]*p[1];}

function numIterations(p0) {
    var n = 0;
    var escape = false;
    var p = [p0[0], p0[1]];
    while (n < 16 && !escape) {
	p = mandelbrot(p0, p);
	if (normSquared(p) > 4) escape = true;
	n++;
    }
    if (escape) {return n}
    else {return -1};
}

function toHex(num) {
    return (num < 16) ? "0"+num.toString(16): num.toString(16);
}

function color(num) {
    if (num == -1) {return "#000"}
    else {
	var gb = Math.floor(num/2);
	return "#"+toHex(num*16)+toHex(gb*16)+toHex(gb*16);
    }
}

var xmin = -2.0;
var xmax = 1.0;
var xstep = 0.01;
var ymin = -1.5;
var ymax = 1.5;
var ystep = 0.01;
var width = 400;
var height = 400;

var xScale = d3.scale.linear()
    .domain([xmin, xmax])
    .range([0, width]);

var yScale = d3.scale.linear()
    .domain([ymin, ymax])
    .range([0, height]);

xs = d3.range(xmin, xmax, xstep);
ys = d3.range(ymin, ymax, ystep);

data = [];
var x, y, cellWidth, cellHeight;

for (var j = 0; j < xs.length; j++) {
    for (var k = 0; k < ys.length; k++) {
	x = xs[j];
	y = ys[k];
	width = 0;
	height = 0;
	if (xs[j+1]) {cellWidth = Math.floor(xScale(xs[j+1])-xScale(xs[j]))+1;}
	if (ys[k+1]) {cellHeight = Math.floor(yScale(ys[k+1])-yScale(ys[k]))+1;}
	data.push({
	    x: x,
	    y: y,
	    value: color(numIterations([x, y])),
	    width: cellWidth,
	    height: cellHeight});
    }
}

svg = d3.select("#ms")
    .append("svg")

svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", function(d) {return xScale(d.x)})
    .attr("y", function(d) {return yScale(d.y)})
    .attr("width", function(d) {return d.width})
    .attr("height", function(d) {return d.height})
    .attr("fill", function(d) {return d.value});

