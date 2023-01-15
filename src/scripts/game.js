import Config from './config.js';
import Field from './field.js';
import Timer from './timer.js';
import Speed from './speed.js';
import Score from './score.js';
import { Mino, CurrentMino, FutureMino } from './mino.js';

const Game = class Game {
    $menu;
    $btnContinue;
    $btnNewGame;
    $themeColor;
    $minoColor;
    $minos = {};
    canvases = {};
    ctxs = {};

    playStatus = false;
    ishold = false;
    score;
    timer;
    speed; 
    current;
    next;
    hold;
    futures = [];
    field;
    minoColors = {};
    

    constructor() {
        this.getElements();
        this.setMinoColors('basic');
        this.setEvents();
        this.setKeyEvents();
    }

    getElements(){
        this.$menu = document.getElementById('menu');
        this.$btnContinue = document.getElementById('btnContinue');
        this.$btnNewGame = document.getElementById('btnNewGame');
        this.$themeColor = document.getElementById('themeColor');
        this.$minoColor = document.getElementById('minoColor');
        Config.minos.forEach(m => {
            this.$minos[m] = document.getElementById(`mino${m}`);
        });

        let $futures = [];
        let ctxFutures = [];
        for (let i = 1; i <= 5; i++){
            let $el = document.getElementById(`future${i}`);
            $futures.push($el);
            ctxFutures.push($el.getContext('2d'));
        }
        this.canvases = {
            field: document.getElementById('field'),
            hold: document.getElementById('hold'),
            next: document.getElementById('next'),
            futures: $futures,
        }
        
        this.ctxs = {
            field: this.canvases.field.getContext('2d'),
            hold: this.canvases.hold.getContext('2d'),
            next: this.canvases.next.getContext('2d'),
            futures: ctxFutures,
        }
        
    }
    setMinoColors(value) {

        this.changeColors('mino', value);

        Config.minos.forEach(m => {
            let style = window.getComputedStyle(this.$minos[m]);
            this.minoColors[m] = style.getPropertyValue('color');
        });

        if(this.field) { this.field.rewriteColor() }
        if(this.current){ this.current.rewriteColor() }
        if(this.next){ this.next.rewriteColor() }
        if(this.hold){ this.hold.rewriteColor() }
        this.futures.forEach(f => { f.rewriteColor() })
    }


    setMinos() {
        let types = Mino.defaultMinoTypes();

        let cType = types.shift();
        this.current = CurrentMino.build(cType, this);
        this.current.write();
        
        let nType = types.shift();
        this.next = Mino.build('next', nType, this);
        this.next.write();

        types.forEach((t, i) => {
            let m = FutureMino.build(i, t, this);
            m.write();
            this.futures.push(m);
        });
    }

    clearMinos() {
        if (this.current) { this.current.clear(); }
        this.current = null

        if (this.next) { this.next.clear(); }
        this.next = null;

        if (this.hold) { this.hold.clear(); }
        this.hold = null;

        this.futures.forEach(f => { f.clear(); });
        this.futures = [];
    }

    setNextMinos() {
        this.current = CurrentMino.build(this.next.type, this);
        this.current.write();
        this.current.setAutoDrop(this.speed.ms);

        this.futures.forEach(f => { f.clear();})
        let n = this.futures.shift();
        this.next.rewrite({ type: n.type, color: n.color });

        let rand = (Math.random() * Config.minos.length) | 0;
        let fType = Config.minos[rand];
        let newMino = FutureMino.build(this.futures.length, fType, this);
        this.futures.push(newMino);
        this.futures.forEach((f, i)=> { 
            f.rewrite({ctx: this.ctxs.futures[i]});
        })
    }

    changeColors = (type, value) => {
        let cl = document.body.classList;
        let oldClassName = [].slice.apply(cl).find(c => c.startsWith(type));
        let newClassName = `${type}-color-${value}`;

        if(oldClassName != newClassName){
            cl.add(newClassName);
            cl.remove(oldClassName);
        }
    }

    play() {
        this.playStatus = true;
        this.$menu.style.display = 'none';
        this.timer.start();
        this.current.setAutoDrop(this.speed.ms);
    }

    init() {
        if(this.field){ this.field.clear(); }
        this.field = new Field(this);

        this.score = new Score();
        this.speed = new Speed();
        if(this.timer) { this.timer.clear(); }
        this.timer = new Timer();   

        this.clearMinos();
        this.setMinos();
    }

    new() {
        this.init();
        this.play();
        
        this.$btnContinue.disabled = false;
    }

    pouse(game) {
        game.playStatus = false;
        game.$menu.style.display = 'flex';
        game.timer.clear();
        game.current.clearAutoDrop();
    }

    over() {
        this.$btnContinue.disabled = true;
        this.pouse(this);
    };

    holdMino(game) {
        if(game.isHold){ return; } else { game.isHold = true }
        let attr = {...game.current.attr};

        if(game.hold){
            game.current.clear();
            game.current.clearAutoDrop();

            game.current = CurrentMino.build(game.hold.type, game);
            game.current.write();
            game.current.setAutoDrop(game.speed.ms);

            game.hold.rewrite({type: attr.type, color: attr.color});
        } else {
            game.current.clearAutoDrop();
            game.current.clear();
            game.hold = Mino.build('hold', attr.type, game);
            game.hold.write();
            game.setNextMinos();
        }
    }

    turnLeftMino(game) {
        game.current.turn('left');
    }

    turnRightMino(game) {
        game.current.turn('right');
    }

    dropMino(game) {
        game.current.drop();
    }

    moveLeftMino(game) {
        game.current.move('left');
    }

    moveRightMino(game) {
        game.current.move('right');
    }

    startDownMino(game) {
        game.current.startDown();
    }

    stopDownMino(game) {
        game.current.stopDown(game.speed.ms);
    }

    setEvents() {
        this.$btnContinue.onclick = () => {
            if(!this.playStatus){
                this.play();
            }
        }

        this.$btnNewGame.onclick = () => {
            if(!this.playStatus){
                this.new();
            }
        }

        this.$themeColor.onchange = (e) => {
            this.changeColors('theme', e.target.value);
        }

        this.$minoColor.onchange = (e) => {
            this.setMinoColors(e.target.value);
        }
    }

    setKeyEvents() {
        let game = this;

        let onKeyDown = {
            hold:  game.holdMino,
            turnL: game.turnLeftMino,
            turnR: game.turnRightMino,
            pouse: game.pouse,
            drop:  game.dropMino,
            left:  game.moveLeftMino,
            right: game.moveRightMino,
            down:  game.startDownMino,
        }

        let onKeyUp = {
            down: game.stopDownMino
        }

        Object.keys(onKeyDown).forEach(k => {
            let code = Config.keyElTable[k].code;
            let $el = document.getElementById(Config.keyElTable[k].el);
            let kd = onKeyDown[k];

            $el.onclick = () => { if (game.playStatus) { kd(game); } }

            let keyDown = (e) => {
                if (game.playStatus && e.code == code) { 
                    $el.classList.add('is-active');
                    kd(game);
                }
            }

            let keyUp = (e) => {
                if(game.playStatus && e.code == code) {
                    $el.classList.remove('is-active');
                    if(onKeyUp[k]) {
                        onKeyUp[k](game);
                    }
                }
            }

            removeEventListener('keydown', keyDown, false);
            removeEventListener('keyup', keyUp, false);
            addEventListener('keydown', keyDown, false);
            addEventListener('keyup', keyUp, false);
        });
    }
}

export default Game