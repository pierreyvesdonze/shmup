import BackgroundManager from "../systems/BackgroundManager.js";
import UIManager from "../systems/UIManager.js";
import InputHandler from "../systems/InputHandler.js";
import Phaser from "phaser";
import Player from "../entities/Player.js";
import EnemySpawner from "../systems/EnemySpawner.js";
import ShootingSystem from "../systems/ShootingSystem.js";
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
    this.load.image("player", "assets/images/player.png");
    this.load.image("enemy", "assets/images/enemy.png");
    this.load.image("tank", "assets/images/tank.png");
    this.load.image("rush", "assets/images/rush.png");
    this.load.image("midboss", "assets/images/midboss.png");
    this.load.image("bossfinal", "assets/images/bossfinal.png");
    //this.load.image("bullet", "assets/images/bullet.png");
  }

  create() {
    // =====================
    // BACKGROUND ÉTOILES
    // =====================
    this.background = new BackgroundManager(this);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );

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
    this.shooting = new ShootingSystem(this);

    // =====================
    // SUPER SHOOT (CONTROL)
    // =====================
    this.superKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.A,
    );

    // =====================
    // SCORE
    // =====================
    this.score = 0;

    // =====================
    // UI
    // =====================
    this.ui = new UIManager(this);

    // Enlève le curseur de la souris pour un jeu plus immersif
    this.input.setDefaultCursor("none");

    // =====================
    // DEBUG KEYS
    // =====================
    this.input.setDefaultCursor("none");
    this.inputHandler = new InputHandler(this);
    this.cursors = this.inputHandler.cursors;
    this.spaceKey = this.inputHandler.spaceKey;
    this.superKey = this.inputHandler.superKey;

    this.debugMode = true;
  }

  update(time, delta) {
    // BACKGROUND ÉTOILES
    this.background.update();

    // PLAYER
    this.player.update(this.cursors);

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
    this.shooting.update(delta, this.spaceKey, this.superKey);

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
    this.ui.update({
      hp: this.playerHP,
      powerLevel: this.playerPowerLevel,
      score: this.score,
      heat: this.weaponHeat,
      maxHeat: this.maxHeat,
      kills: p.kills,
      target: p.target,
      level: p.level,
    });

    if (this.inMidBoss && this.midBoss) {
      this.ui.updateBossBar(this.midBoss.hp, this.midBoss.maxHp);
    }

    // CHEAT / BOSSES TRIGGER
    this.inputHandler.handleDebugCheats(this.debugMode, (l) =>
      this.resetForLevel(l),
    );
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
        this.ui.spawnScorePopup(pu.sprite.x, pu.sprite.y, gained);
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
    this.shooting.resetCooldown();
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
  // MID BOSS
  // =====================
  startMidBoss() {
    this.ui.showLevelBanner("— MID BOSS —");

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
    this.ui.showLevelBanner("— FINAL BOSS —");

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
