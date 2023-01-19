import { Mino } from './mino.js'
import Strage from './storage.js'

const Controller = class Controller {
    $menu;
    $result;
    $btnContinue;
    $btnNewGame;
    $themeColor;
    $minoColor;
    $minos = {};

    themeColor = 'basic';
    minoColor = 'basic';

    game;

    static KEY_EL_TABLE = {
        hold:  { code: 'KeyS', el: 'btnHold' },
        turnL: { code: 'KeyZ', el: 'btnTurnL' },
        turnR: { code: 'KeyX', el: 'btnTurnR' },
        pouse: { code: 'Space', el: 'btnPouse' },
        drop:  { code: 'ArrowUp', el: 'btnDrop' },
        left:  { code: 'ArrowLeft', el: 'btnLeft' },
        right: { code: 'ArrowRight', el: 'btnRight'},
        down:  { code: 'ArrowDown', el: 'btnDown' },
    };

    constructor(game){
        this.game = game;
        this.getElements();
        this.setMinoColors(this.minoColor);
        this.setEvents();
        this.setKeyEvents();
    }

    getElements(){
        this.$menu = document.getElementById('menu');
        this.$result = document.getElementById('result');
        this.$btnContinue = document.getElementById('btnContinue');
        this.$btnNewGame = document.getElementById('btnNewGame');
        this.$themeColor = document.getElementById('themeColor');
        this.$minoColor = document.getElementById('minoColor');
        Mino.TYPES.forEach(m => {
            this.$minos[m] = document.getElementById(`mino${m}`);
        });
    }

    setMinoColors(value) {
        this.changeColors('mino', value);
        this.minoColor = value;

        Mino.TYPES.forEach(m => {
            let style = window.getComputedStyle(this.$minos[m]);
            this.game.minoColors[m] = style.getPropertyValue('color');
        });
        this.game.rewriteColors();
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

    setEvents() {
        this.$btnContinue.onclick = () => {
            if(!this.playStatus){
                this.game.play();
            }
        }

        this.$btnNewGame.onclick = () => {
            if(!this.playStatus){
                this.game.new();
            }
        }

        this.$themeColor.onchange = (e) => {
            this.changeColors('theme', e.target.value);
            this.themeColor = e.target.value
            new Strage(this.game).save();
        }

        this.$minoColor.onchange = (e) => {
            this.setMinoColors(e.target.value);
            new Strage(this.game).save();
        }
    }

    setKeyEvents() {
        let game = this.game;

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
            let code = Controller.KEY_EL_TABLE[k].code;
            let $el = document.getElementById(Controller.KEY_EL_TABLE[k].el);
            let kd = onKeyDown[k];

            let keyDown = (e) => {
                if (game.playStatus && (e.code == code || e.type == 'touchstart')) { 
                    $el.classList.add('is-active');
                    kd(game);
                }
            }

            let keyUp = (e) => {
                if(game.playStatus && (e.code == code || e.type == 'touchend')) {
                    $el.classList.remove('is-active');
                    if(onKeyUp[k]) {
                        onKeyUp[k](game);
                    }
                }
            }

            if ('ontouchstart' in window || navigator.msPointerEnabled) {
                $el.removeEventListener('touchstart', keyDown, false);
                $el.removeEventListener('touchend', keyUp, false);
                $el.addEventListener('touchstart', keyDown, false);
                $el.addEventListener('touchend', keyUp, false);
            } else {
                $el.onclick = () => { if (game.playStatus) { kd(game); } }
            }

            removeEventListener('keydown', keyDown, false);
            removeEventListener('keyup', keyUp, false);
            addEventListener('keydown', keyDown, false);
            addEventListener('keyup', keyUp, false);
        });
    }
}

export default Controller