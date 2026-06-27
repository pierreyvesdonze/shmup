import Phaser from "phaser";

export default class Player {
  constructor(scene, x, y) {
    this.scene = scene;

    this.sprite = this.scene.add.sprite(x, y, "player");

    this.maxSpeed = 9;

    this.acceleration = 3.2;
    this.friction = 0.68;

    this.velocityX = 0;
    this.velocityY = 0;
  }

  update(cursors) {
    
    // =====================
    // INPUT → ACCÉLÉRATION
    // =====================
    if (cursors.left.isDown) this.velocityX -= this.acceleration;
    if (cursors.right.isDown) this.velocityX += this.acceleration;
    if (cursors.up.isDown) this.velocityY -= this.acceleration;
    if (cursors.down.isDown) this.velocityY += this.acceleration;

    // =====================
    // FRICTION (ralentissement naturel)
    // =====================
    this.velocityX *= this.friction;
    this.velocityY *= this.friction;

    // =====================
    // LIMITATION VITESSE
    // =====================
    this.velocityX = Phaser.Math.Clamp(
      this.velocityX,
      -this.maxSpeed,
      this.maxSpeed,
    );

    this.velocityY = Phaser.Math.Clamp(
      this.velocityY,
      -this.maxSpeed,
      this.maxSpeed,
    );

    // =====================
    // APPLY MOVE
    // =====================
    this.sprite.x += this.velocityX;
    this.sprite.y += this.velocityY;

    // =====================
    // BORDURES ÉCRAN
    // =====================
    this.sprite.x = Phaser.Math.Clamp(this.sprite.x, 25, 775);
    this.sprite.y = Phaser.Math.Clamp(this.sprite.y, 25, 575);
  }
}
