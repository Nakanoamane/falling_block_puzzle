// Constants
const fieldX = 10;
const fieldY = 20;
const overY = 2;

const minoSettings = {
    T: [[1, 1], [0, 1], [2, 1], [1, 0]],
    Z: [[1, 1], [1, 0], [0, 0], [2, 1]],
    L: [[2, 1], [1, 1], [2, 0], [0, 1]],
    O: [[1, 0], [2, 0], [1, 1], [2, 1]],
    S: [[1, 1], [1, 0], [0, 1], [2, 0]],
    I: [[0, 1], [1, 1], [2, 1], [3, 1]],
    J: [[0, 1], [1, 1], [2, 1], [0, 0]]
}
const minos = Object.keys(minoSettings);

const speedMax = 10;
const speedMin = 1;
const dropSpeed = 1000;

// Variables
let playStatus = false;

let score;
let time;
let timer;
let speed;
let dropTimer;

let current;
let next;
let hold;
let futures = [];
let field = [];

let minoColors = {};

// Get Elements
let $score = document.getElementById('score');
let $timeH = document.getElementById('timeH');
let $timeM = document.getElementById('timeM');
let $timeS = document.getElementById('timeS');

let $speed = document.getElementById('speed');

let $menu = document.getElementById('menu');
let $btnContinue = document.getElementById('btnContinue');
let $btnNewGame = document.getElementById('btnNewGame');
let $themeColor = document.getElementById('themeColor');
let $minoColor = document.getElementById('minoColor');
let $minos = {};
minos.forEach(m => {
    $minos[m] = document.getElementById(`mino${m}`);
});

// Get Contexts
let $field = document.getElementById('field');
let ctxField = $field.getContext('2d');

let $hold = document.getElementById('hold');
let ctxHold = $hold.getContext('2d');

let $next = document.getElementById('next');
let ctxNext = $next.getContext('2d');

let $futures = [];
let ctxFutures = [];
for (let i = 1; i <= 5; i++){
    let $el = document.getElementById(`future${i}`)
    $futures.push($el);
    ctxFutures.push($el.getContext('2d'));
}

// Class
class Block {
    ctx;
    size;
    color;
    x;
    y;

    constructor(attr = {}) {
        this.setAttr(attr);
    }

    setAttr(attr = {}) {
        this.ctx = attr['ctx'] ? attr['ctx'] : this.ctx;
        this.size = attr['size'] ? attr['size'] : this.size;
        this.color = attr['color'] ? attr['color'] : this.color;
        this.x = attr['x'] || attr['x'] === 0 ? attr['x'] : this.x;
        this.y = attr['y'] || attr['y'] === 0 ? attr['y'] : this.y;
    }

    write() {
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x, this.y, this.size, this.size);
    }

    clear() {
        this.ctx.clearRect(this.x, this.y, this.size, this.size);
    }

    rewrite(attr = {}) {
        this.clear();
        this.setAttr(attr);
        this.write();
    }

    fieldXY() {
        let x = this.x / ($field.width / fieldX);
        let y = this.y / ($field.height / fieldY);
        return [x, y]
    }
}

class Mino {
    type;
    ctx;
    size;
    color;
    x;
    y;
    blocks = [];

    constructor(attr = {}) {
        this.setAttr(attr);
    }

    setAttr(attr = {}) {
        this.type = attr['type'] ? attr['type'] : this.type;
        this.ctx = attr['ctx'] ? attr['ctx'] : this.ctx;
        this.size = attr['size'] ? attr['size'] : this.size;
        this.color = attr['type'] ? minoColors[attr['type']] : this.color;
        this.x = attr['x'] || attr['x'] === 0 ? attr['x'] : this.x;
        this.y = attr['y'] || attr['y'] === 0 ? attr['y'] : this.y;
    }

