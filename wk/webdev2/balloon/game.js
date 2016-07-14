function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

const COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

var popped = 0;
var score = 0;

var Balloon = function () {
    this.x = Math.random() * window.innerWidth;
    this.y = document.querySelector('#wall').offsetTop;
    this.type = (Math.random() < 0.2 ? 'bad' : 'good');
    this.color = COLORS[randomInt(0, 6)];
    this.alive = true;
    this.speed = 5;
    
    if (this.type == 'bad') {
        this.color = 'black';
    }
    
    // <div class="balloon-box"></div>
    this.box = document.createElement('div');
    this.box.setAttribute('class', 'balloon-box');
    this.box.style.top = this.y + 'px';
    this.box.style.left = this.x + 'px';
    
    // <img src="{color}_balloon.png" class="balloon">
    var balloon = document.createElement('img');
    balloon.setAttribute('src', 'res/' + this.color + '_balloon.png');
    balloon.setAttribute('class', 'balloon');
    balloon.addEventListener('click', function (event) {
        popped += 1;
        score += (this.type == 'good' ? 1 : -1);
        
        // Update the score box
        document.querySelector('#popped').innerHTML = 'Popped: ' + popped;
        document.querySelector('#points').innerHTML = 'Score: ' + score;
        
        this.alive = false;
        document.body.removeChild(this.box);
        console.log(this.type, popped, score);
    }.bind(this));
    
    // <img src="string.png">
    var str = document.createElement('img');
    str.setAttribute('src', 'res/string.png');
    
    // Stick the <img>s into the <div>
    this.box.appendChild(balloon);
    this.box.appendChild(str);
    
    // Stick <div> at end of body
    document.body.appendChild(this.box);
    
    this.update = function() {
        this.y = this.y - this.speed;
        this.box.style.top = this.y + 'px';
    };
};

var balloons = [];

function updateAll() {
    var i = 0;
    var len = balloons.length;
    while (i < len) {
        var balloon = balloons[i];
        balloon.update();
        if (balloon.y < -500 || !balloon.alive) {
            balloons.splice(i, 1);
            len = balloons.length;
            continue;
        }
        i += 1;
    }
}

setInterval(updateAll, 33);

function randomBalloon() {
    balloons.push(new Balloon());
}

setInterval(randomBalloon, 1000);