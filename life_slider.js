// The Game of Life, with slider to do a random setup

// Basic setup.  Sets the number of cells across, cells down, and the
// probability threshold for a cell to initially be active

var width = 50; 
var height = 50; 
var threshold = 0.15; 

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

function getRandomBit() { return Math.random() < threshold ? 1 : 0;};

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

$(function() {
    $("#blank").click(function() {
	console.log("Hello");
	threshold = 0;
	grid=getRandomGrid();
	updateDisplay();
    });
    $("#glider").click(function() {
	threshold = 0;
	grid=getRandomGrid();
	grid[0][1] = 1;
	grid[1][2] = 1;
	grid[2][0] = 1;
	grid[2][1] = 1;
	grid[2][2] = 1;
	updateDisplay();
    });

    $("#slider").slider({
	min: 0,
	max: 100,
	value: threshold*100,
	slide: function( event, ui ) {
	    $("#percentage").val(ui.value);
	},
	stop: function(event, ui ) {
	    threshold = $("#slider").slider("value")/100.0;
	    grid = getRandomGrid();
	    updateDisplay();
	}
    });
    $("#percentage").val($("#slider").slider("value"));
    var interval_id;
    $("#start").click(function() {
	$("#blank").hide();
	$("#glider").hide();
	$("#slider").hide();
	$("#percentage_text").hide();
	$("#start").hide();
	$("#stop").show();
	interval_id = setInterval("animate()", 500);
    });
    $("#stop").click(function() {
	$("#blank").show();
	$("#glider").show();
	$("#slider").show();
	$("#percentage_text").show();
	$("#start").show();
	$("#stop").hide();
	clearInterval(interval_id);
    });
});

// DISPLAY

// Basic parameters

var cellWidth = 10;
var cellHeight = 10;
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

var svg = d3.select("#grid")
    .append("svg")
    .attr("width", width*cellWidth)
    .attr("height", height*cellHeight)

function color(state) {
    return state ? liveCellColour : "white";
}

var mouse;

svg.selectAll("rect")
    .data(toData(grid))
    .enter().append("rect")
    .attr("x", function(d) {return xScale(d.x);})
    .attr("y", function(d) {return yScale(d.y);})
    .attr("width", cellWidth)
    .attr("height", cellHeight)
    .attr("fill", function(d) {return color(d.state)});

//    .on("mouseup", function() {mouse = false;})
//    .on("mousedown", function() {mouse = true;})
//    .on("mousemove", function(d, i) {
	// if (mouse) {
	//     var c = coord(i);
	//     console.log(c);
	//     grid[c[1]][c[0]] = 1-grid[c[1]][c[0]];
	//     };
	// updateGrid(grid);
	// });

function coord(i) {
    var x = i % width;
    var y = Math.floor(i/width);
    return [x, y];
}

function animate() {
    grid = updateGrid(grid);
    updateDisplay();
}

function updateDisplay() {
    d3.selectAll("rect")
	.data(toData(grid))
	.transition()
	.attr("fill", function(d) {return color(d.state)})
	.delay(0.1)
	.duration(0)
}


