import EnemyBullet from "./EnemyBullet.js";
import PowerUp from "./PowerUp.js";

export default class Enemy {
  constructor(scene, x, y, type = "normal") {
    this.scene = scene;
    this.type = type;

    // =====================
    // STATE
    // =====================
    this.alive = true;
    this._dead = false;

    // =====================
    // VISUAL
    // =====================
    let color = 0xff0000;
    if (type === "rush") color = 0xff8800;
    if (type === "tank") color = 0x00ffff;

    this.sprite = scene.add.sprite(x, y, "enemy");

    if (type === "tank") {
      this.sprite = scene.add.sprite(x, y, "tank");
    }

    if (type === "rush") {
      this.sprite = scene.add.sprite(x, y, "rush");
    }

    // =====================
    // MOVEMENT
    // =====================
    this.baseSpeed = 2 + Math.random() * 1.2;
    this.speedY = this.baseSpeed;

    this.baseX = x;
    this.timer = 0;

    this.zigzag = type === "zigzag";
    this.amplitude = this.zigzag ? Math.random() * 50 + 30 : 0;

    // =====================
    // STATS
    // =====================
    this.hp = type === "tank" ? 2 : 1;

    // =====================
    // SHOOTING CONFIG (FIXED)
    // =====================
    const level = scene.levelSystem.getLevel();

    // 🔻 chance globale de tirs
    this.fireChance = 0.4;

    // cooldown plus long + scaling propre
    this.shootCooldown = (1400 + Math.random() * 900) / (1 + level * 0.08);

    // aim scaling propre
    this.aimChance = Math.min(0.75, 0.2 + level * 0.05);

    // nombre de bullets limité
    this.bulletCount = 1 + Math.floor(level / 6);

    this.shootTimer = 0;

    // =====================
    // TANK BEHAVIOR STATE
    // =====================
    this.tankState = "approach";

    this.tankTimer = 0;
    this.tankActionCooldown = 900 + Math.random() * 600;

    // 🔥 burst vertical
    this.tankBurstTimer = 0;
    this.tankBurstCooldown = 2500 + Math.random() * 1500;

    this.bursting = false;
  }

  // =====================
  // UPDATE
  // =====================
  update(delta) {
    if (!this.alive) return;

    this.timer += delta * 0.01;

    this.sprite.y += this.speedY;

    if (this.zigzag) {
      this.sprite.x = this.baseX + Math.sin(this.timer) * this.amplitude;
    }

    if (this.sprite.y > 650) {
      this.destroy();
      return;
    }

    // =====================
    // SHOOT SYSTEM FIXED
    // =====================
    this.shootTimer += delta;

    if (this.shootTimer >= this.shootCooldown) {
      this.shootTimer = 0;

      // 🔻 -30% global control ici
      if (Math.random() < this.fireChance) {
        this.shoot();
      }
    }

    // =====================
    // TANK BEHAVIOR
    // =====================
    if (this.type === "tank") {
      this.tankTimer += delta;
      this.tankBurstTimer += delta;

      const player = this.scene.player.sprite;

      // =====================
      // BURST MODE (accélération + recul fort)
      // =====================
      if (this.tankBurstTimer >= this.tankBurstCooldown) {
        this.tankBurstTimer = 0;
        this.bursting = true;

        // choix du burst
        const r = Math.random();

        if (r < 0.5) {
          this.tankState = "align";
        } else {
          this.tankState = "retreat";
        }

        // burst court
        this.timeInBurst = 400;
      }

      if (this.bursting) {
        this.timeInBurst -= delta;

        // 🔥 mouvement rapide vers le haut (vrai recul)
        this.sprite.y -= 4.5;

        if (this.timeInBurst <= 0) {
          this.bursting = false;
        }
      }

      // =====================
      // NORMAL STATE CYCLE
      // =====================
      if (!this.bursting && this.tankTimer >= this.tankActionCooldown) {
        this.tankTimer = 0;

        const r = Math.random();

        if (r < 0.45) this.tankState = "align";
        else if (r < 0.75) this.tankState = "retreat";
        else this.tankState = "shoot";
      }

      // =====================
      // ALIGN (tracking joueur)
      // =====================
      if (!this.bursting && this.tankState === "align") {
        const dx = player.x - this.sprite.x;
        this.sprite.x += dx * 0.04; // plus agressif mais lisible
      }

      // =====================
      // RETREAT (léger recul normal)
      // =====================
      if (!this.bursting && this.tankState === "retreat") {
        this.sprite.y -= 1.2;
      }
    }
  }

