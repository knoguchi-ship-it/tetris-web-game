// Scoring system (Tetris Guideline compliant)

const LINE_CLEAR_SCORES = {
    1: 100,   // Single
    2: 300,   // Double
    3: 500,   // Triple
    4: 800    // Tetris
};

const TSPIN_SCORES = {
    0: 400,        // T-Spin no lines
    1: 800,        // T-Spin Single
    2: 1200,       // T-Spin Double
    3: 1600        // T-Spin Triple
};

const TSPIN_MINI_SCORES = {
    0: 100,        // T-Spin Mini no lines
    1: 200,        // T-Spin Mini Single
    2: 400         // T-Spin Mini Double
};

const COMBO_BONUS = 50;
const BACK_TO_BACK_MULTIPLIER = 1.5;
const LINES_PER_LEVEL = 10;

// Gravity speeds (frames per row at 60fps -> converted to ms per row)
const GRAVITY_TABLE = [
    1000,   // Level 1
    793,    // Level 2
    618,    // Level 3
    473,    // Level 4
    355,    // Level 5
    262,    // Level 6
    190,    // Level 7
    135,    // Level 8
    94,     // Level 9
    64,     // Level 10
    43,     // Level 11
    43,     // Level 12
    28,     // Level 13
    28,     // Level 14
    28,     // Level 15
    18,     // Level 16
    18,     // Level 17
    18,     // Level 18
    11,     // Level 19
    11,     // Level 20+
];

class ScoreManager {
    constructor() {
        this.reset();
        this.highScore = this.loadHighScore();
    }

    reset() {
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.combo = -1;
        this.backToBack = false;
        this.lastClearWasDifficult = false;
    }

    addLineClear(linesCleared, tSpinInfo = { isTSpin: false, isMini: false }) {
        if (linesCleared === 0 && !tSpinInfo.isTSpin) {
            this.combo = -1;
            return { score: 0, message: null };
        }

        let baseScore = 0;
        let message = '';
        let isDifficult = false;

        if (tSpinInfo.isTSpin) {
            if (tSpinInfo.isMini) {
                baseScore = TSPIN_MINI_SCORES[linesCleared] || 0;
                message = linesCleared > 0 ? `T-Spin Mini ${this.getLineName(linesCleared)}` : 'T-Spin Mini';
            } else {
                baseScore = TSPIN_SCORES[linesCleared] || 0;
                message = linesCleared > 0 ? `T-Spin ${this.getLineName(linesCleared)}` : 'T-Spin';
            }
            isDifficult = linesCleared > 0;
        } else if (linesCleared > 0) {
            baseScore = LINE_CLEAR_SCORES[linesCleared];
            message = this.getLineName(linesCleared);
            isDifficult = linesCleared === 4; // Tetris is difficult
        }

        // Apply level multiplier
        let score = baseScore * this.level;

        // Back-to-Back bonus
        if (isDifficult && this.lastClearWasDifficult) {
            score = Math.floor(score * BACK_TO_BACK_MULTIPLIER);
            message = 'Back-to-Back ' + message;
            this.backToBack = true;
        } else {
            this.backToBack = false;
        }

        // Combo bonus
        if (linesCleared > 0) {
            this.combo++;
            if (this.combo > 0) {
                const comboScore = COMBO_BONUS * this.combo * this.level;
                score += comboScore;
                message += ` (${this.combo} Combo)`;
            }
        }

        this.score += score;
        this.lines += linesCleared;
        this.lastClearWasDifficult = isDifficult;

        // Level up
        const newLevel = Math.floor(this.lines / LINES_PER_LEVEL) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
        }

        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }

        return { score, message: message || null };
    }

    addSoftDrop(cells) {
        this.score += cells;
    }

    addHardDrop(cells) {
        this.score += cells * 2;
    }

    getLineName(lines) {
        switch (lines) {
            case 1: return 'Single';
            case 2: return 'Double';
            case 3: return 'Triple';
            case 4: return 'Tetris';
            default: return '';
        }
    }

    getGravity() {
        const index = Math.min(this.level - 1, GRAVITY_TABLE.length - 1);
        return GRAVITY_TABLE[index];
    }

    loadHighScore() {
        try {
            return parseInt(localStorage.getItem('tetrisHighScore')) || 0;
        } catch (e) {
            return 0;
        }
    }

    saveHighScore() {
        try {
            localStorage.setItem('tetrisHighScore', this.highScore.toString());
        } catch (e) {
            // Storage not available
        }
    }

    getStats() {
        return {
            score: this.score,
            highScore: this.highScore,
            level: this.level,
            lines: this.lines
        };
    }
}

export { ScoreManager, LINES_PER_LEVEL };
