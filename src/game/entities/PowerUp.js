export default class PowerUp {
  constructor(scene, x, y, type) {
    this.scene = scene;
    this.type = type;
    this.active = true;
    this.speed = 2;

    const config = {
      heal: { symbol: "♥", color: "#ff4444", size: "25px" },
      power: { symbol: "⬡", color: "#00ffcc", size: "25px" },
      score: { symbol: "★", color: "#ffff00", size: "25px" },
    }[type] ?? { symbol: "●", color: "#ffffff", size: "18px" };

    this.sprite = scene.add
      .text(x, y, config.symbol, {
        fontSize: config.size,
        color: config.color,
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    // ANIMATIONS
    if (type === "heal") {
      scene.tweens.add({
        targets: this.sprite,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    if (type === "power") {
      scene.tweens.add({
        targets: this.sprite,
        angle: 360,
        duration: 1200,
        repeat: -1,
        ease: "Linear",
      });
    }

    if (type === "score") {
      scene.tweens.add({
        targets: this.sprite,
        alpha: 0.3,
        duration: 400,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  update() {
    this.sprite.y += this.speed;
    if (this.sprite.y > 650) {
      this.destroy();
    }
  }

  destroy() {
    this.active = false;
    this.scene.tweens.killTweensOf(this.sprite);
    this.sprite.destroy();
  }
}
