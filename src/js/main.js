// Main entry point

import { Game } from './game.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');

    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    const game = new Game(canvas);
    game.start();

    // Expose game instance for debugging
    window.game = game;
});
