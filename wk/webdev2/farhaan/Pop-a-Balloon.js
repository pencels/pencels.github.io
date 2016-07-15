'use strict';

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

const TYPES = ['good', 'bad'];
const COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

const POP_SOUND = new Audio ('Res/pop.mp3');

var popped = 0;
var score = 0;
var strikes = 0;

var CREATION_INTERVAL;
var ANIMATION_INTERVAL;

function gameOver() {
    clearInterval(CREATION_INTERVAL);
    clearInterval(ANIMATION_INTERVAL);

    setTimeout(function() {
        balloons.forEach(function (balloon) {
            document.body.removeChild(balloon.box);
        }); 
        
        balloons = [];
    }, 50);
}

document.querySelector('#splash-screen').style.display = 'block';

function strike() {
    strikes += 1
    var strikeBalloons = document.querySelectorAll('#strike-box img');
    for (var i = 0; i < strikes; i += 1) {
        strikeBalloons[i].setAttribute ('src', 'Res/strikes.jpg');
    }
    if (strikes == 5) {
        gameOver();
    }
}

var Balloon = function () {
    this.x = Math.random() * window.innerWidth;
    if (this.x < 0) this.x + 0;
    this.y = +document.querySelector('#wall').offsetTop;
    this.type = (Math.random() < 0.2 ? 'bad' : 'good');
    this.color = COLORS[randomInt(0,6)];
    this.alive = true;
    this.speed = 10;
    
    if (this.type == 'bad') {
        this.color = 'black';
    }
    
    this.box = document.createElement('div');
    this.box.setAttribute('class', 'balloon-box');
    this.box.style.top = this.y + 'px';
    this.box.style.left = this.x + 'px';
    
    var balloon = document.createElement('img');
    balloon.setAttribute('src', 'Res/' + this.color + '_balloon.png');
    balloon.setAttribute('class', 'balloon');
    balloon.addEventListener('mousedown', function (event) {
        POP_SOUND.play();
        popped += 1;
        score += (this.type == 'good' ? 1 : -1);
        
        if (this.type == 'bad') strike();
        
        document.querySelector('#popped').innerHTML = 'Popped: ' + popped;
        document.querySelector('#points').innerHTML = 'Score: ' + score;
        
        this.alive = false;
        console.log(this.type, popped, score);
    }.bind(this));
    
    var str = document.createElement('img');
    str.setAttribute('src', 'Res/' + 'string.png');
    
    this.box.appendChild(balloon);
    this.box.appendChild(str);
    
    document.body.appendChild(this.box);
    
    this.update = function() {
        this.y = this.y-this.speed;
        this.box.style.top = this.y + 'px';
        if (this.type == 'good' && this.y < -200) strike();
    };
};


var balloons = [];

function updateAll() {
    var i = 0;
    var len = balloons.length;
    while (i < len){
        var balloon = balloons[i];
        balloon.update();
        if (balloon.y < -200 || !balloon.alive){
            balloons.splice(i, 1);
            document.body.removeChild(balloon.box);
            len = balloons.length;
            continue;
        }
        i +=1;
    }
   
}

ANIMATION_INTERVAL = setInterval(updateAll, 33);

function randomBalloon(){
    balloons.push(new Balloon());
}

CREATION_INTERVAL = setInterval(randomBalloon, 1000);