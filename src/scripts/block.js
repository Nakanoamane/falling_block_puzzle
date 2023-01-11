import * as Settings from './settings.js';

const Block = class Block {
    ctx;
    size;
    color;
    x;
    y;

    constructor(attr = {}) {
        this.attr = attr;
    }

    set attr(attr = {}) {
        this.ctx = attr['ctx'] ? attr['ctx'] : this.ctx;
        this.size = attr['size'] ? attr['size'] : this.size;
        this.color = attr['color'] ? attr['color'] : this.color;
        this.x = attr['x'] || attr['x'] === 0 ? attr['x'] : this.x;
        this.y = attr['y'] || attr['y'] === 0 ? attr['y'] : this.y;
    }

    get attr() {
        return {
            ctx: this.ctx,
            size: this.size,
            color: this.color,
            x: this.x,
            y: this.y
        }
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
        this.attr = attr;
        this.write();
    }

    fieldXY() {
        let x = this.x / ($field.width / Settings.fieldX);
        let y = this.y / ($field.height / Settings.fieldY);
        return [x, y]
    }

    isInField() {

    }
}

export default Block