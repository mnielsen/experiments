$(function() {
    var width = 60; 
    var height = 60; 
    var cellWidth = 10;
    var cellHeight = 10;
    var liveCellColour = "#FFCD33";

    // A label for the x, y'th element of the grid.  This is used as
    // the property in the grid object. It won't much matter what the
    // label is, provided it's unique.
    function label(x, y) {return (x+y*width).toString();}

    // Initialize the grid with a glider
    var grid = {};
    for (var x=0; x < width; x++) {
	for (var y=0; y < height; y++) {
	    grid[label(x,y)] = 0;
	}
    }
    grid[label(1, 0)] = grid[label(2, 1)] = grid[label(0, 2)] = grid[label(1, 2)]
	= grid[label(2, 2)] = 1;

    
    // Returns the updated grid
    function updateGrid(grid) {
	var n, newGrid = {};
	for (var x=0; x < width; x++) {
	    for (var y=0; y < height; y++) {
		n = liveNeighbours(grid, x, y);
		curLabel = label(x, y);
		newGrid[curLabel] = ((grid[curLabel] == 0 && n ==3) ||
		    (grid[curLabel] == 1 && (n < 2 || n > 3))) ? 
		    1-grid[curLabel] : grid[curLabel];
	    }
	}
	return newGrid;
    }

    // Return the number of live neighbours of position (x, y)
    function liveNeighbours(grid, x, y) {
	var n = 0;
	for (var j = -1; j <=1; j++) {
	    for (var k = -1; k <= 1; k++) {
		n += grid[label((x+j+width) % width, (y+k+height) % height)];
	    }
	}
	return n-grid[label(x, y)];
    }

    // DISPLAY
    var gridCanvas = $("#gridCanvas")[0];
    var ctx = gridCanvas.getContext("2d");

    displayGrid(grid, ctx);
    
    function displayGrid(grid, ctx) {
	for (var x=0; x < width; x++) {
	    for (var y=0; y < height; y++) {
		drawCell(x, y, grid[label(x, y)]);
	    }
	}
    }

    function drawCell(x, y, data) {
	ctx.fillStyle = (data ==  "1") ? liveCellColour : "white";
	ctx.fillRect(x*cellWidth, y*cellHeight, cellWidth, cellHeight);
    }
	
    // Add the ability to click a cell
    gridCanvas.addEventListener("click", function(e) {
	var mousePos = getMousePos(gridCanvas, e);
	var x = Math.floor(mousePos.x/cellWidth);
	var y = Math.floor(mousePos.y/cellHeight);
	grid[label(x, y)] = 1-grid[label(x, y)];
	drawCell(x, y, grid[label(x, y)]);
    });

    function getMousePos(canvas, e) {
	var rect = canvas.getBoundingClientRect();
	return {x: e.clientX - rect.left, y: e.clientY - rect.top};
    }
    
    
    // Add the animation
    var time, anim = false;

    $("#start").click(function() {
	$("#start").hide();
	$("#stop").show();
	anim = true;
	time = Date.now();
	window.requestAnimationFrame(animate);
    });

    function animate() {
	if (Date.now() > time+200) {
	    time = Date.now();
	    grid = updateGrid(grid);
	    displayGrid(grid, ctx);
	}
	if (anim) {window.requestAnimationFrame(animate)};
    };

    $("#stop").click(function() {
	$("#start").show();
	$("#stop").hide();
	anim = false;
    }); 

});


