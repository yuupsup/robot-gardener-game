export const LevelProperties = {
  levels: [
    { // tutorial
      tutorial: true,
      map: 'map',
      level: 'tutorial'
    },
    { // 1
      map: 'map',
      level: 'level1'
    },
    { // 2
      gameover: true,
      map: 'map',
      level: 'gameover',
    }
  ],
  isTutorial: function(level:number) : boolean {
    return level >= 0 && level < this.levels.length && this.levels[level].tutorial;

  },
  isGameOver: function(level:number) : boolean {
    return level >= 0 && level < this.levels.length && this.levels[level].gameover;
  },
  getMapForLevel: function(level:number) : string {
    if (level >= 0 && level < this.levels.length) {
      return this.levels[level].map;
    }
    return '';
  },
  getLevelData: function(level:number) : string {
    if (level >= 0 && level < this.levels.length) {
      return this.levels[level].level;
    }
    return '';
  }
};