    write() {
        let settings = minoSettings[this.type];
        
        settings.forEach(array => {
            let attr = {
                ctx: this.ctx,
                size: this.size,
                color: this.color,
                x: this.x  + (array[0] * this.size),
                y: this.y + (array[1] * this.size)
            }
            let block = new Block(attr);
            block.write();
            this.blocks.push(block);
        });
    }

    clear() {
        this.blocks.forEach(block => { block.clear(); });
        this.blocks = [];
    }

    rewrite(attr) {
        this.clear();
        this.setAttr(attr);
        this.write();
    }

    move(to) {
        let table = {
            set: {},
            left: {x: this.x - this.size},
            right: {x: this.x + this.size},
            down: {y: this.y + this.size},
        }

        if (this.canMove(table[to])) {
            this.rewrite(table[to]);
        } else if (this.isLanded()) {
            landed();
        }
    }

    canMove(expection) {
        return true
    }

    rotate() {

    }

    canRotate() {

    }

    landed() {
        this.clear();
    }

    isLanded() {

    }
}

// Contoroll Mino
const createFieldMino = (type) => {
    let size = $field.width / fieldX;
    let x = size * 3;
    let y = size * -2;

    let attr = {
        type: type,
        ctx: ctxField,
        size: size,
        x: x,
        y: y
    };

    return new Mino(attr);
}

const createMinoInSquare = (canvas, ctx, type) => {
    let size = canvas.width / 5;
    let x = size * 1;
    if(['O', 'I'].includes(type)) {
        x = size * 0.5;
    }
    let y = size * 1.5;

    let attr = {
        type: type,
        ctx: ctx,
        size: size,
        x: x,
        y: y
    };

    return new Mino(attr);
}

const defaultMinoTypes = () => {
    let array = [];
    for(let i = 0; i < minos.length; i++) {
        let remains = minos.filter(m => !array.includes(m));
        let rand = (Math.random() * remains.length) | 0;
        array.push(remains[rand]);
    }
    return array;
}

const setFirstMinos = () => {
    let types = defaultMinoTypes();

    current = createFieldMino(types.shift());
    current.write();
    
    next = createMinoInSquare($next, ctxNext, types.shift());
    next.write();

    types.forEach((t, i) => {
        let m = createMinoInSquare($futures[i], ctxFutures[i], t);
        m.write();
        futures.push(m);
    });
}

const nextMino = () => {
    current = createFieldMino(next.type);
    current.write();

    next.clear();
    futures.forEach(f => { f.clear();})
    next = createMinoInSquare($next, ctxNext, futures.shift().type);
    next.write();

    let rand = (Math.random() * minos.length) | 0;
    let newMino = createMinoInSquare($futures[-1], ctxFutures[-1], minos[rand]);
    futures.push(newMino);
    futures.forEach((f, i)=> { 
        f.rewrite({ctx: ctxFutures[i+1]});
    })
}


// Controll Speed
const displaySpeed = () => {
    let cl = $speed.classList;
    let oldClassName = [].slice.apply(cl).find(c => c.startsWith('speed'));
    let newClassName = `speed${speed}`;

    cl.add(newClassName);
    cl.remove(oldClassName);
}

const setSpeed = () => {

}

const setDropTimer = (multi = 1) => {
    let min = dropSpeed / speedMax;
    let i = (dropSpeed / speed) * multi;
    i = i > min ? i : min;

    dropTimer = setInterval( () => {
        current.move('down');
    }, i);
}


// Change Settings
const changeColors = (type, value) => {
    let cl = document.body.classList;
    let oldClassName = [].slice.apply(cl).find(c => c.startsWith(type));
    let newClassName = `${type}-color-${value}`;

    if(oldClassName != newClassName){
        cl.add(newClassName);
        cl.remove(oldClassName);
    }
}

const setMinoColors = (value) => {
    changeColors('mino', value);

    minoColors = [];
    minos.forEach(m => {
        let style = window.getComputedStyle($minos[m]);
        minoColors[m] = style.getPropertyValue('color');
    });
}

