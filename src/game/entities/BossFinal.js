import EnemyBullet from "./EnemyBullet.js";
import Phaser from "phaser";
import PowerUp from "./PowerUp.js";

export default class BossFinal {
  constructor(scene) {
    this.scene = scene;

    // =====================
    // STATE
    // =====================
    this.active = true;

    // =====================
    // POSITION
    // =====================
    this.x = 400;
    this.y = -120;

    this.vx = 0;
    this.vy = 0;

    // =====================
    // VISUAL
    // =====================
    this.sprite = scene.add.sprite(400, 150, "bossfinal");
    this.sprite.setScale(1.5);

    // =====================
    // HP
    // =====================
    this.maxHp = 220;
    this.hp = this.maxHp;

    // =====================
    // PHASE
    // =====================
    this.phase = 1;

    // =====================
    // TIMERS
    // =====================
    this.shootTimer = 0;
    this.patternTimer = 0;
    this.dodgeTimer = 0;
    this.waveTime = 0;

    this.fireRateMultiplier = 2;
    this.shootCooldown = 600 * this.fireRateMultiplier;
    this.patternCooldown = 1100 * this.fireRateMultiplier;
    this.dodgeCooldown = 160;

    // =====================
    // DROPS
    // =====================
    this.dropTimer = 0;
    this.dropCooldown = 250;

    // =====================
    // HP BAR
    // =====================
    this.maxHp = 200;
    this.hp = this.maxHp;

    this.hpBarBg = scene.add.rectangle(400, 50, 260, 12, 0x222222);
    this.hpBar = scene.add.rectangle(400, 50, 260, 12, 0xff0000);
  }

  update(delta) {
    if (!this.active) return;

    this.shootTimer += delta;
    this.patternTimer += delta;
    this.dodgeTimer += delta;
    this.waveTime += delta;

    this.updatePhase();

    this.handleMovement();
    this.handlePatterns();
    this.handleShooting();
    this.handleDodge();

    this.sprite.x = this.x;
    this.sprite.y = this.y;

    this.applyBounds();

    this.updateHpBar();
  }

  // =====================
  // PHASE SYSTEM
  // =====================
  updatePhase() {
    const ratio = this.hp / this.maxHp;

    if (ratio < 0.3) this.phase = 3;
    else if (ratio < 0.7) this.phase = 2;
    else this.phase = 1;
  }

  // =====================
  // MOVEMENT (plus agressif que midboss)
  // =====================
  handleMovement() {
    const playerX = this.scene.player.sprite.x;

    const dx = playerX - this.x;

    const speed = this.phase === 3 ? 0.0045 : 0.0025;

    this.vx += dx * speed;
    this.vx *= 0.88;

    const wave = Math.sin(this.waveTime * 0.003) * 0.9;

    this.x += this.vx + wave;

    // phase 3 = vertical pressure
    if (this.phase === 3) {
      this.y += Math.sin(this.waveTime * 0.0025) * 0.4;
    }
  }

  // =====================
  // HP BAR
  // =====================
  updateHpBar() {
    const ratio = this.hp / this.maxHp;

    this.hpBar.width = 260 * ratio;
    this.hpBar.x = 400 - (260 * (1 - ratio)) / 2;
  }

  // =====================
  // PATTERNS
  // =====================
  handlePatterns() {
    if (this.patternTimer < this.patternCooldown) return;

    this.patternTimer = 0;

    if (this.phase === 1) this.patternA();
    if (this.phase === 2)
      Math.random() < 0.5 ? this.patternB() : this.patternA();
    if (this.phase === 3) this.patternC();
  }

  handleShooting() {
    if (this.shootTimer < this.shootCooldown) return;

    this.shootTimer = 0;

    this.aimedShot();
  }

  handleDodge() {
    const bullets = this.scene.bullets?.list || [];

    for (const b of bullets) {
      if (!b.active) continue;

      const dx = b.sprite.x - this.x;
      const dy = b.sprite.y - this.y;

      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 50) {
        this.vx += dx > 0 ? -4.5 : 4.5;
        this.vy -= 2;
        break;
      }
    }
  }

  // =====================
  // PATTERNS
  // =====================
  patternA() {
    for (let i = 0; i < 14; i++) {
      const angle = (Math.PI * 2 * i) / 14;

      const b = new EnemyBullet(this.scene, this.x, this.y);
      b.vx = Math.cos(angle) * 3.2;
      b.vy = Math.sin(angle) * 3.2;

      this.scene.enemyBullets.push(b);
    }
  }

  patternB() {
    const p = this.scene.player.sprite;

    const dx = p.x - this.x;
    const dy = p.y - this.y;

    const len = Math.sqrt(dx * dx + dy * dy) || 1;

    for (let i = -3; i <= 3; i++) {
      const b = new EnemyBullet(this.scene, this.x, this.y);

      b.vx = (dx / len) * 4 + i * 0.4;
      b.vy = (dy / len) * 4;

      this.scene.enemyBullets.push(b);
    }
  }

  patternC() {
    this.patternA();
    this.patternB();
  }

  aimedShot() {
    const p = this.scene.player.sprite;

    const dx = p.x - this.x;
    const dy = p.y - this.y;

    const len = Math.sqrt(dx * dx + dy * dy) || 1;

    const b = new EnemyBullet(this.scene, this.x, this.y);
    b.vx = (dx / len) * 4.2;
    b.vy = (dy / len) * 4.2;

    this.scene.enemyBullets.push(b);
  }

  // =====================
  // DAMAGE
  // =====================
  damage(amount = 1) {
    this.hp -= amount;

    // LOOT PENDANT LE COMBAT
    if (Math.random() < 0.12) {
      this.dropLoot();
    }

    if (this.hp <= 0) {
      this.destroy();

      this.scene.addScore?.(5000, this.x, this.y);
      this.scene.scoreText?.setText(`Score : ${this.scene.score}`);

      this.scene.time.delayedCall(500, () => {
        this.scene.youWin?.();
      });
    }

    this.tryDrop();
  }

  // =====================
  // LOOT
  // =====================
  spawnDrop(type) {
    const drop = new PowerUp(this.scene, this.x, this.y, type);
    this.scene.powerUps.push(drop);
  }

  dropLoot() {
    const types = ["score", "heal", "power"];

    const type = types[Math.floor(Math.random() * types.length)];

    const offsetX = (Math.random() - 0.5) * 60;

    const pu = new PowerUp(this.scene, this.x + offsetX, this.y, type);

    this.scene.powerUps.push(pu);
  }

  tryDrop() {
    if (this.dropTimer < this.dropCooldown) return;

    const r = Math.random();
    if (r < 0.85) return;

    this.dropTimer = 0;

    let type = null;
    const roll = Math.random();

    if (roll < 0.7) type = "score";
    else if (roll < 0.9) type = "heal";
    else type = "power";

    this.spawnDrop(type);
  }

  applyBounds() {
    this.x = Phaser.Math.Clamp(this.x, 80, 720);
    this.y = Phaser.Math.Clamp(this.y, 80, 320);
  }

  destroy() {
    this.active = false;
    this.sprite.destroy();

    this.scene.score += 5000;
    this.scene.scoreText?.setText(`Score : ${this.scene.score}`);

    this.scene.spawnScorePopup(this.x, this.y, 5000);
  }
}
