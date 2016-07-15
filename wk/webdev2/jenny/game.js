function randomInt(min, max){
    return Math.floor(Math.random() * (max - min)) + min;
}

const TYPES = ['good', 'bad'];
const COLORS = ['red', 'orange', 'yellow', 'green', 'black', 'grey'];
const POP_SOUND = new Audio('res/324536_2104797-lq.mp3');



var popped = 0;
var score = 0;
var strikes = 0;

var CREATION_INTERVAL;
var ANIMATION_INTERVAL;

function gameOver() {
    
    clearInterval(CREATION_INTERVAL);
    clearInterval(ANIMATION_INTERVAL);
    
    setTimeout(function (){
    balloons.forEach(function (balloon){
        document.body.removeChild(balloon.box);
    });
    ballons = [];
    }, 50);
    

}

function strike(){
    strikes += 1;
    var strikeBox = document.querySelector('#strike-box');
    strikeBox.innerHTML = '';
    for (var i = 0; i< strikes; i +=1 ){
        var img = document.createElement('img');
        img.setAttribute('src', 'res/skl_zpsshesav2i.png');
        strikeBox.appendChild(img);
    }
    if(strikes == 5){
        gameOver();
    }
}

var Balloon = function () {
    this.x = Math.random() * window.innerWidth;
    if(this.x < 0) this.x = 0;
    this.y = document.querySelector('#wall').offsetTop;
    this.type = (Math.random() < 0.1 ? 'bad' : 'good');
    this.color = COLORS[randomInt(0, 6)];
    this.alive = true;
    this.speed = 5;
    
    if (this.type =='bad'){
        this.color = 'blue';
    }

    this.update = function () {
        this.y = this.y - this.speed;
        this.box.style.top = this.y + 'px';
    };
    
    
    //<div class="balloon-box"></div>
    this.box = document.createElement('div');
    this.box.setAttribute('class', 'balloon-box');
    this.box.style.top = this.y + 'px';
    this.box.style.left = this.x + 'px';
    
    
   
    //<img src ="{color}_balloon.png" class="balloon">
    var balloon = document.createElement('img');
    balloon.setAttribute('src', 'res/' + this.color + '_balloon.png');
    balloon.setAttribute('class', 'balloon ' + this.color);
    
    balloon.addEventListener('mousedown', function (event){
        POP_SOUND.play();
        popped += 1;
        score += (this.type == 'good' ? 1: -1);
        
        document.querySelector('#popped').innerHTML = 'Popped:' + popped;
        document.querySelector('#points').innerHTML = 'Score:' + score;
        
        this.alive = false;
        console.log(this.type, popped, score);
    }.bind(this));

    
    //<img src>="string.png">
    
    
    
    //Stick  the <img>s into the <div>
    this.box.appendChild(balloon);
    
    
    //Stick <div> at end of body
    document.body.appendChild(this.box);   
    
    this.update = function() {
        this.y = this.y - this.speed;
        this.box.style.top = this.y + 'px';
        if(this.type == 'good' && this.y < -200)
            strike();
    
    };
    
};

var balloons = [];

function updateAll() {
    var i = 0;
    var len = balloons.length;
    while(i < len){
        var balloon = balloons[i];
        balloon.update();
        if(balloon.y < -200 || !balloon.alive){
            balloons.splice(i, 1);
            document.body.removeChild(balloon.box);
            len = balloons.length;
            continue;
        }
        i += 1;
    }
}

    
ANIMATION_INTERVAL = setInterval(updateAll, 30);

function randomBalloon() {
    balloons.push(new Balloon());
}

CREATION_INTERVAL = setInterval(randomBalloon, 420);

