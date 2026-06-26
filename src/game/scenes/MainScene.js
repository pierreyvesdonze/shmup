import Phaser from "phaser";
import Player from "../entities/Player.js";
import EnemySpawner from "../systems/EnemySpawner.js";
import BulletPool from "../systems/BulletPool.js";
import LevelSystem from "../systems/LevelSystem.js";
import CollisionSystem from "../systems/CollisionSystem.js";
import MidBoss from "../entities/MidBoss.js";
import BossFinal from "../entities/BossFinal.js";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  preload() {
    this.load.image("player", "public/assets/images/player.png");
    this.load.image("enemy", "public/assets/images/enemy.png");
    this.load.image("tank", "public/assets/images/tank.png");
    this.load.image("rush", "public/assets/images/rush.png");
    this.load.image("midboss", "public/assets/images/midboss.png");
    this.load.image("bossfinal", "public/assets/images/bossfinal.png");
    //this.load.image("bullet", "src/assets/images/bullet.png");
  }

  create() {
    // =====================
    // BACKGROUND ÉTOILES
    // =====================
    this.starLayers = [];

    const layerConfigs = [
      { count: 60, speed: 0.3, size: 1, alpha: 0.3 },
      { count: 40, speed: 0.7, size: 1.5, alpha: 0.6 },
      { count: 20, speed: 1.4, size: 2, alpha: 0.9 },
    ];

    for (const cfg of layerConfigs) {
      const stars = [];
      for (let i = 0; i < cfg.count; i++) {
        const x = Math.random() * 800;
        const y = Math.random() * 600;
        const star = this.add.rectangle(x, y, cfg.size, cfg.size, 0xffffff);
        star.setAlpha(cfg.alpha);
        star._speed = cfg.speed;
        stars.push(star);
      }
      this.starLayers.push(stars);
    }

    this.cursors = this.input.keyboard.createCursorKeys();

    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );

    // Enlève le curseur de la souris pour un jeu plus immersif
    this.input.setDefaultCursor("none");

    // =====================
    // SYSTEMS
    // =====================
    this.levelSystem = new LevelSystem(this);
    this.collisionSystem = new CollisionSystem();

    // =====================
    // PLAYER
    // =====================
    this.player = new Player(this, 400, 500);
    this.playerHP = 5;
    this.invincible = false;

    this.playerPowerLevel = 1;
    this.playerKills = 0;

    // =====================
    // POWER UPS
    // =====================
    this.powerUps = [];

    // =====================
    // DROP SYSTEM
    // =====================
    this.killsWithoutDrop = 0;

    // =====================
    // HEAT SYSTEM
    // =====================
    this.weaponHeat = 0;
    this.maxHeat = 100;

    this.overheated = false;
    this.heatCooldownTimer = 0;

    // =====================
    // BULLETS
    // =====================
    this.bullets = new BulletPool(this, 30);

    // =====================
    // ENEMIES
    // =====================
    this.enemies = [];
    this.enemyBullets = [];
    this.spawner = new EnemySpawner(this);
    this.midBoss = null;
    this.inMidBoss = false;
    this.bossFinal = null;
    this.inBossFinal = false;

    // =====================
    // SHOOT SYSTEM
    // =====================
    this.shootTimer = 0;
    this.shootCooldown = 150;

    // =====================
    // SUPER SHOOT (CONTROL)
    // =====================
    this.superKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.A,
    );

    this.superTimer = 0;
    this.superCooldown = 800;

    // =====================
    // SCORE
    // =====================
    this.score = 0;

    // =====================
    // UI
    // =====================
    this.hpHearts = [];
    for (let i = 0; i < 5; i++) {
      const heart = this.add.text(14 + i * 22, 35, "♥", {
        fontSize: "20px",
        color: "#ff4444",
      });
      this.hpHearts.push(heart);
    }

    this.powerBars = [];
    for (let i = 0; i < 3; i++) {
      const bar = this.add
        .rectangle(14 + i * 16, 58, 12, 18, 0xffffff15)
        .setOrigin(0, 0);
      this.powerBars.push(bar);
    }

    this.levelText = this.add.text(14, 12, "LEVEL 1", {
      fontSize: "13px",
      color: "#ffffff55",
      fontFamily: "monospace",
    });

    this.killsBarBg = this.add
      .rectangle(14, 30, 110, 7, 0xffffff15)
      .setOrigin(0, 0.5);
    this.killsBar = this.add
      .rectangle(14, 30, 110, 7, 0x9900ff)
      .setOrigin(0, 0.5);

    this.scoreText = this.add
      .text(658, 12, "000000", {
        fontSize: "16px",
        color: "#ffffff",
        fontFamily: "monospace",
      })
      .setOrigin(1, 0);

    this.heatBarBg = this.add.rectangle(700, 20, 100, 10, 0x333333);
    this.heatBar = this.add.rectangle(700, 20, 100, 10, 0x00ffff);

    // =====================
    // DEBUG KEYS
    // =====================
    this.debugKeys = this.input.keyboard.addKeys({
      level1: Phaser.Input.Keyboard.KeyCodes.ONE,
      level2: Phaser.Input.Keyboard.KeyCodes.TWO,
      level3: Phaser.Input.Keyboard.KeyCodes.THREE,
      level4: Phaser.Input.Keyboard.KeyCodes.FOUR,
      level5: Phaser.Input.Keyboard.KeyCodes.FIVE,
      level6: Phaser.Input.Keyboard.KeyCodes.SIX,
      level7: Phaser.Input.Keyboard.KeyCodes.SEVEN,
      level8: Phaser.Input.Keyboard.KeyCodes.EIGHT,
      level9: Phaser.Input.Keyboard.KeyCodes.NINE,
      level10: Phaser.Input.Keyboard.KeyCodes.ZERO,
    });

    this.midBossKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.M,
    );

    this.bossFinalKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.B,
    );

    this.godKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);

    this.debugMode = true;
  }

  update(time, delta) {
    // BACKGROUND ÉTOILES
    for (const layer of this.starLayers) {
      for (const star of layer) {
        star.y += star._speed;
        if (star.y > 610) {
          star.y = -5;
          star.x = Math.random() * 800;
        }
      }
    }

    this.player.update(this.cursors);

    this.handleDebugCheats();

    // =====================
    // NORMAL GAMEPLAY
    // =====================
    this.levelSystem.update?.(delta);

    this.spawner.update(time, delta, this.enemies);

    for (const enemy of this.enemies) {
      enemy.update(delta);
    }

    this.enemies = this.enemies.filter((e) => !e._dead);

    // HEAT SYSTEM
    if (this.overheated) {
      this.heatCooldownTimer -= delta;
      if (this.heatCooldownTimer <= 0) this.overheated = false;
    } else {
      this.weaponHeat -= 0.4 * (delta / 16);
      if (this.weaponHeat < 0) this.weaponHeat = 0;
    }

    // =====================
    // BULLETS (PLAYER + ENEMY)
    // =====================
    this.bullets.update();

    for (const bullet of this.enemyBullets) {
      bullet.update(delta);
    }

    this.enemyBullets = this.enemyBullets.filter((b) => b.active);

    // =====================
    // SHOOT PLAYER
    // =====================
    this.shootTimer += delta;

    const x = this.player.sprite.x;
    const y = this.player.sprite.y - 25;

    if (
      this.spaceKey.isDown &&
      this.shootTimer >= this.shootCooldown &&
      !this.overheated
    ) {
      this.shootTimer = 0;
      this.weaponHeat += 6;

      const level = this.playerPowerLevel;

      if (level === 1) this.bullets.fire(x, y);

      if (level === 2) {
        this.bullets.fire(x - 10, y);
        this.bullets.fire(x + 10, y);
      }

      if (level === 3) {
        this.bullets.fire(x, y);
        this.bullets.fire(x - 15, y);
        this.bullets.fire(x + 15, y);
      }

      if (level === 4) {
        this.bullets.fire(x, y);
        this.bullets.fire(x - 20, y);
        this.bullets.fire(x + 20, y);
        this.shootCooldown = 100;
      }

      if (this.weaponHeat >= this.maxHeat) {
        this.overheated = true;
        this.heatCooldownTimer = 2000;
      }
    }

    // SUPER SHOOT
    this.superTimer += delta;

    if (this.superKey.isDown && this.superTimer >= this.superCooldown) {
      this.superTimer = 0;
      this.superShoot();
    }

    // POWERUPS
    this.checkPowerUps();

    for (const pu of this.powerUps) pu.update();
    this.powerUps = this.powerUps.filter((p) => p.active);

    // COLLISIONS
    this.collisionSystem.check(this.enemies, this.bullets.list, this);

    this.checkEnemyCollision();
    this.checkPlayerHit();

    // =====================
    // MID BOSS MODE PRIORITY
    // =====================
    if (this.inMidBoss && this.midBoss) {
      this.midBoss.update(delta);

      // =====================
      // PLAYER GAMEPLAY (OBLIGATOIRE)
      // =====================
      this.bullets.update(); // tes tirs doivent continuer
      this.checkPlayerHit(); // collisions joueur OK

      // =====================
      // ENEMY BULLETS
      // =====================
      for (const bullet of this.enemyBullets) {
        bullet.update(delta);
      }
      this.enemyBullets = this.enemyBullets.filter((b) => b.active);

      // =====================
      // 🔥 IMPORTANT MANQUANT : COLLISION PLAYER → MIDBOSS
      // =====================
      this.checkMidBossHit?.();
    }

    // =====================
    // BOSS FINAL MODE PRIORITY
    // =====================
    if (this.inBossFinal && this.bossFinal) {
      this.bossFinal.update(delta);
      this.checkBossFinalHit();
      this.checkPlayerHit();
    }

    // UI
    const p = this.levelSystem.getProgress();
    this.levelText.setText(`LEVEL ${p.level}  —  ${p.kills} / ${p.target}`);
    const ratio = Math.min(1, p.kills / p.target);
    this.killsBar.width = 110 * ratio;

    for (let i = 0; i < this.hpHearts.length; i++) {
      this.hpHearts[i].setColor(i < this.playerHP ? "#ff4444" : "#333333");
    }

    for (let i = 0; i < this.powerBars.length; i++) {
      this.powerBars[i].fillColor =
        i < this.playerPowerLevel ? 0x00ffcc : 0xffffff15;
    }

    const heatPercent = this.weaponHeat / this.maxHeat;

    this.heatBar.width = 100 * (1 - heatPercent);

    if (heatPercent < 0.5) {
      this.heatBar.fillColor = 0x00ffff;
    } else if (heatPercent < 0.8) {
      this.heatBar.fillColor = 0xffaa00;
    } else {
      this.heatBar.fillColor = 0xff0000;
    }

    // SCORE
    this.scoreText.setText(String(this.score).padStart(6, "0"));

    // CHEAT / BOSSES TRIGGER
    if (this.debugMode && this.godKey.isDown) {
      console.log("GOD MODE ACTIVATED");

      this.invincible = true;
    }

    if (this.debugMode && Phaser.Input.Keyboard.JustDown(this.midBossKey)) {
      if (!this.midBoss) this.startMidBoss();
    }

    if (this.debugMode && Phaser.Input.Keyboard.JustDown(this.bossFinalKey)) {
      if (!this.bossFinal) this.startBossFinal();
    }
  }

  // =====================
  // LEVEL BANNER
  // =====================
  showLevelBanner(text) {
    const banner = this.add
      .text(400, 280, text, {
        fontSize: "48px",
        color: "#ffffff",
        fontFamily: "monospace",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: banner,
      alpha: { from: 0, to: 1 },
      duration: 300,
      yoyo: true,
      hold: 800,
      ease: "Power2",
      onComplete: () => banner.destroy(),
    });
  }

  // =====================
  // SUPER SHOOT
  // =====================
  superShoot() {
    const x = this.player.sprite.x;
    const y = this.player.sprite.y - 25;

    const spread = 15;

    this.bullets.fire(x, y);
    this.bullets.fire(x - spread, y);
    this.bullets.fire(x + spread, y);
  }

  handleDebugCheats() {
    if (!this.debugMode) return;

    if (this.debugKeys.level1.isDown) this.resetForLevel(1);
    if (this.debugKeys.level2.isDown) this.resetForLevel(2);
    if (this.debugKeys.level3.isDown) this.resetForLevel(3);
    if (this.debugKeys.level4.isDown) this.resetForLevel(4);
    if (this.debugKeys.level5.isDown) this.resetForLevel(5);
    if (this.debugKeys.level6.isDown) this.resetForLevel(6);
    if (this.debugKeys.level7.isDown) this.resetForLevel(7);
    if (this.debugKeys.level8.isDown) this.resetForLevel(8);
    if (this.debugKeys.level9.isDown) this.resetForLevel(9);
    if (this.debugKeys.level10.isDown) this.resetForLevel(10);
  }

  resetForLevel(level) {
    this.levelSystem.setLevel(level);

    this.playerKills = 0;

    // ENEMIES
    for (const e of this.enemies) {
      e.alive = false;
      e._dead = true;
      e.sprite?.destroy();
    }
    this.enemies.length = 0;

    // BULLETS ENEMIES
    for (const b of this.enemyBullets) {
      b.active = false;
      b.sprite?.destroy();
    }
    this.enemyBullets.length = 0;

    // POWERUPS
    for (const p of this.powerUps) {
      p.active = false;
      p.sprite?.destroy();
    }
    this.powerUps.length = 0;

    // PLAYER BULLETS
    for (const b of this.bullets.list) {
      b.active = false;
      b.sprite.setVisible(false);
    }

    // HEAT RESET
    this.weaponHeat = 0;
    this.overheated = false;
    this.heatCooldownTimer = 0;

    // SPAWNER RESET
    this.spawner?.reset?.();

    console.log("DEBUG RESET LEVEL =", level);
  }

  checkEnemyCollision() {
    if (this.invincible) return;

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;

      const dx = enemy.sprite.x - this.player.sprite.x;
      const dy = enemy.sprite.y - this.player.sprite.y;

      if (Math.sqrt(dx * dx + dy * dy) < 25) {
        this.playerHit();
        break;
      }
    }
  }

  checkPlayerHit() {
    if (this.invincible) return;

    for (const bullet of this.enemyBullets) {
      if (!bullet.active) continue;

      const dx = bullet.sprite.x - this.player.sprite.x;
      const dy = bullet.sprite.y - this.player.sprite.y;

      if (Math.sqrt(dx * dx + dy * dy) < 20) {
        this.playerHit();
        bullet.destroy();
        break;
      }
    }
  }

  checkMidBossHit() {
    if (!this.midBoss) return;

    for (const bullet of this.bullets.list) {
      if (!bullet.active) continue;

      const dx = bullet.sprite.x - this.midBoss.sprite.x;
      const dy = bullet.sprite.y - this.midBoss.sprite.y;

      if (Math.sqrt(dx * dx + dy * dy) < 35) {
        this.midBoss?.damage?.(1);
        bullet.kill?.();
        break;
      }
    }
  }

  checkBossFinalHit() {
    if (!this.bossFinal) return;

    for (const bullet of this.bullets.list) {
      if (!bullet.active) continue;

      const dx = bullet.sprite.x - this.bossFinal.x;
      const dy = bullet.sprite.y - this.bossFinal.y;

      if (Math.sqrt(dx * dx + dy * dy) < 40) {
        this.bossFinal.damage(1);
        bullet.kill?.();
        break;
      }
    }
  }

  checkPowerUps() {
    for (const pu of this.powerUps) {
      if (!pu.active) continue;

      const dx = pu.sprite.x - this.player.sprite.x;
      const dy = pu.sprite.y - this.player.sprite.y;

      if (Math.sqrt(dx * dx + dy * dy) < 30) {
        this.applyPowerUp(pu);
        pu.destroy();
      }
    }

    this.powerUps = this.powerUps.filter((p) => p.active);
  }

  applyPowerUp(pu) {
    if (pu.type === "power") {
      this.playerPowerLevel = Math.min(4, this.playerPowerLevel + 1);
    }

    if (pu.type === "heal") {
      this.playerHP = Math.min(5, this.playerHP + 1);
    }

    if (pu.type === "score") {
      const gained = 100;
      this.score += gained;

      if (pu.type === "score") {
        this.scoreText?.setText(`Score : ${this.score}`);

        this.spawnScorePopup(pu.sprite.x, pu.sprite.y, gained);
      }
    }
  }

  getDrop() {
    const r = Math.random();

    if (r < 0.85) return null;
    if (r < 0.93) return "score";
    if (r < 0.97) return "heal";
    return "power";
  }

  onEnemyKilled(enemy) {
    this.levelSystem.addKill();

    this.score += 20;

    // feedback visuel optionnel
    this.showScorePopup?.(20, enemy.sprite.x, enemy.sprite.y);
  }

  playerHit() {
    this.playerHP--;

    this.invincible = true;

    this.playerPowerLevel = 1;
    this.shootCooldown = 150;
    this.playerKills = 0;

    this.superTimer = 0;

    this.cameras.main.resetFX();
    this.cameras.main.flash(150, 255, 0, 0);
    this.cameras.main.shake(100, 0.02);

    let elapsed = 0;

    if (this.playerBlinkEvent) {
      this.playerBlinkEvent.remove();
    }

    this.playerBlinkEvent = this.time.addEvent({
      delay: 150,
      loop: true,
      callback: () => {
        this.player.sprite.visible = !this.player.sprite.visible;

        elapsed += 150;

        if (elapsed >= 2000) {
          this.player.sprite.visible = true;
          this.invincible = false;

          this.playerBlinkEvent.remove();
          this.playerBlinkEvent = null;
        }
      },
    });

    if (this.playerHP <= 0) {
      this.time.delayedCall(200, () => {
        this.gameOver();
      });
    }
  }

  // =====================
  // SCORE POPUP
  // =====================
  spawnScorePopup(x, y, value) {
    const text = this.add.text(x, y, `+${value}`, {
      fontSize: "16px",
      color: "#ffff00",
      fontStyle: "bold",
    });

    text.setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: y - 30,
      alpha: 0,
      duration: 500,
      ease: "Power1",
      onComplete: () => {
        text.destroy();
      },
    });
  }

  // =====================
  // MID BOSS
  // =====================
  startMidBoss() {
    this.showLevelBanner("— MID BOSS —");

    this.midBossActive = true;
    this.inMidBoss = true;

    // Pause du spawn normal
    this.spawner.pause = true;

    // Nettoyage des ennemis
    for (const enemy of this.enemies) {
      enemy.destroy();
    }

    this.enemies = [];

    // Nettoyage des bullets ennemies
    for (const bullet of this.enemyBullets) {
      bullet.destroy();
    }

    this.enemyBullets = [];

    // Apparition du boss
    this.midBoss = new MidBoss(this);
  }

  endMidBoss() {
    // Suppression de la référence
    this.midBoss = null;
    this.inMidBoss = false;
    this.midBossActive = false;

    // Reprise du jeu normal
    this.spawner.pause = false;

    // Passage au niveau suivant
    this.levelSystem.setLevel(5);
  }

  // =====================
  // BOSS FINAL
  // =====================
  startBossFinal() {
    this.showLevelBanner("— FINAL BOSS —");

    this.inBossFinal = true;

    // stop spawns
    this.spawner.pause = true;

    // clear enemies
    this.enemies.forEach((e) => e.destroy());
    this.enemies = [];

    // clear bullets
    this.enemyBullets.forEach((b) => b.destroy());
    this.enemyBullets = [];

    // spawn boss
    this.bossFinal = new BossFinal(this);
  }

  gameOver() {
    this.player.sprite.visible = false;

    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);

    this.add.text(240, 250, "GAME OVER", {
      fontSize: "48px",
      fontFamily: "orbitron",
      color: "#ffffff",
    });

    this.add.text(240, 320, "F5 TO RESTART", {
      fontSize: "48px",
      fontFamily: "orbitron",
      color: "#ffbb00",
    });

    this.scene.pause();
  }

  youWin() {
    this.player.sprite.visible = false;

    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);

    this.add
      .text(400, 250, "YOU WIN", {
        fontSize: "64px",
        color: "#00ffcc",
      })
      .setOrigin(0.5);

    this.add
      .text(400, 330, `Score : ${this.score}`, {
        fontSize: "32px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.scene.pause();
  }
}
