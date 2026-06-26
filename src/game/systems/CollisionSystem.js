export default class CollisionSystem {
  check(enemies, bullets, scene) {
    for (const enemy of enemies) {
      if (!enemy.alive) continue;

      for (const bullet of bullets) {
        if (!bullet.active) continue;

        const dx = enemy.sprite.x - bullet.sprite.x;
        const dy = enemy.sprite.y - bullet.sprite.y;

        if (Math.sqrt(dx * dx + dy * dy) < 25) {
          bullet.kill?.();
          const died = enemy.damage?.(1);

          if (died && scene?.onEnemyKilled) {
            scene.onEnemyKilled(enemy);
          }

          return;
        }
      }
    }
  }
}