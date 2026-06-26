export default class Bullet {
  constructor(scene) {
    this.scene = scene;

    this.sprite = scene.add.rectangle(0, 0, 6, 12, 0xffff00);

    this.speed = 6;

    this.active = false;

    // 🔴 IMPORTANT : invisible au départ
    this.sprite.setVisible(false);
  }

  fire(x, y) {
    this.sprite.x = x;
    this.sprite.y = y;

    this.active = true;

    // 🔥 IMPORTANT : rendre visible au tir
    this.sprite.setVisible(true);
  }

  update() {

    if (!this.active) return;

    this.sprite.y -= this.speed;

    if (this.sprite.y < -20) {
      this.kill();
    }
  }

  kill() {
    this.active = false;

    // 🔥 IMPORTANT : cacher visuellement
    this.sprite.setVisible(false);
  }
}