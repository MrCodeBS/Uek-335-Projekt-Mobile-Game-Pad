import WebSocket, { WebSocketServer } from "ws";
import robot from "robotjs";

const PORT = 8080;

// ── Types ──────────────────────────────────────────────
type Button =
  | "UP"
  | "DOWN"
  | "LEFT"
  | "RIGHT"
  | "A"
  | "B"
  | "X"
  | "Y"
  | "LB"
  | "RB"
  | "L2"
  | "R2";

type Action = "press" | "release";

type ButtonMessage = {
  type?: "button";
  button: Button;
  action: Action;
};

type AxisMessage = {
  type: "axis";
  x: number; // -1 to 1
  y: number; // -1 to 1
};

type Message = ButtonMessage | AxisMessage;

// ── Key Mapping ────────────────────────────────────────
const KEY_MAP: Record<Button, string> = {
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
const heldKeys = new Set<string>();

// ── Axis Handling ──────────────────────────────────────
// For analog joystick: we map continuous x/y to discrete keys
// with a deadzone threshold
const AXIS_DEADZONE = 0.3;
let axisHeld: Record<string, boolean> = {
  left: false,
  right: false,
  up: false,
  down: false,
};

function handleAxis(x: number, y: number): void {
  // Horizontal
  if (x < -AXIS_DEADZONE && !axisHeld.left) {
    robot.keyToggle("left", "down");
    axisHeld.left = true;
    console.log("🕹️  Axis → LEFT down");
  } else if (x >= -AXIS_DEADZONE && axisHeld.left) {
    robot.keyToggle("left", "up");
    axisHeld.left = false;
    console.log("🕹️  Axis → LEFT up");
  }

  if (x > AXIS_DEADZONE && !axisHeld.right) {
    robot.keyToggle("right", "down");
    axisHeld.right = true;
    console.log("🕹️  Axis → RIGHT down");
  } else if (x <= AXIS_DEADZONE && axisHeld.right) {
    robot.keyToggle("right", "up");
    axisHeld.right = false;
    console.log("🕹️  Axis → RIGHT up");
  }

  // Vertical
  if (y < -AXIS_DEADZONE && !axisHeld.up) {
    robot.keyToggle("up", "down");
    axisHeld.up = true;
    console.log("🕹️  Axis → UP down");
  } else if (y >= -AXIS_DEADZONE && axisHeld.up) {
    robot.keyToggle("up", "up");
    axisHeld.up = false;
    console.log("🕹️  Axis → UP up");
  }

  if (y > AXIS_DEADZONE && !axisHeld.down) {
    robot.keyToggle("down", "down");
    axisHeld.down = true;
    console.log("🕹️  Axis → DOWN down");
  } else if (y <= AXIS_DEADZONE && axisHeld.down) {
    robot.keyToggle("down", "up");
    axisHeld.down = false;
    console.log("🕹️  Axis → DOWN up");
  }
}

function releaseAllAxisKeys(): void {
  for (const dir of Object.keys(axisHeld)) {
    if (axisHeld[dir]) {
      robot.keyToggle(dir as string, "up");
      axisHeld[dir] = false;
    }
  }
}

// ── WebSocket Server ───────────────────────────────────
const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (ws: WebSocket) => {
  console.log("📱 Phone connected!");

  ws.on("message", (raw: Buffer | string) => {
    try {
      const msg = JSON.parse(raw.toString()) as Message;

      if (msg.type === "axis") {
        // Analog joystick data
        handleAxis(msg.x, msg.y);
        return;
      }

      // Button press/release
      const { button, action } = msg as ButtonMessage;
      const key = KEY_MAP[button];
      if (!key) return;

      if (action === "press") {
        if (!heldKeys.has(key)) {
          robot.keyToggle(key, "down");
          heldKeys.add(key);
          console.log(`⬇ ${button} → ${key}`);
        }
      }

      if (action === "release") {
        robot.keyToggle(key, "up");
        heldKeys.delete(key);
        console.log(`⬆ ${button} → ${key}`);
      }
    } catch (err) {
      console.error("Invalid message:", err);
    }
  });

  ws.on("close", () => {
    // Safety: release all held keys on disconnect
    heldKeys.forEach((key) => robot.keyToggle(key, "up"));
    heldKeys.clear();
    releaseAllAxisKeys();
    console.log(" Phone disconnected — all keys released");
  });
});

console.log(`🚀 WS server running on ws://localhost:${PORT}`);
console.log(`   Find your local IP: ipconfig (Win) or ifconfig (Mac)`);