// Time
const displayTime = () => {
    let n = 60;
    let h = 0;
    let m = 0;
    let s = 0;

    if (time >= n*n){ 
        h = (time - (time % (n*n))) / (n*n); 
    }
    if (time >= n) { 
        m = ((time - (h*n*n)) - (time % n)) / n; 
    }
    s = time - (h*n*n) - (m*n);

    const zeroPadding = (n) => {
        let l = String(n).length;
        let d = l > 2 ? l : 2;
        return ("0".repeat(2) + n).slice(-d);
    }
    
    $timeH.textContent = zeroPadding(h);
    $timeM.textContent = zeroPadding(m);
    $timeS.textContent = zeroPadding(s);
}

const setTimer = () => {
    timer = setInterval(() => {
        time++;
        displayTime();
    }, 1000);
}

const initTime = () => {
    if(timer) {
        clearInterval(timer);
    }

    time = 0;
    displayTime();
}

// Controll Field
const initField = () => {
    ctxField.clearRect(0, 0, ctxField.width, ctxField.Height);
    for (let y = 0; y < fieldY + overY; y++) {
        let array = [];
        for (let x=0;x<fieldX;x++) { array.push(null) }
    }
}

// Controll Game
const playGame = () => {
    playStatus = true;
    $menu.style.display = 'none';
    setTimer();
    setDropTimer();
}

const initGame = () => {
    score = 0;
    $score.textContent = score;

    initTime();

    speed = speedMin;
    displaySpeed();
    
    if (current) { current.clear(); }
    current = null;

    if (next) { next.clear(); }
    next = null;

    if (hold) { hold.clear(); }
    hold = null;

    futures.forEach(f => { f.clear(); });
    futures = [];

    initField();
}

const newGame = () => {
    initGame();
    setFirstMinos();
    playGame();
    
    $btnContinue.disabled = false;

}

const pouseGame = () => {
    playStatus = false;
    $menu.style.display = 'flex';
    clearInterval(timer);
    clearInterval(dropTimer);
}

const gameOver = () => {
    $btnContinue.disabled = true;
    pouseGame();
};


// Event functions
const holdMino = () => {
    if(hold){

    } else {

    }
}

const turnLeftMino = () => {

}

const turnRightMino = () => {
    
}

const dropMino = () => {

}

const moveLeftMino = () => {

}

const moveRightMino = () => {

}

const moveDownMino = () => {

}

const clearRows = () => {

}

// Set events
$btnContinue.onclick = () => {
    playGame();
}

$btnNewGame.onclick = () => {
    newGame();
}

$themeColor.onchange = (e) => {
    changeColors('theme', e.target.value);
}

$minoColor.onchange = (e) => {
    setMinoColors(e.target.value);
}

const keyElTable = {
    hold:  { code: 'KeyS', el: 'btnHold',  func: holdMino },
    turnL: { code: 'KeyZ', el: 'btnTurnL', func: dropMino },
    turnR: { code: 'KeyX', el: 'btnTurnR', func: turnLeftMino },
    pouse: { code: 'Space', el: 'btnPouse', func: pouseGame },
    drop:  { code: 'ArrowUp', el: 'btnDrop',  func: dropMino },
    left:  { code: 'ArrowLeft', el: 'btnLeft',  func: moveLeftMino },
    right: { code: 'ArrowRight', el: 'btnRight', func: moveRightMino },
    down:  { code: 'ArrowDown', el: 'btnDown',  func: moveDownMino },
};

Object.keys(keyElTable).forEach(k => {
    let code = keyElTable[k]['code'];
    let $el = document.getElementById(keyElTable[k]['el']);
    let func = keyElTable[k]['func'];

    $el.onclick = () => { if (playStatus) { func(); } }
    addEventListener('keydown', (e) => {
        if (playStatus && e.code == code) { 
            $el.classList.add('is-active');
            func();
        }
    }, false);
    addEventListener('keyup', (e) => {
        if(e.code == code) {
            $el.classList.remove('is-active');
        }
    }, false);

});

// On load
setMinoColors('basic');