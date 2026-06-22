import WebSocket, { WebSocketServer } from "ws";
import robot from "robotjs";

const PORT = 8080;

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

type Message = {
  button: Button;
  action: Action;
};

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

const heldKeys = new Set<string>();

const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected");

    ws.on("message", (raw: Buffer | string) => {    try {
      const { button, action } = JSON.parse(raw.toString()) as Message;

      const key = KEY_MAP[button];
      if (!key) return;

      if (action === "press") {
        if (!heldKeys.has(key)) {
          robot.keyToggle(key, "down");
          heldKeys.add(key);
        }
      }

      if (action === "release") {
        robot.keyToggle(key, "up");
        heldKeys.delete(key);
      }
    } catch (err) {
      console.error("Invalid message:", err);
    }
  });

  ws.on("close", () => {
    heldKeys.forEach((key) => robot.keyToggle(key, "up"));
    heldKeys.clear();
    console.log("Client disconnected, keys released");
  });
});

console.log(`🚀 WS server running on ws://localhost:${PORT}`);
console.log(`   Find your local IP: ipconfig (Win) or ifconfig (Mac)`);
