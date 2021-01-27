import {GameConstants} from "../GameConstants";

export const TileUtils = {
  TYPE_EMPTY: "empty",
  TYPE_SOLID: "solid",

  Layer: {
    GROUND: "Ground",
    COLLISION: "Collision"
  },

  Tiles: {
    GRASS_LEFT: 1,
    GRASS_MIDDLE: 2,
    GRASS_RIGHT: 3,
    SNOW_GRASS_LEFT: 4,
    SNOW_GRASS_MIDDLE: 5,
    SNOW_GRASS_RIGHT: 6
  },

  /**
   * Calculates the tile position in world coordinates.
   * @param {number} x
   * @param {number} y
   */
  toWorldPosition: function(x:number, y:number) : any {
    return {
      x: Math.floor(x / GameConstants.Tile.SIZE) * GameConstants.Tile.SIZE,
      y: Math.floor(y / GameConstants.Tile.SIZE) * GameConstants.Tile.SIZE
    };
  }
};