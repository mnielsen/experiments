// The Game of Life

// Basic setup.  Sets the number of cells across, cells down, and the
// probability threshold for a cell to initially be active

var width = 100; 
var height = 100; 
var threshold = 0.85; 

// Initialize the grid
var grid = getRandomGrid();

function getRandomGrid() {
    var grid = [];
    for (var k = 0; k < height; k++) {grid.push(getRandomRow());}
    return grid;
}

function getRandomRow() {
    var row = [];
    for (var j = 0; j < width; j++) {row.push(getRandomBit());};
    return row;
}

function getRandomBit() { return Math.random() > threshold ? 1 : 0;};

// Return the updated grid
function updateGrid(grid) {
    var newGrid = [];
    var n;
    for (var k = 0; k < height; k++) {
	var newRow = [];
	for (var j = 0; j < width; j++) {
	    n = liveNeighbours(grid, j, k);
	    if (grid[k][j] == 1 && n < 2) {
		newRow.push(0)
	    } else if (grid[k][j] == 1 && n > 3) {
		newRow.push(0)
	    } else if (grid[k][j] == 0 && n == 3) {
		newRow.push(1)
	    } else {
		newRow.push(grid[k][j])
	    }
	}
	newGrid.push(newRow);
    }
    return newGrid;
}

// Return the number of live neighbours of position (x, y)
function liveNeighbours(grid, x, y) {
    var n = 0;
    for (var k = -1; k <=1; k++) {
	for (var j = -1; j <= 1; j++) {
	    n += grid[(y+k+height) % height][(x+j+width) % width]
	    }
	}
    return n-grid[y][x];
}


// DISPLAY

// Basic parameters

var cellWidth = 5;
var cellHeight = 5;
var liveCellColour = "#FFCD33";

var xScale = d3.scale.linear()
    .domain([0, width])
    .range([0, width*cellWidth])

var yScale = d3.scale.linear()
    .domain([0, height])
    .range([0, height*cellHeight])

// Packs the grid into an array which is easy to manipulate using D3's
// way of representing joins between data and DOM elements
function toData(grid) {
    var d = [];
    for (var k = 0; k < height; k++) {
	for (var j = 0; j < width; j++) {
	    d.push({"x": j, "y": k, "state": grid[k][j] == 0 ? false : true});
	};
    };
    return d;
}

var svg = d3.select("#container")
    .append("svg")
    .attr("width", width*cellWidth)
    .attr("height", height*cellHeight)

function color(state) {
    return state ? liveCellColour : "white";
}

svg.selectAll("rect")
    .data(function() {return toData(grid)})
    .enter().append("rect")
    .attr("x", function(d) {return xScale(d.x);})
    .attr("y", function(d) {return yScale(d.y);})
    .attr("width", cellWidth)
    .attr("height", cellHeight)
    .attr("fill", function(d) {return color(d.state)});

function animate() {
    grid = updateGrid(grid);
    d3.selectAll("rect")
	.data(toData(grid))
	.transition()
	.attr("fill", function(d) {return color(d.state)})
	.delay(0.1)
	.duration(0)
}

setInterval("animate()", 500)

