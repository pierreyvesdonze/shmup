export const LEVELS = {
  1: {
    spawnRate: 1.0,
    speed: 1.0,
    types: ["normal"],
    pattern: "basic",
  },

  2: {
    spawnRate: 1.1,
    speed: 1.1,
    types: ["normal", "zigzag"],
    pattern: "basic",
  },

  3: {
    spawnRate: 1.2,
    speed: 1.2,
    types: ["normal", "zigzag"],
    pattern: "aggressive",
  },

  4: {
    spawnRate: 1.3,
    speed: 1.25,
    types: ["normal", "zigzag", "rush"],
    pattern: "aggressive",
  },

  5: {
    spawnRate: 1.4,
    speed: 1.3,
    types: ["zigzag", "rush"],
    pattern: "bulletHellLite",
  },

  6: {
    spawnRate: 1.5,
    speed: 1.4,
    types: ["zigzag", "rush", "tank"],
    pattern: "bulletHellLite",
  },

  7: {
    spawnRate: 1.7,
    speed: 1.5,
    types: ["rush", "tank"],
    pattern: "bulletHell",
  },

  8: {
    spawnRate: 1.9,
    speed: 1.6,
    types: ["rush", "tank"],
    pattern: "bulletHell",
  },

  9: {
    spawnRate: 2.2,
    speed: 1.7,
    types: ["tank"],
    pattern: "bulletHellExtreme",
  },

  10: {
    spawnRate: 2.6,
    speed: 2.0,
    types: ["tank"],
    pattern: "bossRush",
  },
};