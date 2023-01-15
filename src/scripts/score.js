const Score = class Score {
    $score;
    score;

    constructor() {
        this.$score = document.getElementById('score');
        this.score = 0
        this.write();
    }

    write() {
        this.$score.textContent = this.score;
    }

    add(speed, rows) {
        this.score = score + 100 * rows * (speed + 1);
        this.write();
    }
}

export default Score;