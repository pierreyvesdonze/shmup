import { LEVELS } from "../config/LevelConfig.js";

export default class LevelSystem {
  constructor(scene) {
    this.scene = scene;

    this.level = 1;
    this.kills = 0;
    this.killsToNextLevel = 40;

    this.locked = false;
  }

  getConfig() {
    const level = this.level;

    const l = Math.min(level, 7); // 🔥 CAP GLOBAL

    return {
      spawnRate: 1 + l * 0.07,
      density: 1 + l * 0.1,
      speed: 1 + l * 0.08,
      chaos: Math.min(0.6, l * 0.07),
      tankChance: Math.min(0.25, l * 0.04),
      rushChance: Math.min(0.35, l * 0.05),
    };
  }

  getEnemyConfig() {
    const level = this.level;

    return {
      // 🧠 cadence globale (IMPORTANT: pas trop agressif)
      shootCooldown: Math.max(550, 1200 - level * 60),

      // 🎯 chance contrôlée (évite saturation)
      shootChance: Math.min(0.75, 0.25 + level * 0.05),

      // 💥 vitesse bullet (C’EST LE POINT CRITIQUE)
      bulletSpeed: 3 + level * 0.4,

      // 🔫 nombre de tirs (plafonné volontairement)
      bulletCountBonus: Math.min(2, Math.floor(level / 4)),

      // 🎯 aim chance progressive
      aimChance: Math.min(0.6, level * 0.06),
    };
  }

  getCombatConfig() {
    const level = this.level;

    return {
      // fréquence de tir ennemie (plus bas = plus de tirs)
      shootCooldown: Math.max(400, 1400 - level * 140),

      // chance de tirer par cycle
      shootChance: Math.min(0.95, 0.25 + level * 0.07),

      // vitesse des bullets ennemies
      bulletSpeed: 2 + level * 0.25,

      // nombre de directions possibles
      bulletSpread: Math.min(5, 1 + Math.floor(level / 2)),
    };
  }

  addKill() {
    if (this.locked) return;

    this.kills++;

    if (this.kills >= this.killsToNextLevel) {
      this.levelUp();
    }
  }

  levelUp() {
    this.level++;
    this.kills = 0;
    this.killsToNextLevel = Math.floor(this.killsToNextLevel * 1.15);
    this.updateDifficulty();

    this.scene.ui?.showLevelBanner?.(`LEVEL ${this.level}`);

    if (this.level === 5 && this.scene?.startMidBoss) {
      this.scene.startMidBoss();
      return;
    }

    if (this.level === 10 && this.scene?.startBossFinal) {
      this.locked = true;
      this.scene.startBossFinal();
      return;
    }
  }

  setLevel(level) {
    this.level = level;
    this.kills = 0;

    this.updateDifficulty?.();
  }

  getProgress() {
    return {
      level: this.level,
      kills: this.kills,
      target: this.killsToNextLevel,
    };
  }

  getLevel() {
    return this.level;
  }

  getSpawnRateMultiplier() {
    return this.spawnRateMultiplier;
  }

  updateDifficulty() {
    this.difficultyMultiplier =
      (0.9 + Math.pow(this.level, 1.15) * 0.06) * 0.88;

    this.spawnRateMultiplier = (1 + (this.level - 1) * 0.12) * 0.88;
  }
}
