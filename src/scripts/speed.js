const speedMax = 10;
const speedMin = 0;
const dropSpeed = 1000;
const adjast = 1.1;

const Speed = class Speed {
    $speed
    multiplier;

    constructor() {
        this.$speed = document.getElementById('speed');
        this.multiplier = speedMin;
        this.write();
    }

    get ms() {
        if(this.multiplier){
            return dropSpeed / (this.multiplier * ( adjast ** this.multiplier ))
        } else {
            return dropSpeed
        }
    }

    static get maxMs() {
        let def = dropSpeed / speedMax;
        return this.ms < def ? this.ms : def
    }

    update() {
        if(this.multiplier >= speedMax){
            this.multiplier = 0

        } else {
            this.multiplier++
        }
        
        this.write();
    }

    write() {
        let cl = this.$speed.classList;
        let oldClassName = [].slice.apply(cl).find(c => c.startsWith('speed'));
        let newClassName = `speed${this.multiplier}`;
    
        cl.add(newClassName);
        cl.remove(oldClassName);
    }

}

export default Speed;