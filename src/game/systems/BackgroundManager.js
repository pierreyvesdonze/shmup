export default class BackgroundManager {
  constructor(scene) {
    this.scene = scene;
    this.starLayers = [];

    const layerConfigs = [
      { count: 60, speed: 0.3, size: 1,   alpha: 0.3 },
      { count: 40, speed: 0.7, size: 1.5, alpha: 0.6 },
      { count: 20, speed: 1.4, size: 2,   alpha: 0.9 },
    ];

    for (const cfg of layerConfigs) {
      const stars = [];
      for (let i = 0; i < cfg.count; i++) {
        const x = Math.random() * 800;
        const y = Math.random() * 600;
        const star = scene.add.rectangle(x, y, cfg.size, cfg.size, 0xffffff);
        star.setAlpha(cfg.alpha);
        star._speed = cfg.speed;
        stars.push(star);
      }
      this.starLayers.push(stars);
    }
  }

  update() {
    for (const layer of this.starLayers) {
      for (const star of layer) {
        star.y += star._speed;
        if (star.y > 610) {
          star.y = -5;
          star.x = Math.random() * 800;
        }
      }
    }
  }
}