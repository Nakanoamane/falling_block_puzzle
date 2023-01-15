import Config from './config.js';
import Block from './block.js';
import Speed from './speed.js';

const Mino = class Mino {
    game;
    type;
    ctx;
    size;
    color;
    x;
    y;
    deg = 0;

    blocks = [];

    constructor(attr = {}, game) {
        this.attr = attr;
        this.game = game;
        this.createBlocks();
    }

    set attr(attr = {}) {
        let merged = {...this.attr, ...attr}
        this.type = merged.type;
        this.ctx = merged.ctx;
        this.size = merged.size;
        this.color = merged.color;
        this.x = merged.x;
        this.y = merged.y;
        this.deg = merged.deg;
    }

    get attr() {
        return {
            type: this.type,
            ctx: this.ctx,
            size: this.size,
            color: this.color,
            x: this.x,
            y: this.y,
            deg: this.deg
        }
    }

    static build(canvasName, type, game) {
        let $canvas = game.canvases[canvasName];
        let ctx = game.ctxs[canvasName];
        let [size, x, y] = this.getSizeAndPosition($canvas, type);
    
        let attr = {
            type: type,
            ctx: ctx,
            size: size,
            color: game.minoColors[type],
            x: x,
            y: y
        };
    
        return new this(attr, game);
    }

    static getSizeAndPosition($canvas, type) {
        let size = $canvas.width / 5;
        let x = this.alignCenter(size, type);
        let y = size * 1.5;

        return [size, x, y]
    }

    static alignCenter(size, type) {
        if(['O', 'I'].includes(type)) {
            return size * 0.5;
        } else {
            return size * 1;
        }
    }

    static defaultMinoTypes () {
        let array = [];
        for(let i = 0; i < Config.minos.length; i++) {
            let remains = Config.minos.filter(m => !array.includes(m));
            let rand = (Math.random() * remains.length) | 0;
            array.push(remains[rand]);
        }
        return array;
    }

    write() {
        this.blocks.forEach(block => { block.write(); });
    }

    createBlocks() {
        let settings = Config.minoSettings[this.type][this.deg];
        let blocks = []
        
        settings.forEach(array => {
            let attr = {
                ctx: this.ctx,
                size: this.size,
                type: this.type,
                color: this.color,
                x: this.x  + (array[0] * this.size),
                y: this.y + (array[1] * this.size)
            }
            blocks.push(new Block(attr));
        });
        this.blocks = blocks;
    }

    clear() {
        this.blocks.forEach(block => { block.clear(); });
    }

    update(attr) {
        this.attr = attr;
        this.x = Mino.alignCenter(this.size, this.type);
        this.createBlocks();
    }

    rewriteColor(){
        this.rewrite({color: this.game.minoColors[this.type]});
    }

    rewrite(attr) {
        this.clear();
        this.update(attr);
        this.write();
    }

}

const FutureMino = class FutureMino extends Mino {

    static build(index, type, game) {
        let $canvas = game.canvases.futures[index];
        let ctx = game.ctxs.futures[index];
        let [size, x, y] = this.getSizeAndPosition($canvas, type);
    
        let attr = {
            type: type,
            ctx: ctx,
            size: size,
            color: game.minoColors[type],
            x: x,
            y: y
        };
    
        return new this(attr, game);
    }
}

