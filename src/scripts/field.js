import Block from './block.js';

const Field = class Field {
    table;
    clearedRows;
    game;

    static X = 10;
    static Y = 20;
    static OVER_Y = 2;

    constructor(game) {
        this.game = game;
        this.clearedRows = 0;
        
        this.initTable();
    }

    initTable() {
        this.table = [];
        for (let y = 0; y < Field.Y + Field.OVER_Y; y++) {
            this.table.push(this.blankRow());
        }
    }

    blankRow() {
        let row = [];
        for (let x=0; x < Field.X;x++) { 
            row.push(null);
        }
        return row
    }

    write() {
        this.table.forEach(row => {
            row.forEach(block => {
                if(block) { block.write() }
            });
        });
    }

    clear() {
        this.table.forEach(row => {
            row.forEach(block => {
                if(block) { block.clear() }
            });
        });
    }

    add(blocks) {
        let table = [...this.table];
        blocks.forEach(b => {
            let [x, y] = b.fieldXY(this.game.canvases.field);
            table[y][x] = new Block(b.attr);
        });
        this.rewrite(table);
    }

    clearRow() {
        let count = 0;
        let table = [];

        this.table.forEach(row => {
            if (row.every(block => block)) {
                count++;
            } else {
                let r = []
                row.forEach(b => {
                    if(b){
                        r.push( new Block(b.attr) )
                    } else {
                        r.push(null)
                    }
                })
                table.push(r);
            }
        });
        for(let i=0;i < count; i++){
            table.push(this.blankRow())
        }

        if (count) {
            table.forEach((row, y) => {
                row.forEach((b, x) => {
                    if(b){ 
                        let attr = {...b.attr, ...{
                            y: b.size * (Field.Y - y - 1)
                        }};
                        table[y][x] = new Block(attr);
                    }
                });
            })

            this.updateScoreAndSpeed(count)
            this.rewrite(table)
        }
    }

    updateScoreAndSpeed(count) {
        this.game.score.add(this.game.speed.multiplier, count);
        this.clearedRows += count;
        if (this.clearedRows%10 === 0) {
            this.game.speed.update();
        }
    }

    rewriteColor() {
        let table = [...this.table];
        table.forEach(row => {
            row.forEach(b => {
                if(b){ b.color = this.game.minoColors[b.type] }
            })
        })
        this.rewrite(table);
    }

    rewrite(table) {
        this.clear();
        this.table = table;
        this.write();
    }

    isOver() {
        return this.table[Field.Y].some(b => b)
    }

}

export default Field