import Phaser from "phaser";
import MainScene from "./scenes/MainScene.js";

let game = null;

export default function startGame(parent) {
  if (game) return game;

  game = new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: parent || "game-container",
  backgroundColor: "#111111",

  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },

  scene: [MainScene]
});

  return game;
}