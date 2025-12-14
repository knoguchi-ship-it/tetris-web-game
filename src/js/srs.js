// Super Rotation System (SRS) Wall Kick implementation

// Wall kick data for J, L, S, T, Z pieces
const JLSTZ_KICKS = {
    '0->1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],  // 0->R
    '1->0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],      // R->0
    '1->2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],      // R->2
    '2->1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],  // 2->R
    '2->3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],     // 2->L
    '3->2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],   // L->2
    '3->0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],   // L->0
    '0->3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]]      // 0->L
};

// Wall kick data for I piece
const I_KICKS = {
    '0->1': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
    '1->0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
    '1->2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
    '2->1': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
    '2->3': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
    '3->2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
    '3->0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
    '0->3': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]]
};

class SRS {
    static getKickData(type, fromRotation, toRotation) {
        const key = `${fromRotation}->${toRotation}`;

        if (type === 'O') {
            return [[0, 0]]; // O piece doesn't kick
        } else if (type === 'I') {
            return I_KICKS[key] || [[0, 0]];
        } else {
            return JLSTZ_KICKS[key] || [[0, 0]];
        }
    }

    static tryRotate(tetromino, board, direction) {
        // direction: 1 = clockwise, -1 = counter-clockwise
        const fromRotation = tetromino.rotation;
        let toRotation = (fromRotation + direction + 4) % 4;

        const kicks = this.getKickData(tetromino.type, fromRotation, toRotation);

        for (const [kickX, kickY] of kicks) {
            const newX = tetromino.x + kickX;
            const newY = tetromino.y - kickY; // Y is inverted (positive = up in SRS, but down in our grid)

            if (board.isValidPosition(tetromino, newX, newY, toRotation)) {
                return {
                    success: true,
                    x: newX,
                    y: newY,
                    rotation: toRotation,
                    kick: [kickX, kickY]
                };
            }
        }

        return { success: false };
    }
}

export { SRS };
