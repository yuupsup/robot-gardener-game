export const LevelProperties = {
  levels: [
    { // 1
      map: 'map',
      level: 'level1'
    },
    { // 2
      map: 'map1',
      level: 'level2'
    }
  ],
  getMapForLevel: function(level:number) {
    if (level >= 0 && level < this.levels.length) {
      return this.levels[level].map;
    }
    return '';
  },
  getEntitiesForLevel: function(level:number) {
    if (level >= 0 && level < this.levels.length) {
      return this.levels[level].level;
    }
    return '';
  }
};