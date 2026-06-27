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

    const l = Math.min(level, 7);
    return {
      spawnRate: 1 + l * 0.065,
      density: 1 + l * 0.095,
      speed: 1 + l * 0.075,
      chaos: Math.min(0.55, l * 0.065),
      tankChance: Math.min(0.23, l * 0.038),
      rushChance: Math.min(0.32, l * 0.048),
    };
  }

  getEnemyConfig() {
    const level = this.level;

    return {
      // 🧠 cadence globale (IMPORTANT: pas trop agressif)
      shootCooldown: Math.max(600, 1300 - level * 60),

      // 🎯 chance contrôlée (évite saturation)
      shootChance: Math.min(0.75, 0.25 + level * 0.05),

      // 💥 vitesse bullet (C’EST LE POINT CRITIQUE)
      bulletSpeed: 2.8 + level * 0.35,

      // 🔫 nombre de tirs (plafonné volontairement)
      bulletCountBonus: Math.min(2, Math.floor(level / 4)),

      // 🎯 aim chance progressive
      aimChance: Math.min(0.5, level * 0.05),
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

    if (this.level === 5 && this.scene?.startMidBoss) {
      this.scene.startMidBoss();
      return;
    }

    if (this.level === 10 && this.scene?.startBossFinal) {
      this.locked = true;
      this.scene.startBossFinal();
      return;
    }

    this.scene.ui?.showLevelBanner?.(`LEVEL ${this.level}`);
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
