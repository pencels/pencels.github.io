var Balloon = function (type, color) {
    this.x = Math.random() * window.innerWidth;
    this.y = document.querySelector('#wall').offsetTop;
    this.type = type;
    this.color = color;
    this.speed = 5;
    
    // <div class="balloon-box"></div>
    var box = document.createElement('div');
    box.setAttribute('class', 'balloon-box');
    
    // <img src="{color}_balloon.png" class="balloon">
    var balloon = document.createElement('img');
    balloon.setAttribute('src', 'res/' + this.color + '_balloon.png');
    balloon.setAttribute('class', 'balloon');
    
    // <img src="string.png">
    var str = document.createElement('img');
    str.setAttribute('src', 'res/string.png');
    
    // Stick the <img>s into the <div>
    box.appendChild(balloon);
    box.appendChild(str);
    
    // Stick <div> at end of body
    document.body.appendChild(box);
    
    this.update = function() {
        this.y = this.y - this.speed;
    };
};

new Balloon('good', 'red');