// Keyboard input handling with DAS (Delayed Auto Shift)

const KEY_BINDINGS = {
    moveLeft: ['ArrowLeft', 'KeyA'],
    moveRight: ['ArrowRight', 'KeyD'],
    softDrop: ['ArrowDown', 'KeyS'],
    hardDrop: ['ArrowUp', 'KeyW'],
    rotateCW: ['KeyX', 'KeyE'],
    rotateCCW: ['KeyZ', 'KeyQ'],
    hold: ['KeyC', 'ShiftLeft', 'ShiftRight'],
    pause: ['Space'],
    restart: ['KeyR']
};

const DAS_DELAY = 170;  // Initial delay before auto-repeat (ms)
const ARR_DELAY = 50;   // Auto-repeat rate (ms)

class InputHandler {
    constructor() {
        this.keys = {};
        this.keyDownTime = {};
        this.lastRepeatTime = {};
        this.justPressed = {};

        this.bindEvents();
    }

    bindEvents() {
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        window.addEventListener('blur', () => this.reset());
    }

    onKeyDown(e) {
        const code = e.code;

        // Prevent default for game keys
        if (this.isGameKey(code)) {
            e.preventDefault();
        }

        if (!this.keys[code]) {
            this.keys[code] = true;
            this.keyDownTime[code] = performance.now();
            this.lastRepeatTime[code] = 0;
            this.justPressed[code] = true;
        }
    }

    onKeyUp(e) {
        const code = e.code;
        this.keys[code] = false;
        this.keyDownTime[code] = 0;
        this.lastRepeatTime[code] = 0;
        this.justPressed[code] = false;
    }

    isGameKey(code) {
        for (const action in KEY_BINDINGS) {
            if (KEY_BINDINGS[action].includes(code)) {
                return true;
            }
        }
        return false;
    }

    reset() {
        this.keys = {};
        this.keyDownTime = {};
        this.lastRepeatTime = {};
        this.justPressed = {};
    }

    // Check if action was just pressed this frame
    isActionJustPressed(action) {
        const bindings = KEY_BINDINGS[action];
        for (const code of bindings) {
            if (this.justPressed[code]) {
                return true;
            }
        }
        return false;
    }

    // Check if action is held (for DAS)
    isActionHeld(action) {
        const bindings = KEY_BINDINGS[action];
        for (const code of bindings) {
            if (this.keys[code]) {
                return true;
            }
        }
        return false;
    }

    // Check if action should repeat (DAS)
    shouldActionRepeat(action) {
        const bindings = KEY_BINDINGS[action];
        const now = performance.now();

        for (const code of bindings) {
            if (this.keys[code]) {
                const heldTime = now - this.keyDownTime[code];

                if (heldTime >= DAS_DELAY) {
                    const timeSinceLastRepeat = now - this.lastRepeatTime[code];

                    if (this.lastRepeatTime[code] === 0 || timeSinceLastRepeat >= ARR_DELAY) {
                        this.lastRepeatTime[code] = now;
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Clear just pressed flags (call at end of frame)
    clearJustPressed() {
        this.justPressed = {};
    }

    // Get movement input with DAS
    getMovement() {
        let dx = 0;

        // Check for just pressed
        if (this.isActionJustPressed('moveLeft')) {
            dx = -1;
        } else if (this.isActionJustPressed('moveRight')) {
            dx = 1;
        }
        // Check for DAS repeat
        else if (this.shouldActionRepeat('moveLeft')) {
            dx = -1;
        } else if (this.shouldActionRepeat('moveRight')) {
            dx = 1;
        }

        return dx;
    }
}

export { InputHandler, KEY_BINDINGS };
