// Tetromino definitions and colors
const TETROMINOS = {
    I: {
        shape: [
            [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
            [[0,0,1,0], [0,0,1,0], [0,0,1,0], [0,0,1,0]],
            [[0,0,0,0], [0,0,0,0], [1,1,1,1], [0,0,0,0]],
            [[0,1,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0]]
        ],
        color: '#00FFFF'
    },
    O: {
        shape: [
            [[1,1], [1,1]],
            [[1,1], [1,1]],
            [[1,1], [1,1]],
            [[1,1], [1,1]]
        ],
        color: '#FFFF00'
    },
    T: {
        shape: [
            [[0,1,0], [1,1,1], [0,0,0]],
            [[0,1,0], [0,1,1], [0,1,0]],
            [[0,0,0], [1,1,1], [0,1,0]],
            [[0,1,0], [1,1,0], [0,1,0]]
        ],
        color: '#800080'
    },
    S: {
        shape: [
            [[0,1,1], [1,1,0], [0,0,0]],
            [[0,1,0], [0,1,1], [0,0,1]],
            [[0,0,0], [0,1,1], [1,1,0]],
            [[1,0,0], [1,1,0], [0,1,0]]
        ],
        color: '#00FF00'
    },
    Z: {
        shape: [
            [[1,1,0], [0,1,1], [0,0,0]],
            [[0,0,1], [0,1,1], [0,1,0]],
            [[0,0,0], [1,1,0], [0,1,1]],
            [[0,1,0], [1,1,0], [1,0,0]]
        ],
        color: '#FF0000'
    },
    J: {
        shape: [
            [[1,0,0], [1,1,1], [0,0,0]],
            [[0,1,1], [0,1,0], [0,1,0]],
            [[0,0,0], [1,1,1], [0,0,1]],
            [[0,1,0], [0,1,0], [1,1,0]]
        ],
        color: '#0000FF'
    },
    L: {
        shape: [
            [[0,0,1], [1,1,1], [0,0,0]],
            [[0,1,0], [0,1,0], [0,1,1]],
            [[0,0,0], [1,1,1], [1,0,0]],
            [[1,1,0], [0,1,0], [0,1,0]]
        ],
        color: '#FFA500'
    }
};

const TETROMINO_TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

class Tetromino {
    constructor(type) {
        this.type = type;
        this.rotation = 0; // 0, 1, 2, 3 (0=spawn, 1=R, 2=180, 3=L)
        this.shape = TETROMINOS[type].shape;
        this.color = TETROMINOS[type].color;

        // Spawn position (centered, top of playfield)
        if (type === 'I') {
            this.x = 3;
            this.y = 0;
        } else if (type === 'O') {
            this.x = 4;
            this.y = 0;
        } else {
            this.x = 3;
            this.y = 0;
        }
    }

    getBlocks() {
        const blocks = [];
        const shape = this.shape[this.rotation];
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    blocks.push({ x: this.x + col, y: this.y + row });
                }
            }
        }
        return blocks;
    }

    getBlocksAt(x, y, rotation) {
        const blocks = [];
        const shape = this.shape[rotation];
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    blocks.push({ x: x + col, y: y + row });
                }
            }
        }
        return blocks;
    }

    clone() {
        const t = new Tetromino(this.type);
        t.x = this.x;
        t.y = this.y;
        t.rotation = this.rotation;
        return t;
    }
}

// 7-bag randomizer
class BagRandomizer {
    constructor() {
        this.bag = [];
        this.refillBag();
    }

    refillBag() {
        this.bag = [...TETROMINO_TYPES];
        // Fisher-Yates shuffle
        for (let i = this.bag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
        }
    }

    next() {
        if (this.bag.length === 0) {
            this.refillBag();
        }
        return this.bag.pop();
    }

    peek(count) {
        const result = [];
        const tempBag = [...this.bag];
        let nextBag = [];

        for (let i = 0; i < count; i++) {
            if (tempBag.length === 0) {
                if (nextBag.length === 0) {
                    nextBag = [...TETROMINO_TYPES];
                    for (let j = nextBag.length - 1; j > 0; j--) {
                        const k = Math.floor(Math.random() * (j + 1));
                        [nextBag[j], nextBag[k]] = [nextBag[k], nextBag[j]];
                    }
                }
                result.push(nextBag.pop());
            } else {
                result.push(tempBag.pop());
            }
        }
        return result;
    }
}

export { Tetromino, BagRandomizer, TETROMINOS, TETROMINO_TYPES };
