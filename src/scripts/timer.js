const Timer = class Timer {
    $timeH;
    $timeM;
    $timeS;
    time;
    interval;

    constructor() {
        this.$timeH = document.getElementById('timeH');
        this.$timeM = document.getElementById('timeM');
        this.$timeS = document.getElementById('timeS');
        this.time = 0;
        this.write();
    }
    start() {
        this.interval = setInterval(() => {
            this.time++;
            this.write();
        }, 1000);
    }

    write() {
        let n = 60;
        let h = 0;
        let m = 0;
        let s = 0;
    
        if (this.time >= n*n){ 
            h = (this.time - (this.time % (n*n))) / (n*n); 
        }
        if (this.time >= n) { 
            m = ((this.time - (h*n*n)) - (this.time % n)) / n; 
        }
        s = this.time - (h*n*n) - (m*n);
    
        const zeroPadding = (n) => {
            let l = String(n).length;
            let d = l > 2 ? l : 2;
            return ("0".repeat(2) + n).slice(-d);
        }
        
        this.$timeH.textContent = zeroPadding(h);
        this.$timeM.textContent = zeroPadding(m);
        this.$timeS.textContent = zeroPadding(s);
    }

    clear() {
        clearInterval(this.interval);
    }

}

export default Timer