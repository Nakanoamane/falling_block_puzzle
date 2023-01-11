import * as Settings from './settings.js';
import Block from './block.js';

const Mino = class Mino {
    type;
    ctx;
    size;
    color;
    x;
    y;

    blocks = [];

    constructor(attr = {}) {
        this.attr = attr;
    }

    set attr(attr = {}) {
        this.type = attr['type'] ? attr['type'] : this.type;
        this.ctx = attr['ctx'] ? attr['ctx'] : this.ctx;
        this.size = attr['size'] ? attr['size'] : this.size;
        this.color = attr['type'] ? attr['color']: this.color;
        this.x = attr['x'] || attr['x'] === 0 ? attr['x'] : this.x;
        this.y = attr['y'] || attr['y'] === 0 ? attr['y'] : this.y;
    }

    get attr() {
        return {
            type: this.type,
            ctx: this.ctx,
            size: this.size,
            color: this.color,
            x: this.x,
            y: this.y
        }
    }

    static createMino($canvas, ctx, type, color) {
        let [size, x, y] = this.getSizeAndPosition($canvas, type);
    
        let attr = {
            type: type,
            ctx: ctx,
            size: size,
            color: color,
            x: x,
            y: y
        };
    
        return new this(attr);
    }

    static getSizeAndPosition($canvas, type) {
        let size = $canvas.width / 5;
        let x = size * 1;
        if(['O', 'I'].includes(type)) {
            x = size * 0.5;
        }
        let y = size * 1.5;

        return [size, x, y]
    }

    write() {
        this.createBlocks();
        this.blocks.forEach(block => { block.write(); });
    }

    createBlocks() {
        let settings = Settings.minoSettings[this.type];
        
        settings.forEach(array => {
            let attr = {
                ctx: this.ctx,
                size: this.size,
                color: this.color,
                x: this.x  + (array[0] * this.size),
                y: this.y + (array[1] * this.size)
            }
            this.blocks.push(new Block(attr));
        });
    }

    clear() {
        this.blocks.forEach(block => { block.clear(); });
        this.blocks = [];
    }

    rewrite(attr) {
        this.clear();
        this.attr = attr;
        this.write();
    }
}

const CurrentMino = class CurrentMino extends Mino {

    static getSizeAndPosition($canvas, _) {
        let size = $canvas.width / Settings.fieldX;
        let x = size * 3;
        let y = size * -2;

        return [size, x, y]
    }


    move(to) {
        let table = {
            left: {x: this.x - this.size},
            right: {x: this.x + this.size},
            down: {y: this.y + this.size},
        }
        let exp = table[to];

        if (this.canMove(exp)) {
            this.rewrite(exp);
        } else if (this.isLanded(exp)) {
            landed();
        }
    }

    canMove(exp) {
        return true
    }

    drop() {

    }

    rotate() {

    }

    canRotate() {

    }

    landed() {
        this.clear();
    }

    isLanded(exp) {

    }
}

export { Mino, CurrentMino }