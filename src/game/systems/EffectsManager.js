export default class EffectsManager {
  constructor(scene) {
    this.scene = scene;
  }

  flashHit(sprite) {
    this.scene.tweens.killTweensOf(sprite);
    sprite.setAlpha(1);

    this.scene.tweens.add({
      targets: sprite,
      alpha: 0.3,
      duration: 60,
      yoyo: true,
      ease: "Linear",
      onComplete: () => sprite.setAlpha(1),
    });
  }

  explode(x, y, color = 0xff4400) {
    const count = 8;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const dist = 20 + Math.random() * 20;

      const particle = this.scene.add.rectangle(x, y, 5, 5, color);
      particle.setAlpha(1);

      const targetX = x + Math.cos(angle) * dist;
      const targetY = y + Math.sin(angle) * dist;

      this.scene.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 300 + Math.random() * 200,
        ease: "Power2",
        onComplete: () => particle.destroy(),
      });
    }

    // Flash central
    const flash = this.scene.add.circle(x, y, 12, color);
    flash.setAlpha(0.8);

    this.scene.tweens.add({
      targets: flash,
      scaleX: 2.5,
      scaleY: 2.5,
      alpha: 0,
      duration: 200,
      ease: "Power2",
      onComplete: () => flash.destroy(),
    });
  }

  gameOverScreen(score, onRestart) {
    if (this._gameOver) return;
    this._gameOver = true;

    const scene = this.scene;

    scene.add.rectangle(400, 300, 800, 600, 0x000000, 0.85).setDepth(20);

    const title = scene.add
      .text(400, 200, "GAME OVER", {
        fontSize: "56px",
        fontFamily: "monospace",
        color: "#ff2244",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setY(230)
      .setDepth(21);

    const scoreText = scene.add
      .text(400, 300, `SCORE  ${String(score).padStart(6, "0")}`, {
        fontSize: "28px",
        fontFamily: "monospace",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setY(330)
      .setDepth(21);

    const btn = scene.add
      .text(400, 380, "[ RESTART ]", {
        fontSize: "24px",
        fontFamily: "monospace",
        color: "#ffbb00",
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setY(410)
      .setDepth(21)
      .setInteractive({ useHandCursor: true });

    btn.on("pointerover", () => btn.setColor("#ffffff"));
    btn.on("pointerout", () => btn.setColor("#ffbb00"));
    btn.on("pointerdown", () => onRestart());

    [title, scoreText, btn].forEach((el, i) => {
      scene.tweens.add({
        targets: el,
        alpha: 1,
        y: el.y - 20,
        delay: 300 + i * 250,
        duration: 500,
        ease: "Power2",
      });
    });

    // Pulse bouton
    scene.time.delayedCall(1100, () => {
      scene.tweens.add({
        targets: btn,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    });
  }

  youWinScreen(score, onRestart) {
    if (this._youWin) return;
    this._youWin = true;

    const scene = this.scene;

    scene.add.rectangle(400, 300, 800, 600, 0x000000, 0.85).setDepth(20);

    const title = scene.add
      .text(400, 180, "YOU WIN", {
        fontSize: "64px",
        fontFamily: "monospace",
        color: "#00ffcc",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setY(210)
      .setDepth(21);

    const scoreText = scene.add
      .text(400, 290, `SCORE  ${String(score).padStart(6, "0")}`, {
        fontSize: "28px",
        fontFamily: "monospace",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setY(320)
      .setDepth(21);

    const btn = scene.add
      .text(400, 370, "[ PLAY AGAIN ]", {
        fontSize: "24px",
        fontFamily: "monospace",
        color: "#00ffcc",
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setY(400)
      .setDepth(21)
      .setInteractive({ useHandCursor: true });

    btn.on("pointerover", () => btn.setColor("#ffffff"));
    btn.on("pointerout", () => btn.setColor("#00ffcc"));
    btn.on("pointerdown", () => onRestart());

    // Particules dorées
    scene.time.delayedCall(200, () => {
      for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 * i) / 20;
        const dist = 60 + Math.random() * 80;
        const p = scene.add.rectangle(400, 300, 6, 6, 0xffdd00).setDepth(22);

        scene.tweens.add({
          targets: p,
          x: 400 + Math.cos(angle) * dist,
          y: 300 + Math.sin(angle) * dist,
          alpha: 0,
          scaleX: 0,
          scaleY: 0,
          duration: 600 + Math.random() * 400,
          ease: "Power2",
          onComplete: () => p.destroy(),
        });
      }
    });

    // Slide in éléments
    [title, scoreText, btn].forEach((el, i) => {
      scene.tweens.add({
        targets: el,
        alpha: 1,
        y: el.y - 20,
        delay: 400 + i * 300,
        duration: 600,
        ease: "Power2",
      });
    });

    // Pulse bouton
    scene.time.delayedCall(1400, () => {
      scene.tweens.add({
        targets: btn,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    });
  }
}
