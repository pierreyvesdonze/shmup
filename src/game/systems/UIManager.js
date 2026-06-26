export default class UIManager {
  constructor(scene) {
    this.scene = scene;

    // HP COEURS
    this.hpHearts = [];
    for (let i = 0; i < 5; i++) {
      const heart = scene.add.text(14 + i * 22, 35, "♥", {
        fontSize: "20px",
        color: "#ff4444",
      });
      this.hpHearts.push(heart);
    }

    // POWER BARS
    this.powerBars = [];
    for (let i = 0; i < 3; i++) {
      const bar = scene.add
        .rectangle(14 + i * 16, 58, 12, 18, 0xffffff15)
        .setOrigin(0, 0);
      this.powerBars.push(bar);
    }

    // LEVEL + KILLS
    this.levelText = scene.add.text(14, 12, "LEVEL 1", {
      fontSize: "13px",
      color: "#ffffff55",
      fontFamily: "monospace",
    });

    this.killsBarBg = scene.add
      .rectangle(14, 30, 110, 7, 0xffffff15)
      .setOrigin(0, 0.5);
    this.killsBar = scene.add
      .rectangle(14, 30, 110, 7, 0x9900ff)
      .setOrigin(0, 0.5);

    // SCORE
    this.scoreText = scene.add
      .text(658, 12, "000000", {
        fontSize: "16px",
        color: "#ffffff",
        fontFamily: "monospace",
      })
      .setOrigin(1, 0);

    // HEAT BAR
    this.heatBarBg = scene.add.rectangle(700, 20, 100, 10, 0x333333);
    this.heatBar = scene.add.rectangle(700, 20, 100, 10, 0x00ffff);

    // BOSS BAR (cachée par défaut)
    this.bossBarBg = scene.add
      .rectangle(400, 52, 260, 10, 0xffffff15)
      .setOrigin(0.5, 0.5);
    this.bossBar = scene.add
      .rectangle(270, 52, 260, 10, 0xcc00ff)
      .setOrigin(0, 0.5);
    this.bossLabel = scene.add
      .text(400, 38, "— MID BOSS —", {
        fontSize: "11px",
        color: "#ff00ffaa",
        fontFamily: "monospace",
      })
      .setOrigin(0.5, 0.5);

    this.bossBarBg.setVisible(false);
    this.bossBar.setVisible(false);
    this.bossLabel.setVisible(false);

    // MUTE BUTTON
    this.muted = false;
    this.muteBtn = scene.add
      .text(788, 40, "🔊", {
        fontSize: "18px",
        color: "#ffffff99",
        fontFamily: "monospace",
      })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true });

    this.muteBtn.on("pointerdown", () => {
      this.muted = !this.muted;
      this.muteBtn.setText(this.muted ? "🔇" : "🔊");
      scene.sound.setMute(this.muted);
    });

    this.muteBtn.on("pointerover", () => this.muteBtn.setColor("#ffffff"));
    this.muteBtn.on("pointerout", () => this.muteBtn.setColor("#ffffff99"));

    // VIGNETTE
    this.vignette = scene.add
      .rectangle(400, 300, 800, 600, 0xff0000, 0)
      .setDepth(10);

    // COMBO
    this.comboText = scene.add
      .text(400, 150, "", {
        fontSize: "32px",
        fontFamily: "monospace",
        color: "#ffff00",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setAlpha(0);
  }

  update({ hp, powerLevel, score, heat, maxHeat, kills, target, level }) {
    // HP
    for (let i = 0; i < this.hpHearts.length; i++) {
      this.hpHearts[i].setColor(i < hp ? "#ff4444" : "#333333");
    }

    // POWER
    for (let i = 0; i < this.powerBars.length; i++) {
      this.powerBars[i].fillColor = i < powerLevel ? 0x00ffcc : 0xffffff15;
    }

    // SCORE
    this.scoreText.setText(String(score).padStart(6, "0"));

    // HEAT
    const heatPercent = heat / maxHeat;
    this.heatBar.width = 100 * (1 - heatPercent);
    if (heatPercent < 0.5) this.heatBar.fillColor = 0x00ffff;
    else if (heatPercent < 0.8) this.heatBar.fillColor = 0xffaa00;
    else this.heatBar.fillColor = 0xff0000;

    // LEVEL + KILLS
    this.levelText.setText(`LEVEL ${level}  —  ${kills} / ${target}`);
    this.killsBar.width = 110 * Math.min(1, kills / target);
  }

  showBossBar(label = "— MID BOSS —") {
    this.bossLabel.setText(label);
    this.bossBarBg.setVisible(true);
    this.bossBar.setVisible(true);
    this.bossLabel.setVisible(true);
  }

  hideBossBar() {
    this.bossBarBg.setVisible(false);
    this.bossBar.setVisible(false);
    this.bossLabel.setVisible(false);
  }

  updateBossBar(hp, maxHp) {
    const ratio = hp / maxHp;
    this.bossBar.width = 260 * ratio;
    this.bossBar.x = 270 + (260 - this.bossBar.width) / 2;
  }

  showLevelBanner(text) {
    const banner = this.scene.add
      .text(400, 280, text, {
        fontSize: "48px",
        color: "#ffffff",
        fontFamily: "monospace",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.scene.tweens.add({
      targets: banner,
      alpha: { from: 0, to: 1 },
      duration: 300,
      yoyo: true,
      hold: 800,
      ease: "Power2",
      onComplete: () => banner.destroy(),
    });
  }

  spawnScorePopup(x, y, value) {
    const text = this.scene.add.text(x, y, `+${value}`, {
      fontSize: "16px",
      color: "#ffff00",
      fontStyle: "bold",
    });

    text.setOrigin(0.5);

    this.scene.tweens.add({
      targets: text,
      y: y - 30,
      alpha: 0,
      duration: 500,
      ease: "Power1",
      onComplete: () => text.destroy(),
    });
  }

  updateVignette(hp) {
    const danger = hp <= 2;

    if (danger && !this._vignettePulsing) {
      this._vignettePulsing = true;
      const intensity = hp === 1 ? 0.25 : 0.12;
      this.scene.tweens.killTweensOf(this.vignette);
      this.scene.tweens.add({
        targets: this.vignette,
        fillAlpha: intensity,
        duration: 400,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    if (!danger && this._vignettePulsing) {
      this._vignettePulsing = false;
      this.scene.tweens.killTweensOf(this.vignette);
      this.vignette.setAlpha(0);
    }
  }

  showCombo(count) {
    if (count < 2) return;

    this.scene.tweens.killTweensOf(this.comboText);
    this.comboText.setText(`x${count} COMBO`);
    this.comboText.setAlpha(1).setScale(1.4);

    this.scene.tweens.add({
      targets: this.comboText,
      alpha: 0,
      scaleX: 1,
      scaleY: 1,
      delay: 600,
      duration: 400,
      ease: "Power2",
    });
  }
}
