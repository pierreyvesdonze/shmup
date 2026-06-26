export default class ShootingSystem {
  constructor(scene) {
    this.scene = scene;
    this.shootTimer = 0;
    this.shootCooldown = 150;
    this.superTimer = 0;
    this.superCooldown = 800;
  }

  update(delta, spaceKey, superKey) {
    this.shootTimer += delta;
    this.superTimer += delta;

    const scene = this.scene;
    const x = scene.player.sprite.x;
    const y = scene.player.sprite.y - 25;

    // TIR NORMAL
    if (
      spaceKey.isDown &&
      this.shootTimer >= this.shootCooldown &&
      !scene.overheated
    ) {
      this.shootTimer = 0;
      scene.weaponHeat += 6;

      const level = scene.playerPowerLevel;

      if (level === 1) scene.bullets.fire(x, y);

      if (level === 2) {
        scene.bullets.fire(x - 10, y);
        scene.bullets.fire(x + 10, y);
      }

      if (level === 3) {
        scene.bullets.fire(x, y);
        scene.bullets.fire(x - 15, y);
        scene.bullets.fire(x + 15, y);
      }

      if (level === 4) {
        scene.bullets.fire(x, y);
        scene.bullets.fire(x - 20, y);
        scene.bullets.fire(x + 20, y);
        this.shootCooldown = 100;
      }

      if (scene.weaponHeat >= scene.maxHeat) {
        scene.overheated = true;
        scene.heatCooldownTimer = 2000;
      }
    }

    // SUPER SHOOT
    if (superKey.isDown && this.superTimer >= this.superCooldown) {
      this.superTimer = 0;
      this.superShoot(x, y);
    }
  }

  superShoot(x, y) {
    const spread = 15;
    this.scene.bullets.fire(x, y);
    this.scene.bullets.fire(x - spread, y);
    this.scene.bullets.fire(x + spread, y);
  }

  resetCooldown() {
    this.shootCooldown = 150;
  }
}
