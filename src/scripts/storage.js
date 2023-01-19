import { Mino, CurrentMino, FutureMino } from './mino.js';
import Block from './block.js';

const Strage = class Strage {
    game;

    static KEY = 'fallingBlockPuzzle'

    constructor (game) {
        this.game = game;
    }

    save() {
        let json = {
            themeColor: this.game.controller.themeColor,
            minoColor: this.game.controller.minoColor            
        }

        if (this.game.field) {
            json = { ...json, ...{
                isHold: this.game.isHold,
                score: this.game.score.score,
                best: this.game.score.best,
                time: this.game.timer.time,
                speed: this.game.speed.multiplier,
                current: this.game.current.attr,
                next: this.game.next.attr,
                futures: this.game.futures.map(f => f.attr),
                field: this.game.field.table.map(r => r.map(b => b ? b.attr : b))
            }}
        }
        if (this.game.hold) {
            json = { ...json, ...{ hold: this.game.hold.attr }}
        }    

        let str = JSON.stringify(json)
        localStorage.setItem(Strage.KEY, str)
    }

    load() {
        let str = localStorage.getItem(Strage.KEY)
        if (!str) { return }
        let json = JSON.parse(str);

        let themeColor = json.themeColor
        this.game.controller.themeColor = themeColor
        this.game.controller.changeColors('theme', themeColor)
        this.game.controller.setMinoColors(json.minoColor)
        if(!json.field) { return }

        this.game.isHold = json.isHold

        this.game.init()
        this.game.score.score = json.score
        this.game.score.best = json.best
        this.game.score.write()
        this.game.speed.multiplier = json.speed
        this.game.speed.write()
        this.game.timer.time = json.time
        this.game.timer.write()

        let table = json.field.map(r => r.map( b => {
            if (b) {
                let block = {...b, ...{ ctx: this.game.ctxs.field }}
                return new Block(block)
            } else {
                return null
            }
        }))
        this.game.field.rewrite(table)

        let current = {...json.current, ...{ ctx: this.game.ctxs.field }}
        this.game.current = new CurrentMino(current, this.game)
        this.game.current.write();

        let next = {...json.next, ...{ ctx: this.game.ctxs.next }}
        this.game.next = new Mino(next, this.game)
        this.game.next.write();

        if(json['hold']) {
            let hold = {...json.hold, ...{ ctx: this.game.ctxs.hold }}
            this.game.hold = new Mino(hold, this.game)
            this.game.hold.write()
        }

        json.futures.forEach((f, i) => {
            let future = {...f, ...{ ctx: this.game.ctxs.futures[i]}}
            let fm = new FutureMino(future, this.game)
            fm.write()
            this.game.futures.push(fm)
        });
        
        if(this.game.field.isOver()) {
            this.game.controller.$btnContinue.disabled = true;
        } else {
            this.game.controller.$btnContinue.disabled = false;
        }
    }

    static getBestScore() {
        let str = localStorage.getItem(Strage.KEY)
        if (!str) { return }
        let json = JSON.parse(str);
        return json.best ? json.best : 0
    }

}

export default Strage