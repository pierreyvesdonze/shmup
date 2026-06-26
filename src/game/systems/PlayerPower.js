export default class PlayerPower {
  constructor() {
    this.level = 1;
    this.maxLevel = 4;
  }

  addPower() {
    this.level++;

    if (this.level > this.maxLevel) {
      this.level = this.maxLevel;
    }
  }

  losePower() {
    this.level = Math.max(1, this.level - 1);
  }

  getLevel() {
    return this.level;
  }
}
