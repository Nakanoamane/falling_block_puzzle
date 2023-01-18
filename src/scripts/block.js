import Field from './field.js';

const Block = class Block {
    ctx;
    size;
    type;
    color;
    x;
    y;

    constructor(attr = {}) {
        this.attr = attr;
    }

    set attr(attr = {}) {
        let merged = {...this.attr, ...attr}
        this.ctx = merged.ctx;
        this.size = merged.size;
        this.type = merged.type;
        this.color = merged.color;
        this.x = merged.x;
        this.y = merged.y;
    }

    get attr() {
        return {
            ctx: this.ctx,
            size: this.size,
            type: this.type,
            color: this.color,
            x: this.x,
            y: this.y
        }
    }

    fieldXY($field) {
        let x = this.x / ($field.width / Field.X);
        let y = Field.Y - 1 - (this.y / ($field.height / Field.Y));
        return [x, y]
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

}

export default Block