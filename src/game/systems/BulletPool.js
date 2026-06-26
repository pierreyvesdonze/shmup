import Bullet from "../entities/Bullet.js";

export default class BulletPool {
  constructor(scene, size) {
    this.scene = scene;

    this.list = [];

    for (let i = 0; i < size; i++) {
      const bullet = new Bullet(scene);
      this.list.push(bullet);
    }
  }

  fire(x, y) {
    const bullet = this.list.find((b) => !b.active);
    if (!bullet) return null;

    bullet.fire(x, y);
    return bullet;
  }

  update() {
    for (const bullet of this.list) {
      if (bullet.active) {
        bullet.update();
      }
    }
  }
}
