// Game state and main loop

import { Board } from './board.js';
import { Tetromino, BagRandomizer } from './tetromino.js';
import { SRS } from './srs.js';
import { InputHandler } from './input.js';
import { ScoreManager } from './scoring.js';
import { Renderer } from './renderer.js';

const LOCK_DELAY = 500;      // ms before piece locks
const LOCK_MOVE_LIMIT = 15;  // max moves/rotations before forced lock
const NEXT_PREVIEW_COUNT = 3;

const GameState = {
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameover'
};

class Game {
    constructor(canvas) {
        this.renderer = new Renderer(canvas);
        this.input = new InputHandler();
        this.board = new Board();
        this.scoreManager = new ScoreManager();
        this.randomizer = new BagRandomizer();

        this.state = GameState.PLAYING;
        this.currentPiece = null;
        this.holdPiece = null;
        this.canHold = true;
        this.nextPieces = [];

        this.gravityTimer = 0;
        this.lockTimer = 0;
        this.lockMoveCount = 0;
        this.isOnGround = false;

        this.lastMoveWasRotation = false;
        this.lastKick = null;

        this.lastTime = 0;

        this.init();
    }

    init() {
        // Fill next queue
        for (let i = 0; i < NEXT_PREVIEW_COUNT; i++) {
            this.nextPieces.push(this.randomizer.next());
        }

        this.spawnPiece();
    }

    spawnPiece() {
        // Get next piece from queue
        const type = this.nextPieces.shift();
        this.nextPieces.push(this.randomizer.next());

        this.currentPiece = new Tetromino(type);
        this.gravityTimer = 0;
        this.lockTimer = 0;
        this.lockMoveCount = 0;
        this.isOnGround = false;
        this.lastMoveWasRotation = false;
        this.lastKick = null;
        this.canHold = true;

        // Check for game over
        if (this.board.isGameOver(this.currentPiece)) {
            this.state = GameState.GAME_OVER;
        }
    }

    hold() {
        if (!this.canHold) return;

        const currentType = this.currentPiece.type;

        if (this.holdPiece) {
            // Swap with hold piece
            this.currentPiece = new Tetromino(this.holdPiece);
            this.holdPiece = currentType;
        } else {
            // Put current in hold, spawn new piece
            this.holdPiece = currentType;
            const type = this.nextPieces.shift();
            this.nextPieces.push(this.randomizer.next());
            this.currentPiece = new Tetromino(type);
        }

        this.canHold = false;
        this.gravityTimer = 0;
        this.lockTimer = 0;
        this.lockMoveCount = 0;
        this.isOnGround = false;
        this.lastMoveWasRotation = false;
        this.lastKick = null;

        // Check for game over after hold
        if (this.board.isGameOver(this.currentPiece)) {
            this.state = GameState.GAME_OVER;
        }
    }

    moveHorizontal(dx) {
        const newX = this.currentPiece.x + dx;
        if (this.board.isValidPosition(this.currentPiece, newX, this.currentPiece.y, this.currentPiece.rotation)) {
            this.currentPiece.x = newX;
            this.lastMoveWasRotation = false;
            this.lastKick = null;

            // Reset lock timer if on ground (up to limit)
            if (this.isOnGround && this.lockMoveCount < LOCK_MOVE_LIMIT) {
                this.lockTimer = 0;
                this.lockMoveCount++;
            }

            return true;
        }
        return false;
    }

    moveDown() {
        const newY = this.currentPiece.y + 1;
        if (this.board.isValidPosition(this.currentPiece, this.currentPiece.x, newY, this.currentPiece.rotation)) {
            this.currentPiece.y = newY;
            this.lastMoveWasRotation = false;
            this.lastKick = null;
            this.lockTimer = 0;
            return true;
        }
        return false;
    }

    softDrop() {
        if (this.moveDown()) {
            this.scoreManager.addSoftDrop(1);
            this.gravityTimer = 0;
            return true;
        }
        return false;
    }

    hardDrop() {
        let dropDistance = 0;
        while (this.moveDown()) {
            dropDistance++;
        }
        this.scoreManager.addHardDrop(dropDistance);
        this.lockPiece();
    }

    rotate(direction) {
        const result = SRS.tryRotate(this.currentPiece, this.board, direction);

        if (result.success) {
            this.currentPiece.x = result.x;
            this.currentPiece.y = result.y;
            this.currentPiece.rotation = result.rotation;
            this.lastMoveWasRotation = true;
            this.lastKick = result.kick;

            // Reset lock timer if on ground (up to limit)
            if (this.isOnGround && this.lockMoveCount < LOCK_MOVE_LIMIT) {
                this.lockTimer = 0;
                this.lockMoveCount++;
            }

            return true;
        }
        return false;
    }

