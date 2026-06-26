import Enemy from "../entities/Enemy.js";

export default class EnemySpawner {
  constructor(scene) {
    this.scene = scene;

    // timers spawn
    this.spawnTimer = 0;
    this.baseSpawnDelay = 800;

    // wave system
    this.waveTimer = 0;
    this.waveCooldown = 0;
    this.waveInterval = 5000;
  }

  update(time, delta, enemies) {
    if (this.pause) return;

    if (this.scene.midBossActive) return;

    this.timer += delta;

    const cfg = this.scene.levelSystem.getConfig();

    const spawnInterval = 800 / cfg.spawnRate;

    if (this.timer < spawnInterval) return;

    this.timer = 0;

    const clusterSize = Math.floor(1 + Math.random() * cfg.density);

    for (let i = 0; i < clusterSize; i++) {
      this.spawnChaoticEnemy(cfg, enemies);
    }
  }

  spawnChaoticEnemy(cfg, enemies) {
    const x = Math.random() * 800;
    const y = -40;

    // base type random MAIS pondéré par niveau
    const r = Math.random();

    let type = "normal";

    if (r < cfg.tankChance) {
      type = "tank";
    } else if (r < cfg.rushChance) {
      type = "rush";
    } else if (Math.random() < cfg.chaos) {
      type = "zigzag";
    }

    const enemy = new Enemy(this.scene, x, y, type);

    // scaling propre
    enemy.hp = type === "tank" ? 2 + Math.floor(cfg.speed) : 1;
    enemy.speedY *= cfg.speed;

    enemies.push(enemy);
  }

  // =====================
  // SINGLE ENEMY SPAWN
  // =====================
  spawnEnemy(enemies) {
    const levelSystem = this.scene.levelSystem;
    const level = levelSystem.getLevel();

    const x = Math.random() * 800;
    const y = -40;

    let type = "normal";
    const r = Math.random();

    // scaling simple par niveau
    if (level >= 3 && r < 0.25) type = "tank";
    else if (level >= 2 && r < 0.55) type = "zigzag";
    else if (r > 0.85) type = "rush";

    const enemy = new Enemy(this.scene, x, y, type);

    // scaling stats propre
    enemy.hp = 1 + Math.floor(level / 3);
    enemy.speedY *= 1 + level * 0.08;

    enemies.push(enemy);
  }


  // =====================
  // WAVE SPAWN
  // =====================
  spawnWave(enemies) {
    const level = this.scene.levelSystem.getLevel();

    const waveSize = 3 + Math.floor(level / 2);

    const startX = Math.random() * 300 + 100;
    const spacing = 50 + Math.random() * 30;

    for (let i = 0; i < waveSize; i++) {
      const x = startX + i * spacing;
      const y = -40;

      let type = "normal";
      const r = Math.random();

      if (level >= 3 && r < 0.25) type = "tank";
      else if (level >= 2 && r < 0.5) type = "zigzag";
      else if (r > 0.85) type = "rush";

      const enemy = new Enemy(this.scene, x, y, type);

      enemy.hp = 1 + Math.floor(level / 3);
      enemy.speedY *= 1 + level * 0.08;

      enemies.push(enemy);
    }
  }
}
