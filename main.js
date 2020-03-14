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

var socket = io.connect("http://24.16.255.56:8888");


window.onload = function() {
    ASSET_MANAGER.downloadAll(function () {

        socket.on("connect", function () {
            console.log("Socket connected.")
        });
        socket.on("disconnect", function () {
            console.log("Socket disconnected.")
        });

        console.log("starting up da sheild");

        var canvas = document.getElementById('gameWorld');
        var ctx = canvas.getContext('2d');
    
        var gameEngine = new GameEngine();
    
        for (var i = 0; i < bunnyInitPopulation; i++) {
            var bunny = new Bunny(gameEngine);
            bunnies.push(bunny);
        }
    
        for (var i = 0; i < wolfInitPopulation; i++) {
            var wolf = new Wolf(gameEngine);
            wolves.push(wolf);
        }
        gameEngine.addEntity(new DisplayStats(gameEngine));

        gameEngine.init(ctx);
        gameEngine.start();

        var saveButton = document.getElementById("save");
        var loadButton = document.getElementById("load");

        saveButton.onclick = function() {
            console.log("saving");
            var saveData = {savedBunnies: [], savedWolves: [], savedDay: gameEngine.entities[0].day};
            for (var i = 0; i < bunnies.length; i++) {
                if (bunnies[i].removeFromWorld == false) {
                    var b = new Bunny(gameEngine);
                    b.x = bunnies[i].x;
                    b.y = bunnies[i].y;
                    b.direction = bunnies[i].direction;
                    b.birthRate = bunnies[i].birthRate;
                    b.acceleration = bunnies[i].acceleration;
                    b.back = bunnies[i].back;
                    b.lifeTime = bunnies[i].lifeTime;
                    b.gaveBirth = bunnies[i].gaveBirth;
                    saveData.savedBunnies.push(b);
                    console.log("bunny " + i);
                }
            }
            for (var i = 0; i < wolves.length; i++) {
                if (wolves[i].removeFromWorld == false) {
                    var b = new Wolf(gameEngine);
                    b.x = wolves[i].x;
                    b.y = wolves[i].y;
                    b.direction = wolves[i].direction;
                    b.birthRate = wolves[i].birthRate;
                    b.back = wolves[i].back;
                    b.lifeTime = wolves[i].lifeTime;
                    b.gaveBirth = wolves[i].gaveBirth;
                    saveData.savedWolves.push(b);
                    console.log("wolf " + i);
                }
            }
            console.log("saved bunnies and wolves");
            socket.emit("save", { studentname: "Minh Nguyen", statename: "MinhState", data: saveData});
            console.log(saveData);
        };
        

        loadButton.onclick = function() {
            console.log("load");
            socket.emit("load", { studentname: "Minh Nguyen", statename: "MinhSate"});
        };

        socket.on("load", function(data) {
            console.log(data);
            var bunniesState = data.data.savedBunnies;
            var wolvesState = data.data.savedWolves;
            
            wolves = [];
            bunnies = [];
            gameEngine.entities[0].day = data.data.savedDay;

            for (var i = 0; i < bunniesState; i++) {
                var b = new Bunny(gameEngine);
                b.x = bunniesState[i].x;
                b.y = bunniesState[i].y;
                b.direction = bunniesState[i].direction;
                b.birthRate = bunniesState[i].birthRate;
                b.acceleration = bunniesState[i].acceleration;
                b.back = bunniesState[i].back;
                b.lifeTime = bunniesState[i].lifeTime;
                b.gaveBirth = bunniesState[i].gaveBirth;
                bunnies.push(b);                
            }
            for (var i = 0; i < wolvesState; i++) {
                var b = new Wolf(gameEngine);
                b.x = wolvesState[i].x;
                b.y = wolvesState[i].y;
                b.direction = wolvesState[i].direction;
                b.birthRate = wolvesState[i].birthRate;
                b.back = wolvesState[i].back;
                b.lifeTime = wolvesState[i].lifeTime;
                b.gaveBirth = wolvesState[i].gaveBirth;
                wolves.push(b);                
            }
        });

    });
}

