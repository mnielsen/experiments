var CIRCLE = Math.PI * 2;

function Controls() {
    this.codes = {37: 'left', 39: 'right', 38: 'forward', 40: 'backward'};
    this.states = {'left': false, 'right': false, 'forward': false, 'backward': false};
    // We're listening for the "keydown" event, the listener is the
    // method this.onKey[etc].  
    //
    // It took me some work to understand the use of bind here.  I
    // think that what's going on is simply that the callback will be
    // called outside the original context, and so this will have
    // changed.  We need to bind it to the particular instance of
    // Controls.
    //
    // I am not certain of this, and need to understand it better.
    // But that's not bad as a first increment on learning.
    //
    // Note that a reading of the document.addEventListener docs at
    // MDN appears to confirm this.
    //
    // I think that the moral to take away is that it's wise to be
    // careful when adding event listeners, and make sure that this is
    // bound in the right way.
    document.addEventListener('keydown', this.onKey.bind(this, true));
    document.addEventListener('keyup', this.onKey.bind(this, false));
}

Controls.prototype.onKey = function(val, e) {
    // e.keycode is apparently the Javascript keycode, which we convert
    // to something more human-friendly 
    var state = this.codes[e.keyCode];
    // If the keycode wasn't recognized, don't worry, just exit
    if (typeof state === 'undefined') return;
    // Put us into the right state
    this.states[state] = val;
    // Now we have to cancel the event
    e.preventDefault && e.preventDefault();
    e.stopPropagation && e.stopPropagation();
};


function Bitmap(src, width, height) {
    this.image = new Image();
    this.image.src = src;
    this.width = width;
    this.height = height;
}

function Player(x, y, direction) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.weapon = new Bitmap('knife_hand.png', 319, 320);
    this.paces = 0;
}

Player.prototype.rotate = function(angle) {
    this.direction = (this.direction+angle+CIRCLE) % (CIRCLE);
};

Player.prototype.walk = function(distance, map) {
    var dx = Math.cos(this.direction) * distance;
    var dy = Math.sin(this.direction) * distance;
    if (map.get(this.x+dx, this.y) <= 0) {this.x += dx;}
    if (map.get(this.x, this.y + dy) <=0) {this.y += dy;}
    this.pacs += distance;
};

Player.prototype.update = function(controls, map, seconds) {
    // I believe that seconds here is how long the control has been
    // active since the last update.  If that's the case, then we
    // rotate at 180 degrees per second, and move forward and back at
    // 3 units per second.
    if (controls.left) this.rotate(-Math.PI * seconds);
    if (controls.right) this.rotate(Math.PI * seconds);
    if (controls.forward) this.walk(3 * seconds, map);
    if (controls.backward) this.walk(-3*seconds, map);
};

function Map(size) {
    this.size = size;
    // a size by size array of 8 bit, unsigned integers
    this.wallGrid = new Uint8Array(size * size)
    this.skybox = new Bitmap('background.JPG', 3072, 2304);
    this.wallTexture = new Bitmap('texture.JPG', 1024, 1024);
    this.light = 3;
}

Map.prototype.get = function(x, y) {
    x = Math.floor(x);
    y = Math.floor(y);
    // check if offmap
    if (x < 0 || x > this.size-1 || y < 0 || y > this.size-1) return -1;
    return this.wallGrid[y*this.size+x];
};

Map.prototype.cast = function(point, angle, range) {
    // Why do this?  Why not just use this?
    var self = this; 
    var sin = Math.sin(angle);
    var cos = Math.cos(angle);
    // Why length2?  Why not length?
    var noWall = { length2: Infinity };

    return ray({ x: point.x, y: point.y, height: 0, distance: 0 });

    function ray(origin) {
        var stepX = step(sin, cos, origin.x, origin.y);
        var stepY = step(cos, sin, origin.y, origin.x, true);
        var nextStep = stepX.length2 < stepY.length2
            ? inspect(stepX, 1, 0, origin.distance, stepX.y)
            : inspect(stepY, 0, 1, origin.distance, stepY.x);

        if (nextStep.distance > range) return [origin];
        return [origin].concat(ray(nextStep));
    }

    function step(rise, run, x, y, inverted) {
        if (run === 0) return noWall;
        var dx = run > 0 ? Math.floor(x + 1) - x : Math.ceil(x - 1) - x;
        var dy = dx * (rise / run);
        return {
            x: inverted ? y + dy : x + dx,
            y: inverted ? x + dx : y + dy,
            length2: dx * dx + dy * dy
        };
    }
    
    function inspect(step, shiftX, shiftY, distance, offset) {
        var dx = cos < 0 ? shiftX : 0;
        var dy = sin < 0 ? shiftY : 0;
        step.height = self.get(step.x - dx, step.y - dy);
        step.distance = distance + Math.sqrt(step.length2);
        if (shiftX) step.shading = cos < 0 ? 2 : 0;
        else step.shading = sin < 0 ? 2 : 1;
        step.offset = offset - Math.floor(offset);
        return step;
    }
};

