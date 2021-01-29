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
      map: 'map1',
      level: 'level2'
    }
  ],
  isTutorial: function(level:number) : boolean {
    return level >= 0 && level < this.levels.length && this.levels[level].tutorial;

  },
  getMapForLevel: function(level:number) {
    if (level >= 0 && level < this.levels.length) {
      return this.levels[level].map;
    }
    return '';
  },
  getLevelData: function(level:number) {
    if (level >= 0 && level < this.levels.length) {
      return this.levels[level].level;
    }
    return '';
  }
};