const CurrentMino = class CurrentMino extends Mino {
    autoDrop;
    isDown;
    shadow;

    constructor(attr ={}, game) {
        super(attr, game);
        this.isDown = false;
        this.createShadow();
    }

    static build(type, game) {
        let [size, x, y] = this.getSizeAndPosition(game.canvases.field);
    
        let attr = {
            type: type,
            ctx: game.ctxs.field,
            size: size,
            color: game.minoColors[type],
            x: x,
            y: y
        };
    
        return new this(attr, game);
    }

    static getSizeAndPosition($canvas) {
        let size = $canvas.width / Config.fieldX;
        let x = size * 3;
        let y = size * -2;

        return [size, x, y]
    }

    createShadow() {
        let alpha = 0.15;
        let str = ', ' + alpha + ')';

        let shadowAttr = {...this.attr, ...{
            color: this.color.replace('rgb', 'rgba').replace(')', str),
            y: this.lowestY()
        }}

        this.shadow = new Mino(shadowAttr, this.game);
    }

    clear() {
        super.clear();
        this.shadow.clear();
    }

    write(){
        super.write();
        this.shadow.write();
    }

    update(attr) {
        this.attr = attr;
        this.createBlocks();
        this.createShadow();
    }

    setAutoDrop(ms) {    
        this.autoDrop = setInterval( () => {
            this.move('down');
        }, ms);
    }

    clearAutoDrop() {
        clearInterval(this.autoDrop);
    }

    move(to) {
        if (this.isLanded() && to === 'down') {
            this.land();
            return;
        } 

        let position = {
            left: {x: this.x - this.size},
            right: {x: this.x + this.size},
            down: {y: this.y + this.size},
        }
        let exp = position[to];
    
        if (this.canRewrite(exp)) {
            this.rewrite(exp);
        }
    }

    canRewrite(exp) {
        if(!this.autoDrop){ return false ;}
        let attr = {...this.attr, ...exp}
        let expMino = new CurrentMino(attr, this.game)
        let result = expMino.blocks.every(block => {
            let [x, y] = block.fieldXY(this.game.canvases.field);
            return x >= 0 && x < Config.fieldX && 
            y >= 0 && y < Config.fieldY + Config.overY && !this.game.field.table[y][x]
        });

        return result
    }

    startDown() {
        if(this.autoDrop && !this.isDown) {
            this.move('down');
            this.isDown = true;
            this.clearAutoDrop();
            this.setAutoDrop(Speed.maxMs);
        }
    }

    stopDown(ms) {
        if(this.autoDrop && this.isDown) {
            this.isDown = false;
            this.clearAutoDrop();
            this.setAutoDrop(ms);
        }
    }

    drop() {
        let exp = { y: this.lowestY() }

        if(this.canRewrite(exp)){
            this.rewrite(exp);
        }
    }

    lowestY() {
        let indexY = 0;
        this.blocks.forEach(block => {
            let [x, _]  = block.fieldXY(this.game.canvases.field);
            let reversed = [...this.game.field.table].reverse();
            let reversedTop = reversed.findIndex(row => row[x]);
            let fieldTop = reversedTop >= 0 ? (reversed.length - 1 - reversedTop) : -1
            let difffMinoTop = (block.y - this.y) / this.size
            let iy = fieldTop + 1 + difffMinoTop;
            if (indexY < iy) { indexY = iy }
        });

        return (Config.fieldY - indexY - 1) * this.size
    }

    turn(dir) {
        let pm = dir === 'right' ? 1 : -1;
        let deg = this.deg + (90 * pm);
        let exp = { deg: this.degToUnder360(deg) }

        if(this.canRewrite(exp)){
            this.rewrite(exp);
            return;
        }

        let otherExp = this.turnByOtherShaft(exp.deg, pm);
        if(otherExp){
            this.rewrite(otherExp);
        }
    }

    turnByOtherShaft(deg, pm) {
        let exp = null

        this.blocks.forEach(block => {
            [0, 1].forEach(i => {
                let x = block.x - ( (block.x - this.x / this.size) * this.size * i );
                let e = { deg: deg, x: x, y: block.y }
                let canRewrite = this.canRewrite(e);
    
                if(canRewrite && (!exp || exp.y > e.y)){ exp = e } 
    
                if(!canRewrite){
                    let degExp = this.turnByOherDeg(e, deg,pm);
                    if (this.canRewrite(degExp) && (!exp || exp.y > degExp.y)){
                        exp = degExp;
                    }
                }
            })
            
        })
        return exp
    }

    turnByOherDeg(e, deg, pm){
        let exp = {...e};

        for(let i=0; i <= 2;i++){
            let degExp = {...e, ...{
                deg: this.degToUnder360(deg + (90 * pm))
            }}
            if (this.canRewrite(degExp) && (!exp || exp.y > degExp.y)){
                exp = degExp;
            }
        }
        return exp
    }

    degToUnder360(n){
        let deg = n
        deg = 360 <= deg ? (deg - 360) : deg
        deg = 0 > deg ? (deg + 360) : deg
        return deg
    }

    land() {
        this.clearAutoDrop();
        this.clear();
        this.game.field.add(this.blocks);
        this.game.field.clearRow();

        if(this.game.field.isOver()) {
            this.game.over();
        }else {
            this.game.setNextMinos();
        }
    }

    isLanded() {
        if(!this.autoDrop){ return false ;}
        let result = this.blocks.some(block => {
            let [x, y] = block.fieldXY(this.game.canvases.field);
            if (y === 0) { return true; }

            let fieldBlock = this.game.field.table[y-1][x];
            return fieldBlock;
        })
        return result
    }
}

export { Mino, CurrentMino, FutureMino }