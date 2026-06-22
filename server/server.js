const WebSocket = require("ws");
const robot = require(robotjs);

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