Map.prototype.randomize = function() {
    for (var i = 0; i < this.size * this.size; i++) {
	this.wallGrid[i] = Math.random() < 0.3 ? 1 : 0;
    }
};

function Camera(canvas, resolution, fov) {
    // Creat an object that lets us work with our canvas
    this.ctx = canvas.getContext('2d');
    // I don't get the factor 0.5
    this.width = canvas.width = window.innerWidth * 0.5;
    this.height = canvas.height = window.innerHeight * 0.5;
    this.resolution = resolution;
    // Why define this?  
    this.spacing = this.width / this.resolution;
    this.fov = fov;
    this.range = 14;
    this.lightRange = 5;
    this.scale = (this.width + this.height) / 1200;
}

Camera.prototype.render = function(player, map) {
    this.drawSky(player.direction, map.skybox, map.light);
    this.drawColumns(player, map);
    this.drawWeapon(player.weapon, player.paces);
};

Camera.prototype.drawSky = function(direction, sky, ambient) {
    var width = this.width * (CIRCLE / this.fov);
    var left = -width * direction / CIRCLE;

    // Push a copy of the current canvas state onto a stack
    this.ctx.save();
    // Place the image appropriately on the canvas
    this.ctx.drawImage(sky.image, left, 0, width, this.height);
    // Deal with wrapping, I think
    if (left < width - this.width) {
	this.ctx.drawImage(sky.image, left+width, 0, width, this.height);
    }
    if (ambient > 0) {
	this.ctx.fillStyle = '#fff';
	this.ctx.globalAlpha = ambient * 0.1;
	this.ctx.fillRect(0, this.height * 0.5, this.width, this.height*0.5);
    }
    // I don't quite get why we do this save-restore trick.  Is it to buffer
    // the display somehow?
    this.ctx.restore();
};

Camera.prototype.drawColumns = function(player, map) {
    // Iterates over the columns, computing the angles and then using
    // map.cast to compute the ray and then this.drawColumn
    this.ctx.save();
    for (var column=0; column < this.resolution; column++) {
	var angle = this.fov * (column / this.resolution-0.5);
	var ray = map.cast(player, player.direction+angle, this.range);
	this.drawColumn(column, ray, angle, map);
    }
    this.ctx.restore();
};

Camera.prototype.drawWeapon = function(weapon, paces) {
    var bobX = Math.cos(paces * 2) * this.scale * 6;
    var bobY = Math.sin(paces * 4) * this.scale * 6;
    var left = this.width * 0.66 + bobX;
    var top = this.height * 0.6 + bobY;
    this.ctx.drawImage(weapon.image, left, top, 
		       weapon.width * this.scale, weapon.height * this.scale);
};

Camera.prototype.drawColumn = function(column, ray, angle, map) {
    var ctx = this.ctx;
    var texture = map.wallTexture;
    var left = Math.floor(column * this.spacing);
    var width = Math.ceil(this.spacing);
    var hit = -1;

    while (++hit < ray.length && ray[hit].height <= 0);
    
    for (var s = ray.length - 1; s >= 0; s--) {
        var step = ray[s];

        if (s === hit) {
            var textureX = Math.floor(texture.width * step.offset);
            var wall = this.project(step.height, angle, step.distance);

            ctx.globalAlpha = 1;
            ctx.drawImage(texture.image, textureX, 0, 1, 
			  texture.height, left, wall.top, width, wall.height);
            
            ctx.fillStyle = '#000000';
            ctx.globalAlpha = Math.max((step.distance + step.shading) / this.lightRange - map.light, 0);
            ctx.fillRect(left, wall.top, width, wall.height);
        }
          
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.15;
    }
};

Camera.prototype.project = function(height, angle, distance) {
    var z = distance * Math.cos(angle);
    var wallHeight = this.height * height / z;
    var bottom = this.height / 2 * (1 + 1 / z);
    return {
        top: bottom - wallHeight,
        height: wallHeight
    }; 
};

function GameLoop() {
    this.frame = this.frame.bind(this);
    this.lastTime = 0;
    // The callback is a dummy.  We'll actually set it in the start
    // method.
    this.callback = function() {};
}

GameLoop.prototype.start = function(callback) {
    // We pass in the call
    this.callback = callback;
    requestAnimationFrame(this.frame);
};

GameLoop.prototype.frame = function(time) {
    // Comput the length of time since last frame
    var seconds = (time-this.lastTime) / 1000;
    // Update the lastTime
    this.lastTime = time;
    // I don't understand why the next stuff works
    if (seconds < 0.2) this.callback(seconds);
    requestAnimationFrame(this.frame);
}

var display = document.getElementById('display');
var map = new Map(32);
map.randomize();
var player = new Player(15.3, -1.2, Math.PI * 0.3);
var controls = new Controls();
var camera = new Camera(display, 320, Math.PI * 0.4);
var loop = new GameLoop();

loop.start(function frame(seconds) {
    player.update(controls.states, map, seconds);
    camera.render(player, map);
});