    lockPiece() {
        // Check T-Spin before locking
        const tSpinInfo = this.board.isTSpin(this.currentPiece, this.lastMoveWasRotation, this.lastKick);

        // Lock the piece
        this.board.lock(this.currentPiece);

        // Check if piece locked entirely above playfield
        if (this.board.isAbovePlayfield(this.currentPiece)) {
            this.state = GameState.GAME_OVER;
            return;
        }

        // Clear lines and update score
        const linesCleared = this.board.clearLines();
        const result = this.scoreManager.addLineClear(linesCleared, tSpinInfo);

        if (result.message) {
            this.renderer.showMessage(result.message, 1500);
        }

        // Spawn next piece
        this.spawnPiece();
    }

    update(deltaTime) {
        if (this.state === GameState.PAUSED || this.state === GameState.GAME_OVER) {
            // Handle restart in game over state
            if (this.state === GameState.GAME_OVER && this.input.isActionJustPressed('restart')) {
                this.reset();
            }
            this.input.clearJustPressed();
            return;
        }

        // Handle pause
        if (this.input.isActionJustPressed('pause')) {
            this.state = GameState.PAUSED;
            this.input.clearJustPressed();
            return;
        }

        // Handle hold
        if (this.input.isActionJustPressed('hold')) {
            this.hold();
        }

        // Handle rotation
        if (this.input.isActionJustPressed('rotateCW')) {
            this.rotate(1);
        }
        if (this.input.isActionJustPressed('rotateCCW')) {
            this.rotate(-1);
        }

        // Handle horizontal movement
        const dx = this.input.getMovement();
        if (dx !== 0) {
            this.moveHorizontal(dx);
        }

        // Handle soft drop
        if (this.input.isActionHeld('softDrop')) {
            if (this.input.isActionJustPressed('softDrop') || this.input.shouldActionRepeat('softDrop')) {
                this.softDrop();
            }
        }

        // Handle hard drop
        if (this.input.isActionJustPressed('hardDrop')) {
            this.hardDrop();
            this.input.clearJustPressed();
            return;
        }

        // Gravity
        this.gravityTimer += deltaTime;
        const gravity = this.scoreManager.getGravity();

        while (this.gravityTimer >= gravity) {
            this.gravityTimer -= gravity;
            if (!this.moveDown()) {
                // Piece is on ground
                this.isOnGround = true;
                break;
            }
        }

        // Lock delay
        if (!this.board.isValidPosition(this.currentPiece, this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.rotation)) {
            this.isOnGround = true;
            this.lockTimer += deltaTime;

            if (this.lockTimer >= LOCK_DELAY || this.lockMoveCount >= LOCK_MOVE_LIMIT) {
                this.lockPiece();
            }
        } else {
            this.isOnGround = false;
            this.lockTimer = 0;
        }

        // Clear just pressed flags at end of frame
        this.input.clearJustPressed();

        // Update message timer
        this.renderer.updateMessage(deltaTime);
    }

    render() {
        this.renderer.clear();
        this.renderer.drawBoard(this.board);

        if (this.state === GameState.PLAYING) {
            // Draw ghost piece
            const ghostY = this.board.getGhostY(this.currentPiece);
            if (ghostY !== this.currentPiece.y) {
                this.renderer.drawGhost(this.currentPiece, ghostY);
            }

            // Draw current piece
            this.renderer.drawTetromino(this.currentPiece);
        }

        // Draw UI
        this.renderer.drawUI(
            this.scoreManager.getStats(),
            this.holdPiece,
            this.nextPieces,
            this.canHold
        );

        // Draw messages
        this.renderer.drawMessage();

        // Draw overlays
        if (this.state === GameState.PAUSED) {
            this.renderer.drawPauseOverlay();
        } else if (this.state === GameState.GAME_OVER) {
            this.renderer.drawGameOver(this.scoreManager.getStats());
        }
    }

    togglePause() {
        if (this.state === GameState.PLAYING) {
            this.state = GameState.PAUSED;
        } else if (this.state === GameState.PAUSED) {
            this.state = GameState.PLAYING;
        }
    }

    reset() {
        this.board.reset();
        this.scoreManager.reset();
        this.randomizer = new BagRandomizer();

        this.state = GameState.PLAYING;
        this.currentPiece = null;
        this.holdPiece = null;
        this.canHold = true;
        this.nextPieces = [];

        this.gravityTimer = 0;
        this.lockTimer = 0;
        this.lockMoveCount = 0;
        this.isOnGround = false;
        this.lastMoveWasRotation = false;
        this.lastKick = null;

        // Fill next queue
        for (let i = 0; i < NEXT_PREVIEW_COUNT; i++) {
            this.nextPieces.push(this.randomizer.next());
        }

        this.spawnPiece();
    }

    start() {
        const gameLoop = (timestamp) => {
            const deltaTime = timestamp - this.lastTime;
            this.lastTime = timestamp;

            // Handle pause toggle
            if (this.state === GameState.PAUSED && this.input.isActionJustPressed('pause')) {
                this.state = GameState.PLAYING;
                this.input.clearJustPressed();
            }

            this.update(deltaTime);
            this.render();

            requestAnimationFrame(gameLoop);
        };

        requestAnimationFrame((timestamp) => {
            this.lastTime = timestamp;
            requestAnimationFrame(gameLoop);
        });
    }
}

export { Game, GameState };
