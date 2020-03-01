function Bunny(game) {
    this.game = game;
    this.width = 26;
    this.height = 17;
    this.radius = 12;
    this.visualRadius = 500;

    this.back = false;
    this.direction = "right";
    
    this.walkBackward = new Animation(ASSET_MANAGER.getAsset("./img/bunny26x17.png"), 0, 0, 26, 17, 0.2, 3, true, false);
    this.walkForward = new Animation(ASSET_MANAGER.getAsset("./img/bunny26x17.png"), 0, 17, 26, 17, 0.2, 3, true, false);
    
    this.deathTime = 450;
    this.lifeTime = 0;
    this.reproductiveTime = 400;
    this.birthRate = 3;
    this.gaveBirth = false;
    
    this.acceleration = 1000000;
    this.maxSpeed = 150;
    this.walkTime = 30;

    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));

    this.velocity = { x: Math.random() * 1000, y: Math.random() * 1000 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > this.maxSpeed) {
        var ratio = this.maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
};

Bunny.prototype = new Entity();
Bunny.prototype.constructor = Bunny;

Bunny.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Bunny.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Bunny.prototype.collideRight = function () {
    return (this.x + this.radius) > 770;
};

Bunny.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Bunny.prototype.collideBottom = function () {
    return (this.y + this.radius) > 770;
};

Bunny.prototype.update = function () {
    Entity.prototype.update.call(this);

    this.lifeTime++;

    if (this.lifeTime >= this.deathTime) {
        this.removeFromWorld = true;
    }

    for (var i = 0; i < wolves.length; i++) {
        if (collided(this, wolves[i])) {
            this.removeFromWorld = true;
        }
    }

    if (this.lifeTime >= this.reproductiveTime && !this.gaveBirth) {
        this.gaveBirth = true;
        for (var i = 0; i < this.birthRate; i++) {
            var bunny = new Bunny(this.game);
            bunnies.push(bunny);
        }
    }

    if (this.direction == "up") {
        this.y -= this.velocity.y * this.game.clockTick;
    } else if (this.direction == "down") {
        this.y += this.velocity.y * this.game.clockTick;
    } else if (this.direction == "left") {
        this.x -= this.velocity.x * this.game.clockTick;
        this.back = true;
    } else {
        this.x += this.velocity.x * this.game.clockTick;
        this.back = false;
    }

    this.walkTime--;
    
    var rand = Math.random();

    // pick a random direction
    if (this.walkTime == 0) {
        this.walkTime = 30;
        if (rand > 0.75) {
            this.direction = "up";
        } else if (rand > 0.5) {
            this.direction = "down";
        } else if (rand > 0.25) {
            this.direction = "left";
            this.back = true;
        } else {
            this.direction = "right";
            this.back = false;
        }
    }

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) {
            this.x = this.radius;
            this.direction = "right";
            this.back = false;
        }
        if (this.collideRight()) {
            this.x = 770 - this.radius;
            this.direction = "left";
            this.back = true;
        }
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 770 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

Bunny.prototype.draw = function (ctx) {
    if (!this.back) {
        this.walkForward.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1);
    } else {
        this.walkBackward.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1);
    }
};