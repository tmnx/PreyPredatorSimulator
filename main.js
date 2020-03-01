// Global variables

var wolves = [];
var bunnies = [];

var wolfInitPopulation = 3;
var bunnyInitPopulation = 30;

var friction = 1;

/**
 * Check if 2 objects collide with each other.
 * 
 * @param object1 an object with height and width
 * @param object2 an object with height and width
 */
function collided(object1, object2) {
    return (object1.x < object2.x + object2.width && 
        object1.x + object1.width > object2.x && 
        object1.y < object2.y + object2.height && 
        object1.y + object1.height > object2.y);
}

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function DisplayStats(game) {
    this.game = game;
    this.day = 0;
    Entity.call(this, game, 0, 0);
}

DisplayStats.prototype = new Entity();
DisplayStats.prototype.constructor = DisplayStats;
DisplayStats.prototype.update = function() {
    this.day++;
}
DisplayStats.prototype.draw = function(ctx) {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 150, 50);

    ctx.fillStyle = "black";
    ctx.font = "12px Verdana";
    ctx.fillText("Bunny Population: " + bunnies.length, 5, 15);

    ctx.fillStyle = "blue";
    ctx.font = "12px Verdana";
    ctx.fillText("Wolf Population: " + wolves.length, 5, 30);

    ctx.fillStyle = "red";
    ctx.font = "12px Verdana";
    ctx.fillText("Day: " + this.day, 5, 45);
}


// main code begins here
var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/bunny26x17.png");
ASSET_MANAGER.queueDownload("./img/wolf32x28.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();

    for (var i = 0; i < bunnyInitPopulation; i++) {
        var bunny = new Bunny(gameEngine);
        // gameEngine.addEntity(bunny);
        bunnies.push(bunny);
    }

    for (var i = 0; i < wolfInitPopulation; i++) {
        var wolf = new Wolf(gameEngine);
        // gameEngine.addEntity(wolf);
        wolves.push(wolf);
    }

    gameEngine.addEntity(new DisplayStats(gameEngine));

    gameEngine.init(ctx);
    gameEngine.start();
});