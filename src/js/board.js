// Board (Matrix) management

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BUFFER_HEIGHT = 2; // Hidden rows above playfield

class Board {
    constructor() {
        this.width = BOARD_WIDTH;
        this.height = BOARD_HEIGHT + BUFFER_HEIGHT;
        this.visibleHeight = BOARD_HEIGHT;
        this.grid = this.createEmptyGrid();
    }

    createEmptyGrid() {
        const grid = [];
        for (let y = 0; y < this.height; y++) {
            grid.push(new Array(this.width).fill(null));
        }
        return grid;
    }

    reset() {
        this.grid = this.createEmptyGrid();
    }

    isValidPosition(tetromino, x, y, rotation) {
        const blocks = tetromino.getBlocksAt(x, y, rotation);

        for (const block of blocks) {
            // Check horizontal bounds
            if (block.x < 0 || block.x >= this.width) {
                return false;
            }
            // Check bottom bound
            if (block.y >= this.height) {
                return false;
            }
            // Allow blocks above the grid (for spawning)
            if (block.y < 0) {
                continue;
            }
            // Check collision with existing blocks
            if (this.grid[block.y][block.x] !== null) {
                return false;
            }
        }
        return true;
    }

    lock(tetromino) {
        const blocks = tetromino.getBlocks();
        for (const block of blocks) {
            if (block.y >= 0 && block.y < this.height) {
                this.grid[block.y][block.x] = tetromino.color;
            }
        }
    }

    clearLines() {
        const clearedRows = [];

        for (let y = this.height - 1; y >= 0; y--) {
            if (this.isRowFull(y)) {
                clearedRows.push(y);
            }
        }

        // Remove cleared rows and add empty rows at top
        for (const row of clearedRows) {
            this.grid.splice(row, 1);
            this.grid.unshift(new Array(this.width).fill(null));
        }

        return clearedRows.length;
    }

    isRowFull(y) {
        return this.grid[y].every(cell => cell !== null);
    }

    isRowEmpty(y) {
        return this.grid[y].every(cell => cell === null);
    }

    getGhostY(tetromino) {
        let ghostY = tetromino.y;
        while (this.isValidPosition(tetromino, tetromino.x, ghostY + 1, tetromino.rotation)) {
            ghostY++;
        }
        return ghostY;
    }

    // T-Spin detection
    isTSpin(tetromino, lastMoveWasRotation, lastKick) {
        if (tetromino.type !== 'T' || !lastMoveWasRotation) {
            return { isTSpin: false, isMini: false };
        }

        // Check the 4 corners of T piece
        const corners = [
            { x: tetromino.x, y: tetromino.y },           // Top-left
            { x: tetromino.x + 2, y: tetromino.y },       // Top-right
            { x: tetromino.x, y: tetromino.y + 2 },       // Bottom-left
            { x: tetromino.x + 2, y: tetromino.y + 2 }    // Bottom-right
        ];

        let filledCorners = 0;
        let frontCornersFilled = 0;

        // Determine which corners are "front" based on rotation
        const frontCornerIndices = {
            0: [2, 3], // Rotation 0: bottom corners are front
            1: [1, 3], // Rotation 1: right corners are front
            2: [0, 1], // Rotation 2: top corners are front
            3: [0, 2]  // Rotation 3: left corners are front
        };

        for (let i = 0; i < corners.length; i++) {
            const corner = corners[i];
            const isFilled = corner.x < 0 || corner.x >= this.width ||
                           corner.y >= this.height ||
                           (corner.y >= 0 && this.grid[corner.y][corner.x] !== null);

            if (isFilled) {
                filledCorners++;
                if (frontCornerIndices[tetromino.rotation].includes(i)) {
                    frontCornersFilled++;
                }
            }
        }

        if (filledCorners >= 3) {
            // If both front corners are filled, it's a proper T-Spin
            // Otherwise, it's a T-Spin Mini
            const isMini = frontCornersFilled < 2;

            // Special case: if we used a wall kick that moved 2 cells, it's not a mini
            if (isMini && lastKick && (Math.abs(lastKick[0]) >= 2 || Math.abs(lastKick[1]) >= 2)) {
                return { isTSpin: true, isMini: false };
            }

            return { isTSpin: true, isMini };
        }

        return { isTSpin: false, isMini: false };
    }

    // Check if game is over
    isGameOver(tetromino) {
        // Check if any block of the spawned piece overlaps with existing blocks
        const blocks = tetromino.getBlocks();
        for (const block of blocks) {
            if (block.y >= 0 && block.y < this.height) {
                if (this.grid[block.y][block.x] !== null) {
                    return true;
                }
            }
        }
        return false;
    }

    // Check if piece is completely above visible area
    isAbovePlayfield(tetromino) {
        const blocks = tetromino.getBlocks();
        return blocks.every(block => block.y < BUFFER_HEIGHT);
    }
}

export { Board, BOARD_WIDTH, BOARD_HEIGHT, BUFFER_HEIGHT };
