const Speed = class Speed {
    $speed
    multiplier;

    static MAX = 10;
    static MIN = 0;
    static DEFAULT = 1000;
    static STEP = (this.DEFAULT - 80) / this.MAX;

    constructor() {
        this.$speed = document.getElementById('speed');
        this.multiplier = Speed.MIN;
        this.write();
    }

    get ms() {
        return Speed.DEFAULT - (Speed.STEP * this.multiplier )
    }

    get waitMs() {
        let ms = this.ms
        let min = Speed.DEFAULT / 2
        return ms > min ? ms : min
    }

    get maxMs() {
        let def = Speed.DEFAULT - (Speed.STEP * Speed.MAX);
        return this.ms < def ? this.ms : def
    }

    update() {
        if(this.multiplier >= Speed.MAX){
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