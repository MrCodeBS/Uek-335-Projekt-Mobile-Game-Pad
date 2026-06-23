const WebSocket = require("ws");
const robot = require('robotjs');

//config
const PORT = 8080;

//Map buttons  to keyboard keys
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
};

// Track what what key is currently being  held (for key repat)
const heldKeys = new Set();

//Websocket Server
const wss = new WebSocket.Server({port: PORT});

wss.on('connection', (ws) =>{
  console.log('Phone Connected!');

  ws.on('message', (raw) => {
    try {
      const { button, action } = JSON.parse(raw);
      const key = KEY_MAP[button];
      if(!key) return;

      if (action === 'press' && !heldKeys.has(key)) {
        robot.keyToggle(key, 'down');
        heldKeys.add(key);
        console.log(`⬇ ${button} → ${key}`);
      } else if (action === 'release'){
        robot.keyToggle(key, 'up');
        heldKeys.delete(key);
        console.log(`⬆ ${button} → ${key}`);
      }
    }catch (e) {
      console.error('Bad message:', e);
    }
  });

  ws.on('close', () => {
    heldKeys.forEach(key => robot.keyToggle(key, 'up'));
    heldKeys.clear();
    console.log('Phone disconnected - Keys released');
  });
});

console.log(`🚀 WS server running on ws://localhost:${PORT}`);
console.log(`   Find your local IP: ipconfig (Win) or ifconfig (Mac)`);
