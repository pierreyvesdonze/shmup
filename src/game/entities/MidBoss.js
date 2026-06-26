import EnemyBullet from "./EnemyBullet.js";
import PowerUp from "./PowerUp.js";
import Phaser from "phaser";

export default class MidBoss {
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
    this.y = -80;

    this.targetX = 400;
    this.targetY = 120;

    // velocity system (stable movement)
    this.vx = 0;
    this.vy = 0;

    // =====================
    // VISUAL
    // =====================
    this.sprite = scene.add.sprite(400, 150, "midboss");
    this.sprite.setScale(1.5);

    // =====================
    // HP
    // =====================
    this.maxHp = 80;
    this.hp = this.maxHp;

    this.hpBarBg = scene.add.rectangle(400, 30, 220, 10, 0x222222);
    this.hpBar = scene.add.rectangle(400, 30, 220, 10, 0xff00ff);

    // =====================
    // DROPS
    // =====================
    this.dropTimer = 0;
    this.dropCooldown = 250;

    // =====================
    // STATE MACHINE
    // =====================
    this.state = "enter";

    // =====================
    // TIMERS
    // =====================
    this.shootTimer = 0;
    this.shootCooldown = 900;

    this.patternTimer = 0;
    this.patternCooldown = 1800;

    this.dodgeCooldownTimer = 0;
    this.dodgeCooldown = 250;

    this.dropTimer = 0;
    this.dropCooldown = 250;

