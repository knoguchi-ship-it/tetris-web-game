// Canvas rendering

import { BOARD_WIDTH, BOARD_HEIGHT, BUFFER_HEIGHT } from './board.js';
import { TETROMINOS } from './tetromino.js';

const CELL_SIZE = 30;
const PREVIEW_CELL_SIZE = 20;
const BOARD_PADDING = 20;

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Calculate dimensions
        this.boardWidth = BOARD_WIDTH * CELL_SIZE;
        this.boardHeight = BOARD_HEIGHT * CELL_SIZE;
        this.sideWidth = 120;

        // Set canvas size
        this.canvas.width = this.sideWidth + this.boardWidth + this.sideWidth + BOARD_PADDING * 2;
        this.canvas.height = this.boardHeight + BOARD_PADDING * 2;

        // Board position
        this.boardX = this.sideWidth + BOARD_PADDING;
        this.boardY = BOARD_PADDING;

        // Message display
        this.message = null;
        this.messageTimer = 0;
    }

    clear() {
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBoard(board) {
        // Draw board background
        this.ctx.fillStyle = '#0f0f1a';
        this.ctx.fillRect(this.boardX, this.boardY, this.boardWidth, this.boardHeight);

        // Draw grid lines
        this.ctx.strokeStyle = '#2a2a4a';
        this.ctx.lineWidth = 1;

        for (let x = 0; x <= BOARD_WIDTH; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.boardX + x * CELL_SIZE, this.boardY);
            this.ctx.lineTo(this.boardX + x * CELL_SIZE, this.boardY + this.boardHeight);
            this.ctx.stroke();
        }

        for (let y = 0; y <= BOARD_HEIGHT; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.boardX, this.boardY + y * CELL_SIZE);
            this.ctx.lineTo(this.boardX + this.boardWidth, this.boardY + y * CELL_SIZE);
            this.ctx.stroke();
        }

        // Draw locked blocks
        for (let y = BUFFER_HEIGHT; y < board.height; y++) {
            for (let x = 0; x < board.width; x++) {
                const color = board.grid[y][x];
                if (color) {
                    this.drawBlock(
                        this.boardX + x * CELL_SIZE,
                        this.boardY + (y - BUFFER_HEIGHT) * CELL_SIZE,
                        CELL_SIZE,
                        color
                    );
                }
            }
        }

        // Draw border
        this.ctx.strokeStyle = '#4a4a6a';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(this.boardX, this.boardY, this.boardWidth, this.boardHeight);
    }

    drawTetromino(tetromino) {
        const blocks = tetromino.getBlocks();
        for (const block of blocks) {
            const screenY = block.y - BUFFER_HEIGHT;
            if (screenY >= 0) {
                this.drawBlock(
                    this.boardX + block.x * CELL_SIZE,
                    this.boardY + screenY * CELL_SIZE,
                    CELL_SIZE,
                    tetromino.color
                );
            }
        }
    }

    drawGhost(tetromino, ghostY) {
        const blocks = tetromino.getBlocksAt(tetromino.x, ghostY, tetromino.rotation);
        for (const block of blocks) {
            const screenY = block.y - BUFFER_HEIGHT;
            if (screenY >= 0) {
                this.drawGhostBlock(
                    this.boardX + block.x * CELL_SIZE,
                    this.boardY + screenY * CELL_SIZE,
                    CELL_SIZE,
                    tetromino.color
                );
            }
        }
    }

    drawBlock(x, y, size, color) {
        const padding = 2;

        // Main block
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x + padding, y + padding, size - padding * 2, size - padding * 2);

        // Highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(x + padding, y + padding, size - padding * 2, 4);
        this.ctx.fillRect(x + padding, y + padding, 4, size - padding * 2);

        // Shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(x + size - padding - 4, y + padding, 4, size - padding * 2);
        this.ctx.fillRect(x + padding, y + size - padding - 4, size - padding * 2, 4);
    }

    drawGhostBlock(x, y, size, color) {
        const padding = 2;

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = 0.3;
        this.ctx.strokeRect(x + padding, y + padding, size - padding * 2, size - padding * 2);
        this.ctx.globalAlpha = 1;
    }

    drawUI(stats, holdPiece, nextPieces, canHold) {
        this.ctx.font = '16px monospace';
        this.ctx.textAlign = 'left';

        // Hold section
        const holdX = 20;
        let holdY = this.boardY;

        this.ctx.fillStyle = '#888';
        this.ctx.fillText('HOLD', holdX, holdY);
        holdY += 25;

        // Hold box
        this.ctx.strokeStyle = canHold ? '#4a4a6a' : '#3a3a4a';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(holdX, holdY, 80, 60);

        if (holdPiece) {
            this.drawPreviewPiece(holdPiece, holdX + 40, holdY + 30, canHold ? 1 : 0.3);
        }

        // Stats section
        holdY += 80;

        this.ctx.fillStyle = '#888';
        this.ctx.fillText('SCORE', holdX, holdY);
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText(stats.score.toString().padStart(8, '0'), holdX, holdY + 20);

        holdY += 50;
        this.ctx.fillStyle = '#888';
        this.ctx.fillText('HIGH', holdX, holdY);
        this.ctx.fillStyle = '#ff0';
        this.ctx.fillText(stats.highScore.toString().padStart(8, '0'), holdX, holdY + 20);

        holdY += 50;
        this.ctx.fillStyle = '#888';
        this.ctx.fillText('LEVEL', holdX, holdY);
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText(stats.level.toString(), holdX, holdY + 20);

        holdY += 50;
        this.ctx.fillStyle = '#888';
        this.ctx.fillText('LINES', holdX, holdY);
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText(stats.lines.toString(), holdX, holdY + 20);

        // Next section
        const nextX = this.boardX + this.boardWidth + 20;
        let nextY = this.boardY;

        this.ctx.fillStyle = '#888';
        this.ctx.fillText('NEXT', nextX, nextY);
        nextY += 25;

        for (let i = 0; i < nextPieces.length; i++) {
            this.ctx.strokeStyle = '#4a4a6a';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(nextX, nextY, 80, 60);

            this.drawPreviewPiece(nextPieces[i], nextX + 40, nextY + 30);
            nextY += 70;
        }
    }

    drawPreviewPiece(type, centerX, centerY, alpha = 1) {
        const shape = TETROMINOS[type].shape[0];
        const color = TETROMINOS[type].color;
        const size = PREVIEW_CELL_SIZE;

        // Calculate offset to center the piece
        let minX = shape[0].length, maxX = 0;
        let minY = shape.length, maxY = 0;

        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                    minY = Math.min(minY, y);
                    maxY = Math.max(maxY, y);
                }
            }
        }

        const pieceWidth = (maxX - minX + 1) * size;
        const pieceHeight = (maxY - minY + 1) * size;
        const offsetX = centerX - pieceWidth / 2;
        const offsetY = centerY - pieceHeight / 2;

        this.ctx.globalAlpha = alpha;

        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    this.drawBlock(
                        offsetX + (x - minX) * size,
                        offsetY + (y - minY) * size,
                        size,
                        color
                    );
                }
            }
        }

        this.ctx.globalAlpha = 1;
    }

    showMessage(text, duration = 1000) {
        this.message = text;
        this.messageTimer = duration;
    }

    updateMessage(deltaTime) {
        if (this.messageTimer > 0) {
            this.messageTimer -= deltaTime;
            if (this.messageTimer <= 0) {
                this.message = null;
            }
        }
    }

    drawMessage() {
        if (this.message) {
            const alpha = Math.min(1, this.messageTimer / 200);
            this.ctx.globalAlpha = alpha;
            this.ctx.font = 'bold 24px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = '#fff';
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 3;

            const x = this.boardX + this.boardWidth / 2;
            const y = this.boardY + this.boardHeight / 2;

            this.ctx.strokeText(this.message, x, y);
            this.ctx.fillText(this.message, x, y);
            this.ctx.globalAlpha = 1;
        }
    }

    drawPauseOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(this.boardX, this.boardY, this.boardWidth, this.boardHeight);

        this.ctx.font = 'bold 32px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText('PAUSED', this.boardX + this.boardWidth / 2, this.boardY + this.boardHeight / 2);

        this.ctx.font = '16px monospace';
        this.ctx.fillText('Press SPACE to resume', this.boardX + this.boardWidth / 2, this.boardY + this.boardHeight / 2 + 40);
    }

    drawGameOver(stats) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(this.boardX, this.boardY, this.boardWidth, this.boardHeight);

        this.ctx.font = 'bold 32px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#f00';
        this.ctx.fillText('GAME OVER', this.boardX + this.boardWidth / 2, this.boardY + this.boardHeight / 2 - 40);

        this.ctx.font = '20px monospace';
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText(`Score: ${stats.score}`, this.boardX + this.boardWidth / 2, this.boardY + this.boardHeight / 2 + 10);
        this.ctx.fillText(`Level: ${stats.level}`, this.boardX + this.boardWidth / 2, this.boardY + this.boardHeight / 2 + 40);
        this.ctx.fillText(`Lines: ${stats.lines}`, this.boardX + this.boardWidth / 2, this.boardY + this.boardHeight / 2 + 70);

        this.ctx.font = '16px monospace';
        this.ctx.fillStyle = '#888';
        this.ctx.fillText('Press R to restart', this.boardX + this.boardWidth / 2, this.boardY + this.boardHeight / 2 + 110);
    }
}

export { Renderer, CELL_SIZE };
