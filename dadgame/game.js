function sel(s) {
    return document.querySelector(s);
}

var Vector = function(x, y) {
    this.x = x;
    this.y = y;
}

Vector.prototype.move = function(dx, dy) {
    this.x += dx;
    this.y += dy;
}

var Sprite = function(image) {
    this.pos = new Vector(0, 400);
    this.vel = new Vector(0, 0);
    this.state = {
        'left': false,
        'right': false,
        'jump': false
    };
    this.elem = document.createElement('img');
    this.elem.setAttribute('src', image);
    this.elem.setAttribute('id', 'player');
    this.elem.style.position = 'absolute';
    sel('#game-canvas').appendChild(this.elem);

    var sprite = this;
    this.elem.onload = function() {
        sprite.width = this.naturalWidth;
        sprite.height = this.naturalHeight;
    };

    this.update();
};

Sprite.prototype.__gravity = function() {
    if (this.state.jump)
        this.vel.y += 1;

    if (this.pos.y >= 400) {
        this.vel.y = 0;
        this.state.jump = false;
    }
};

Sprite.prototype.__canmove = function() {
    return (this.pos.x + this.vel.x) > 0 &&
           (this.pos.x + this.width + this.vel.x) < window.innerWidth;
};

Sprite.prototype.update = function() {
    this.vel.x = this.state.right - this.state.left;
    if (this.__canmove())
        this.move(this.vel.x, 0);
    this.move(0, this.vel.y);
    this.__gravity();

    this.elem.style.left = this.pos.x + 'px';
    this.elem.style.top = this.pos.y + 'px';
};

Sprite.prototype.move = function(dx, dy) {
    this.pos.move(dx, dy);
};

Sprite.prototype.walk = function(direction, state) {
    this.state[direction] = (state ? 10 : 0);
};

Sprite.prototype.jump = function() {
    if (!this.state.jump) {
        this.vel.y = -20;
        this.state.jump = true;
    }
};

function main() {
    var player = new Sprite('./idle.png');

    var img = sel('img');
    console.log(img);

    // Set event handlers.
    document.addEventListener('keydown', function (event) {
        switch (event.key) {
            case 'Up':
            case 'ArrowUp':
                player.jump();
                break;

            case 'Left':
            case 'ArrowLeft':
                player.walk('left', true);
                break;

            case 'Right':
            case 'ArrowRight':
                player.walk('right', true);
                break;

            default:
                console.log(event.key);
        }
    });

    document.addEventListener('keyup', function (event) {
        switch (event.key) {
            case 'Left':
            case 'ArrowLeft':
                player.walk('left', false);
                break;

            case 'Right':
            case 'ArrowRight':
                player.walk('right', false);
                break;

            default:
                console.log(event.key);
        }
    });

    setInterval(function (thing) {
        player.update();
    }, 16);
}

main();