    // movement tuning
    this.waveTime = 0;
  }

  // =====================
  // UPDATE
  // =====================
  update(delta) {
    if (!this.active) return;

    this.patternTimer += delta;
    this.shootTimer += delta;
    this.dodgeTimer += delta;
    this.waveTime += delta;
    this.dropTimer += delta;
    this.dodgeCooldownTimer += delta;

    // =====================
    // ENTRY PHASE
    // =====================
    if (this.state === "enter") {
      this.y += 1.2;

      if (this.y >= this.targetY) {
        this.y = this.targetY;
        this.state = "fight";
      }
    }

    // =====================
    // FIGHT PHASE
    // =====================
    if (this.state === "fight") {
      this.handleMovement();
      this.handlePatterns();
      this.handleShooting();
      this.handleDodge();
    }

    // =====================
    // APPLY POSITION
    // =====================
    this.sprite.x = this.x;
    this.sprite.y = this.y;
    this.x = Phaser.Math.Clamp(this.x, 80, 720);

    this.updateHpBar();

    // IMPORTANT: clamp LOGIC not sprite
    this.y = Phaser.Math.Clamp(this.y, 100, 300);
  }

  // =====================
  // MOVEMENT (stable + smooth)
  // =====================
  handleMovement() {
    const playerX = this.scene.player.sprite.x;

    const dx = playerX - this.x;

    // soft tracking
    this.vx += dx * 0.0015;

    // damping
    this.vx *= 0.92;

    // wave controlled (not additive chaos)
    const wave = Math.sin(this.waveTime * 0.002) * 0.6;

    this.x += this.vx + wave;

    // slight vertical drift stabilizer
    this.y += this.vy;
    this.vy *= 0.9;

    this.x += this.vx + wave;

    // clamp soft (évite sortie écran)
    this.x = Phaser.Math.Clamp(this.x, 80, 720);

    // stop velocity si bord touché
    if (this.x <= 80 || this.x >= 720) {
      this.vx *= -0.3;
    }
  }

  // =====================
  // PATTERNS
  // =====================
  handlePatterns() {
    if (this.patternTimer < this.patternCooldown) return;

    this.patternTimer = 0;

    const r = Math.random();

    if (r < 0.33) this.spikeBurst();
    else if (r < 0.66) this.crossBurst();
    else this.aimedBurst();
  }

  // =====================
  // SHOOT
  // =====================
  handleShooting() {
    if (this.shootTimer < this.shootCooldown) return;

    this.shootTimer = 0;
    this.aimedShot();
  }

  // =====================
  // DODGE (fixed + non-broken)
  // =====================
  handleDodge() {
    if (this.dodgeCooldownTimer < this.dodgeCooldown) return;

    const bullets = this.scene.bullets?.list || [];

    for (const b of bullets) {
      if (!b.active) continue;

      const dx = b.sprite.x - this.x;
      const dy = b.sprite.y - this.y;

      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 35) {
        this.dodgeCooldownTimer = 0;

        const dir = dx > 0 ? -1 : 1;

        this.vx += dir * 2.2; // ↓ réduit (3.5 → 2.2)
        this.vy -= 0.8; // ↓ réduit aussi

        break;
      }
    }
  }

  // =====================
  // PATTERN 1
  // =====================
  spikeBurst() {
    const count = 10;
    const speed = 3.2;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;

      const b = new EnemyBullet(this.scene, this.x, this.y);
      b.vx = Math.cos(angle) * speed;
      b.vy = Math.sin(angle) * speed;

      this.scene.enemyBullets.push(b);
    }
  }

  // =====================
  // PATTERN 2
  // =====================
  crossBurst() {
    const speed = 4;

    const dirs = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];

    for (const [vx, vy] of dirs) {
      const b = new EnemyBullet(this.scene, this.x, this.y);
      b.vx = vx * speed;
      b.vy = vy * speed;

      this.scene.enemyBullets.push(b);
    }
  }

  // =====================
  // PATTERN 3 (FIXED ANGLE)
  // =====================
  aimedBurst() {
    const player = this.scene.player.sprite;
    const speed = 4.2;

    const baseAngle = Math.atan2(player.y - this.y, player.x - this.x);

    for (let i = -1; i <= 1; i++) {
      const angle = baseAngle + i * 0.25;

      const b = new EnemyBullet(this.scene, this.x, this.y);
      b.vx = Math.cos(angle) * speed;
      b.vy = Math.sin(angle) * speed;

      this.scene.enemyBullets.push(b);
    }
  }

  // =====================
  // SINGLE SHOT
  // =====================
  aimedShot() {
    const player = this.scene.player.sprite;

    const dx = player.x - this.x;
    const dy = player.y - this.y;

    const len = Math.sqrt(dx * dx + dy * dy) || 1;

    const speed = 3.5;

    const b = new EnemyBullet(this.scene, this.x, this.y);
    b.vx = (dx / len) * speed;
    b.vy = (dy / len) * speed;

    this.scene.enemyBullets.push(b);
  }

  // =====================
  // HP
  // =====================
  damage(amount = 1) {
    if (!this.active) return;

    this.hp -= amount;
    this.scene.effects?.flashHit(this.sprite);

    this.tryDrop();

    if (this.hp <= 0) {
      this.destroy?.();

      this.scene.score = (this.scene.score || 0) + 1500;
      this.scene.scoreText?.setText(`Score : ${this.scene.score}`);

      this.scene.endMidBoss?.();
    }
  }

  updateHpBar() {
    const ratio = this.hp / this.maxHp;

    this.hpBar.width = 220 * ratio;
    this.hpBar.x = 400 - (220 * (1 - ratio)) / 2;
  }

  // =====================
  // DROPS
  // =====================
  tryDrop() {
    if (this.dropTimer < this.dropCooldown) return;

    const r = Math.random();

    // très faible chance globale
    if (r < 0.8) return;

    this.dropTimer = 0;

    let type = null;

    const roll = Math.random();

    if (roll < 0.7) type = "score";
    else if (roll < 0.9) type = "heal";
    else type = "power";

    this.spawnDrop(type);
  }

  spawnDrop(type) {
    const drop = new PowerUp(this.scene, this.x, this.y, type);

    this.scene.powerUps.push(drop);
  }

  // =====================
  // DESTROY
  // =====================
  destroy() {
    this.active = false;

    this.sprite.destroy();
    this.hpBar.destroy();
    this.hpBarBg.destroy();

    this.scene.score += 1500;
    this.scene.scoreText?.setText(`Score : ${this.scene.score}`);

    this.scene.ui?.spawnScorePopup(this.x, this.y, 1500);
  }
}
