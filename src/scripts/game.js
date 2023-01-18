import Controller from './controller.js';
import Field from './field.js';
import Timer from './timer.js';
import Speed from './speed.js';
import Score from './score.js';
import { Mino, CurrentMino, FutureMino } from './mino.js';

const Game = class Game {
    canvases = {};
    ctxs = {};

    playStatus = false;
    ishold = false;
    controller;
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
        this.controller = new Controller(this);
        this.getElements();
    }

    getElements(){
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

        let rand = (Math.random() * Mino.TYPES.length) | 0;
        let fType = Mino.TYPES[rand];
        let newMino = FutureMino.build(this.futures.length, fType, this);
        this.futures.push(newMino);
        this.futures.forEach((f, i)=> { 
            f.rewrite({ctx: this.ctxs.futures[i]});
        })
    }

    rewriteColors() {
        if(this.field) { this.field.rewriteColor() }
        if(this.current){ this.current.rewriteColor() }
        if(this.next){ this.next.rewriteColor() }
        if(this.hold){ this.hold.rewriteColor() }
        this.futures.forEach(f => { f.rewriteColor() })
    }

    play() {
        this.playStatus = true;
        this.controller.$menu.style.display = 'none';
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
        
        this.controller.$btnContinue.disabled = false;
    }

    over() {
        this.controller.$btnContinue.disabled = true;
        this.pouse(this);
    };

    pouse(game) {
        game.playStatus = false;
        game.controller.$menu.style.display = 'flex';
        game.timer.clear();
        game.current.clearAutoDrop();
    }

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
}

export default Game