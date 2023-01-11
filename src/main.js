import * as Settings from './scripts/settings.js';
import Block from './scripts/block.js';
import { Mino, CurrentMino } from './scripts/mino.js';

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
Settings.minos.forEach(m => {
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

const defaultMinoTypes = () => {
    let array = [];
    for(let i = 0; i < Settings.minos.length; i++) {
        let remains = Settings.minos.filter(m => !array.includes(m));
        let rand = (Math.random() * remains.length) | 0;
        array.push(remains[rand]);
    }
    return array;
}

const setFirstMinos = () => {
    let types = defaultMinoTypes();

    let cType = types.shift();
    current = CurrentMino.createMino($field, ctxField, cType, minoColors[cType]);
    current.write();
    
    let nType = types.shift();
    next = Mino.createMino($next, ctxNext, nType, minoColors[nType]);
    next.write();

    types.forEach((t, i) => {
        let m = Mino.createMino($futures[i], ctxFutures[i], t, minoColors[t]);
        m.write();
        futures.push(m);
    });
}

const nextMino = () => {
    current = CurrentMino.createMino($field, ctxField, next.type, minoColors[next.type]);
    current.write();

    next.clear();
    futures.forEach(f => { f.clear();})
    let nType = futures.shift().type
    next = Mino.createMino($next, ctxNext, nType, minoColors[nType]);
    next.write();

    let rand = (Math.random() * Settings.minos.length) | 0;
    let fType = Settings.minos[rand];
    let newMino = Mino.createMino($futures[-1], ctxFutures[-1], fType, minoColors[fType]);
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
    let min = Settings.dropSpeed / Settings.speedMax;
    let i = (Settings.dropSpeed / speed) * multi;
    i = i > min ? i : min;

    console.log(current);

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
    Settings.minos.forEach(m => {
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
    for (let y = 0; y < Settings.fieldY + Settings.overY; y++) {
        for (let x=0; x < Settings.fieldX;x++) { field.push(null) }
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

    speed = Settings.speedMin;
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
    current.drop();
}

const moveLeftMino = () => {
    current.move('left');
}

const moveRightMino = () => {
    current.move('right');
}

const moveDownMino = () => {
    current.move('down');
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
    turnL: { code: 'KeyZ', el: 'btnTurnL', func: turnLeftMino },
    turnR: { code: 'KeyX', el: 'btnTurnR', func: turnRightMino },
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