import Field from './field.js';
import Block from './block.js';

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

    static TYPE_ANGLES = {
        T: {									
            0:   [	[1, 1],	[0, 2],	[1, 2],	[2, 2]	],
            90:  [	[2, 2],	[1, 1],	[1, 2],	[1, 3]	],
            180: [	[1, 3],	[2, 2],	[1, 2],	[0, 2]	],
            270: [	[0, 2],	[1, 3],	[1, 2],	[1, 1]	]	
        },  
        Z: {									
            0:   [	[0, 1],	[1, 1],	[1, 2],	[2, 2]	],
            90:  [	[2, 1],	[2, 2],	[1, 2],	[1, 3]	],
            180: [	[2, 3],	[1, 3],	[1, 2],	[0, 2]	],
            270: [	[0, 3],	[0, 2],	[1, 2],	[1, 1]	]	
        }, 
        L: {									
            0:   [	[2, 1],	[0, 2],	[1, 2],	[2, 2]	],
            90:  [	[2, 3],	[1, 1],	[1, 2],	[1, 3]	],
            180: [	[0, 3],	[2, 2],	[1, 2],	[0, 2]	],
            270: [	[0, 1],	[1, 3],	[1, 2],	[1, 1]	]	
        }, 
        O: {									
            0:   [	[1, 1],	[2, 1],	[1, 2],	[2, 2]	],
            90:  [	[2, 1],	[2, 2],	[1, 1],	[1, 2]	],
            180: [	[2, 2],	[1, 2],	[2, 1],	[1, 1]	],
            270: [	[1, 2],	[1, 1],	[2, 2],	[2, 1]	]
        }, 
        S: {									
            0:   [	[1, 1],	[2, 1],	[0, 2],	[1, 2]	],
            90:  [	[2, 2],	[2, 3],	[1, 1],	[1, 2]	],
            180: [	[1, 3],	[0, 3],	[2, 2],	[1, 2]	],
            270: [	[0, 2],	[0, 1],	[1, 3],	[1, 2]	]	
        }, 
        I: {									
            0:   [	[3, 2],	[2, 2],	[1, 2],	[0, 2]	],
            90:  [	[2, 0],	[2, 1],	[2, 2],	[2, 3]	],
            180: [	[0, 1],	[1, 1],	[2, 1],	[3, 1]	],
            270: [	[1, 3],	[1, 2],	[1, 1],	[1, 0]	]	
        }, 
        J: {									
            0:   [	[0, 1],	[0, 2],	[1, 2],	[2, 2]	],
            90:  [	[2, 1],	[1, 1],	[1, 2],	[1, 3]	],
            180: [	[2, 3],	[2, 2],	[1, 2],	[0, 2]	],
            270: [	[0, 3],	[1, 3],	[1, 2],	[1, 1]	]	
        }									
    }
    static TYPES = Object.keys(this.TYPE_ANGLES);

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
        let y = size * 0.5;

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
        for(let i = 0; i < Mino.TYPES.length; i++) {
            let remains = Mino.TYPES.filter(m => !array.includes(m));
            let rand = (Math.random() * remains.length) | 0;
            array.push(remains[rand]);
        }
        return array;
    }

    write() {
        this.blocks.forEach(block => { block.write(); });
    }

    createBlocks() {
        let typeAngle = Mino.TYPE_ANGLES[this.type][this.deg];
        let blocks = []
        
        typeAngle.forEach(array => {
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
        let size = $canvas.width / Field.X;
        let x = size * 3;
        let y = size * -3;

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

    resetAutoDrop() {
        this.clearAutoDrop()
        this.setAutoDrop(this.game.speed.waitMs)
    }

    move(to) {
        if (this.isLanded()) {
            if(to === 'down') {
                this.land();
                return;
            } else {
                this.resetAutoDrop();
            }           
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
            return x >= 0 && x < Field.X && 
            y >= 0 && y < Field.Y + Field.OVER_Y && !this.game.field.table[y][x]
        });

        return result
    }

    startDown() {
        if(this.autoDrop && !this.isDown) {
            this.move('down');
            this.isDown = true;
            this.clearAutoDrop();
            this.setAutoDrop(this.game.speed.maxMs);
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
        let start = this.startForLowest();
        let indexY = 0;
        this.blocks.forEach(block => {
            let [x, _]  = block.fieldXY(this.game.canvases.field);
            let reversed = [...this.game.field.table].reverse();
            let reversedTop = reversed.findIndex((row, i) => i >= start && row[x]);
            let fieldTop = reversedTop >= 0 ? (reversed.length - 1 - reversedTop) : -1
            let difffMinoTop = (block.y - this.y) / this.size
            let iy = fieldTop + 1 + difffMinoTop;
            if (indexY < iy) { indexY = iy }
        });

        return (Field.Y - indexY - 1) * this.size
    }

    startForLowest(){
        let indexMax = this.game.field.table.length - 1
        let bottomY = indexMax;
        this.blocks.forEach(b => {
            let [_, y] = b.fieldXY(this.game.canvases.field);
            if(bottomY > y){ bottomY = y }
        })
        let start = indexMax - bottomY

        return start
    }

    turn(dir) {
        if(this.isLanded()) {
            this.resetAutoDrop();
        }
        
        let exp = this.tryTurns(dir);

        if(exp){
            this.rewrite(exp);
        }
    }

    tryTurns(dir) {
        let pm = dir === 'right' ? 1 : -1;

        for(let i = 1; i <= 3; i++) {
            let deg = this.deg + (90 * pm * i);
            let exp = { deg: this.degToUnder360(deg) }
    
            if(this.canRewrite(exp)){
                return exp;
            }
    
            let otherExp = this.turnByOtherShaft(exp.deg, dir);
            if(otherExp){
                return otherExp;
            }
        }
    }

    turnByOtherShaft(deg) {
        let exp = null

        this.blocks.forEach(block => {
            for(let i = 0; i < 3; i++) {
                let x = block.x - ( ( block.x - this.x) * i )
                let y = block.y - ( ( block.y - this.y) * i )
                let e = { deg: deg, x: x, y: y }
                
                if(this.canRewrite(e)){ 
                    if (!exp) {
                        exp = e 
                    } else {
                        let expAbsX = Math.abs(this.x - exp.x);
                        let eAbsX = Math.abs(this.x - e.x);
                        let expAbsY = Math.abs(this.y - exp.y);
                        let eAbsY = Math.abs(this.y - e.y);

                        if( expAbsX >= eAbsX && expAbsY >= eAbsY && exp.y <= e.y ) { exp = e }
                    }
                } 
            }
        })
        
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
        } else {
            this.game.isHold = false;
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