  // =====================
  // SHOOT
  // =====================
  shoot() {
    const player = this.scene.player.sprite;

    const x = this.sprite.x;
    const y = this.sprite.y + 20;

    const level = this.scene.levelSystem.getLevel();

    // 🔥 bullets 50–70% plus rapides (stable)
    const baseSpeed = 4 + level * 0.25;

    const isAiming = Math.random() < this.aimChance;

    // =====================
    // NORMAL / ZIGZAG
    // =====================
    if (this.type === "normal" || this.type === "zigzag") {
      const bullet = new EnemyBullet(this.scene, x, y);

      if (isAiming) {
        const dx = player.x - x;
        const dy = player.y - y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;

        bullet.vx = (dx / len) * baseSpeed;
        bullet.vy = (dy / len) * baseSpeed;
      } else {
        bullet.vx = 0;
        bullet.vy = baseSpeed;
      }

      this.scene.enemyBullets.push(bullet);
    }

    // =====================
    // RUSH
    // =====================
    if (this.type === "rush") {
      const bullet = new EnemyBullet(this.scene, x, y);

      const dx = player.x - x;
      const dy = player.y - y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;

      const speed = baseSpeed + 3;

      bullet.vx = (dx / len) * speed;
      bullet.vy = (dy / len) * speed;

      this.scene.enemyBullets.push(bullet);
    }

    // =====================
    // TANK → CONTROLLED BUT ALWAYS FUNCTIONAL
    // =====================
    if (this.type === "tank") {
      const count = 3;

      const spread = 0.8;
      const start = -spread / 2;
      const step = spread / (count - 1);

      const baseSpeed = 4 + level * 0.2;

      for (let i = 0; i < count; i++) {
        const angle = start + step * i;

        const bullet = new EnemyBullet(this.scene, x, y);

        bullet.vx = Math.sin(angle) * baseSpeed;
        bullet.vy = Math.cos(angle) * baseSpeed;

        this.scene.enemyBullets.push(bullet);
      }

      this.tankState = "approach";
    }
  }

  // =====================
  // DAMAGE + DROP
  // =====================
  damage(amount = 1) {
    if (!this.alive) return false;

    this.hp -= amount;

    if (this.hp <= 0) {
      this.alive = false;
      this._dead = true;

      this.sprite.destroy();

      // =====================
      // SCORE BY TYPE
      // =====================
      let score = 10;

      if (this.type === "rush") score = 20;
      if (this.type === "tank") score = 30;

      this.scene.score = (this.scene.score || 0) + score;
      this.scene.scoreText?.setText(`Score : ${this.scene.score}`);

      // 👇 POP UI
      this.scene.spawnScorePopup(this.sprite.x, this.sprite.y, score);

      // =====================
      // DROP
      // =====================
      const drop = this.scene.getDrop?.();

      if (drop) {
        this.scene.powerUps.push(
          new PowerUp(this.scene, this.sprite.x, this.sprite.y, drop),
        );
      }

      return true;
    }

    return false;
  }

  // =====================
  // DESTROY
  // =====================
  destroy() {
    if (!this.alive) return;

    this.alive = false;
    this._dead = true;

    if (this.sprite) {
      this.sprite.destroy();
    }
  }
}
