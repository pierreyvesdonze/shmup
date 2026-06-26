export default class PowerUp {
  constructor(scene, x, y, type) {
    this.scene = scene;
    this.type = type;

    let color = 0xffffff;

    if (type === "power") color = 0x00ffcc;
    if (type === "heal") color = 0xff4444;
    if (type === "score") color = 0xffff00;

    this.sprite = scene.add.circle(x, y, 10, color);

    this.speed = 2;
    this.active = true;
  }

  update() {
    this.sprite.y += this.speed;

    if (this.sprite.y > 650) {
      this.destroy();
    }
  }

  destroy() {
    this.active = false;
    this.sprite.destroy();
  }
}