export default class EnemyBullet {
  constructor(scene, x, y) {
    this.scene = scene;

    this.sprite = scene.add.rectangle(x, y, 6, 12, 0xff0000);

    this.vx = 0;
    this.vy = 4;

    this.active = true;
  }

  update() {
    if (!this.active) return;

    this.sprite.x += this.vx;
    this.sprite.y += this.vy;

    if (this.sprite.y > 700 || this.sprite.y < -100) {
      this.destroy();
    }
  }

  destroy() {
    this.active = false;
    this.sprite.destroy();
  }
}