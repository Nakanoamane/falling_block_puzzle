const Score = class Score {
    $score;
    $newRecord;
    $resultScore;
    score;
    best = 0;

    constructor() {
        this.getElements();
        this.score = 0
        this.write();
    }

    getElements() {
        this.$score = document.getElementById('score');
        this.$newRecord = document.getElementById('newRecord');
        this.$resultScore = document.getElementById('resultScore');
    }

    get isMyNewRecord() {
        return this.score > this.best
    }

    write() {
        this.$score.textContent = this.score;
    }

    add(speed, rows) {
        this.score = this.score + 100 * rows * (speed + 1);
        this.write();
    }

    writeResult() {
        if(this.isMyNewRecord){
            this.best = this.score;
            this.$newRecord.style.display = 'block'
        } else {
            this.$newRecord.style.display = 'none'
        }

        this.$resultScore.textContent = this.score;
    }
}

export default Score;