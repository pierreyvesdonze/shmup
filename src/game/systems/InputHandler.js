import Phaser from "phaser";

export default class InputHandler {
  constructor(scene) {
    this.scene = scene;

    this.cursors = scene.input.keyboard.createCursorKeys();

    this.spaceKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );

    this.superKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.A,
    );

    this.godKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.G,
    );

    this.midBossKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.M,
    );

    this.bossFinalKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.B,
    );

    this.debugKeys = scene.input.keyboard.addKeys({
      level1: Phaser.Input.Keyboard.KeyCodes.ONE,
      level2: Phaser.Input.Keyboard.KeyCodes.TWO,
      level3: Phaser.Input.Keyboard.KeyCodes.THREE,
      level4: Phaser.Input.Keyboard.KeyCodes.FOUR,
      level5: Phaser.Input.Keyboard.KeyCodes.FIVE,
      level6: Phaser.Input.Keyboard.KeyCodes.SIX,
      level7: Phaser.Input.Keyboard.KeyCodes.SEVEN,
      level8: Phaser.Input.Keyboard.KeyCodes.EIGHT,
      level9: Phaser.Input.Keyboard.KeyCodes.NINE,
      level10: Phaser.Input.Keyboard.KeyCodes.ZERO,
    });
  }

  handleDebugCheats(debugMode, resetForLevel) {
    if (!debugMode) return;

    if (this.debugKeys.level1.isDown) resetForLevel(1);
    if (this.debugKeys.level2.isDown) resetForLevel(2);
    if (this.debugKeys.level3.isDown) resetForLevel(3);
    if (this.debugKeys.level4.isDown) resetForLevel(4);
    if (this.debugKeys.level5.isDown) resetForLevel(5);
    if (this.debugKeys.level6.isDown) resetForLevel(6);
    if (this.debugKeys.level7.isDown) resetForLevel(7);
    if (this.debugKeys.level8.isDown) resetForLevel(8);
    if (this.debugKeys.level9.isDown) resetForLevel(9);
    if (this.debugKeys.level10.isDown) resetForLevel(10);

    if (this.godKey.isDown) {
      this.scene.invincible = true;
    }

    if (Phaser.Input.Keyboard.JustDown(this.midBossKey)) {
      if (!this.scene.midBoss) this.scene.startMidBoss();
    }

    if (Phaser.Input.Keyboard.JustDown(this.bossFinalKey)) {
      if (!this.scene.bossFinal) this.scene.startBossFinal();
    }
  }
}