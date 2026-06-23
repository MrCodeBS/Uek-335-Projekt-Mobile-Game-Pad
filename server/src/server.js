"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const robotjs_1 = __importDefault(require("robotjs"));
const PORT = 8080;
// ── Key Mapping ────────────────────────────────────────
const KEY_MAP = {
    UP: "up",
    DOWN: "down",
    LEFT: "left",
    RIGHT: "right",
    A: "space",
    B: "r",
    X: "c",
    Y: "m",
    LB: "shift",
    RB: "tab",
    L2: "shift",
    R2: "ctrl",
};
// Track which keys are currently held
const heldKeys = new Set();
// ── Axis Handling ──────────────────────────────────────
// For analog joystick: we map continuous x/y to discrete keys
// with a deadzone threshold
const AXIS_DEADZONE = 0.3;
let axisHeld = {
    left: false,
    right: false,
    up: false,
    down: false,
};
function handleAxis(x, y) {
    // Horizontal
    if (x < -AXIS_DEADZONE && !axisHeld.left) {
        robotjs_1.default.keyToggle("left", "down");
        axisHeld.left = true;
        console.log("🕹️  Axis → LEFT down");
    }
    else if (x >= -AXIS_DEADZONE && axisHeld.left) {
        robotjs_1.default.keyToggle("left", "up");
        axisHeld.left = false;
        console.log("🕹️  Axis → LEFT up");
    }
    if (x > AXIS_DEADZONE && !axisHeld.right) {
        robotjs_1.default.keyToggle("right", "down");
        axisHeld.right = true;
        console.log("🕹️  Axis → RIGHT down");
    }
    else if (x <= AXIS_DEADZONE && axisHeld.right) {
        robotjs_1.default.keyToggle("right", "up");
        axisHeld.right = false;
        console.log("🕹️  Axis → RIGHT up");
    }
    // Vertical
    if (y < -AXIS_DEADZONE && !axisHeld.up) {
        robotjs_1.default.keyToggle("up", "down");
        axisHeld.up = true;
        console.log("🕹️  Axis → UP down");
    }
    else if (y >= -AXIS_DEADZONE && axisHeld.up) {
        robotjs_1.default.keyToggle("up", "up");
        axisHeld.up = false;
        console.log("🕹️  Axis → UP up");
    }
    if (y > AXIS_DEADZONE && !axisHeld.down) {
        robotjs_1.default.keyToggle("down", "down");
        axisHeld.down = true;
        console.log("🕹️  Axis → DOWN down");
    }
    else if (y <= AXIS_DEADZONE && axisHeld.down) {
        robotjs_1.default.keyToggle("down", "up");
        axisHeld.down = false;
        console.log("🕹️  Axis → DOWN up");
    }
}
function releaseAllAxisKeys() {
    for (const dir of Object.keys(axisHeld)) {
        if (axisHeld[dir]) {
            robotjs_1.default.keyToggle(dir, "up");
            axisHeld[dir] = false;
        }
    }
}
// ── WebSocket Server ───────────────────────────────────
const wss = new ws_1.WebSocketServer({ port: PORT });
wss.on("connection", (ws) => {
    console.log("📱 Phone connected!");
    ws.on("message", (raw) => {
        try {
            const msg = JSON.parse(raw.toString());
            if (msg.type === "axis") {
                // Analog joystick data
                handleAxis(msg.x, msg.y);
                return;
            }
            // Button press/release
            const { button, action } = msg;
            const key = KEY_MAP[button];
            if (!key)
                return;
            if (action === "press") {
                if (!heldKeys.has(key)) {
                    robotjs_1.default.keyToggle(key, "down");
                    heldKeys.add(key);
                    console.log(`⬇ ${button} → ${key}`);
                }
            }
            if (action === "release") {
                robotjs_1.default.keyToggle(key, "up");
                heldKeys.delete(key);
                console.log(`⬆ ${button} → ${key}`);
            }
        }
        catch (err) {
            console.error("Invalid message:", err);
        }
    });
    ws.on("close", () => {
        // Safety: release all held keys on disconnect
        heldKeys.forEach((key) => robotjs_1.default.keyToggle(key, "up"));
        heldKeys.clear();
        releaseAllAxisKeys();
        console.log("📴 Phone disconnected — all keys released");
    });
});
console.log(`🚀 WS server running on ws://localhost:${PORT}`);
console.log(`   Find your local IP: ipconfig (Win) or ifconfig (Mac)`);
//# sourceMappingURL=server.js.map