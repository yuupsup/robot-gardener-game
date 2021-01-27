import Phaser from 'phaser';
import {GameConstants} from "../GameConstants";
import GameController from "../GameController";
import AABB from "../collision/AABB";
import {TileUtils} from "./TileUtils";

export default class TileManager {
  constructor() {
  }
  /**
   * Populates the provided list with tile collisions detected from the provided bounds.
   * @param {AABB} aabb
   * @param {Phaser.Math.Vector2|object} velocity
   * @param {number} sceneWidth
   * @param {number} sceneHeight
   * @param {string} tileLayerId
   * @param {Array<Phaser.Tilemaps.Tile>} tileListIn
   * @param {Phaser.Scene} scene
   */
  static getTileCollisions(aabb:AABB, velocity:Phaser.Math.Vector2|any, sceneWidth:number, sceneHeight:number, tileLayerId:string, tileListIn:Array<Phaser.Tilemaps.Tile>, scene:Phaser.Scene) {
    if (!tileLayerId) {
      return;
    }
    // find the start and end position (in tile coordinates) to check for tile collisions
    // we need to check the velocity in order to address the width issue, here are the cases:
    // 1. when the velocity.x < 0 then AABB.x + AABB.width could possibly find tile collisions behind its direction of motion
    // 2. when the velocity.y < 0 then AABB.y + AABB.height could possibly find tile collisions behind its direction of motion
    // reproducing this issue is possible when the moving entity has a tile collision to its right and bottom
    //
    // the above comments might not apply anymore, needs to be verified
    //
    // The following line is commented out in order to prevent occurrences where an entity's velocity.x != 0 and
    // the velocity.y < 0. The entity is positioned where a collision should occur on the bottom of the entity, but
    // cannot because the entity's velocity is not > 0.

    // Current problem: Januaray, 12, 2021
    // Case [A] : [FIXED]
    // If an object eases to the left edge of a tile, there is the chance when the x velocity is zero, that the object
    // will fall through the tile. This is because of the condition below. The width (w) will use aabb.right - aabb.left
    // which will be the actual size of the bounding box, however this causes a problem because the endTilePos below
    // will come up short due to the TileManager.getTilePosition method utilizing the Math.floor operation. This DOES NOT
    // occur when the object eases to the right edge of a tile, since using Math.floor is in favor in that scenario.

    let w = velocity.x > 0 || velocity.x < 0 ? aabb.width : (aabb.right - aabb.left);
    let h = velocity.y > 0 || velocity.y < 0 ? aabb.height : (aabb.bottom - aabb.top);

    // todo is there a more efficient way to handle this case?
    // Case [A]
    if (velocity.x === 0) {
      // are we a pixel away from the next tile position?
      if ((aabb.right + 1) % GameConstants.Tile.SIZE === 0) {
        // do nothing here
      } else if (Math.floor(aabb.right + 1) % GameConstants.Tile.SIZE === 0) { // we are between tiles by decimal value
        w = aabb.width;
      }
    }

    let startTilePos = TileManager.getTilePosition(aabb.x, aabb.y);
    let endTilePos = TileManager.getTilePosition(aabb.x + w, aabb.y + h);

    let tilePosLimitX = (sceneWidth / GameConstants.Tile.SIZE) * GameConstants.Tile.SIZE;
    let tilePosLimitY = (sceneHeight / GameConstants.Tile.SIZE) * GameConstants.Tile.SIZE;

    let startTilePosX = Math.max(startTilePos.x, 0);
    let startTilePosY = Math.max(startTilePos.y, 0);

    let endTilePosX = Math.min(endTilePos.x, tilePosLimitX);
    let endTilePosY = Math.min(endTilePos.y, tilePosLimitY);

    // traverse all of the tiles the collision rectangle overlaps
    for (let i = startTilePosY; i <= endTilePosY; i += GameConstants.Tile.SIZE) {
      for (let j = startTilePosX; j <= endTilePosX; j += GameConstants.Tile.SIZE) {
        if (j >= tilePosLimitX || i >= tilePosLimitY) {
          continue;
        }
        let tile = this.getTileAtPosition(j, i, tileLayerId, scene);

        if (tile != null && tile.index >= 0) {
          // check if the tile type is a collision tile
          tileListIn.push(tile);
        }
      }
    }
  }

  static getLineIntersectTiles(area:AABB, lineIn:Phaser.Geom.Line, tileRectIn:Phaser.Geom.Rectangle, scene:Phaser.Scene) : boolean {
    let intersect = false;

    const tileListIn = [];
    TileManager.getTileCollisions(area, {
      x: 0,
      y: 0
    }, GameConstants.Screen.ROOM_WIDTH, GameConstants.Screen.ROOM_HEIGHT, TileUtils.Layer.COLLISION, tileListIn, scene);
    if (tileListIn.length > 0) {
      for (let i = 0; i < tileListIn.length; i++) {
        const tile = tileListIn[i];
        const rx = tile.x * GameConstants.Tile.SIZE;
        const ry = tile.y * GameConstants.Tile.SIZE;
        // does the line intersect the tile?
        tileRectIn.setPosition(rx, ry);
        intersect = Phaser.Geom.Intersects.LineToRectangle(lineIn, tileRectIn);
        if (intersect) {
          break; // collision with tile
        }
      }
    }
    return intersect;
  }

  /**
   * Returns a tile position (in pixels) from the provided positions.
   * @param {number} x
   * @param {number} y
   * @returns a pair of the provided positions converted into tile positions (divided by the tile size and multiplied by the tile size)
   */
  static getTilePosition(x:number, y:number) : any{
    let tlx = Math.floor(x / GameConstants.Tile.SIZE) * GameConstants.Tile.SIZE;
    let tly = Math.floor(y / GameConstants.Tile.SIZE) * GameConstants.Tile.SIZE;
    return {
      x: tlx,
      y: tly
    };
  }

  /**
   * Returns a tile half-position (in pixels) from the provided positions.
   * @param {number} x
   * @param {number} y
   * @returns a pair of the provided positions converted into tile half positions (divided by the tile size and multiplied by the tile size and sum half the tile size)
   */
  static getTileHalfPosition(x:number, y:number) : any {
    const pos = this.getTilePosition(x, y);
    pos.x += GameConstants.Tile.HALF_SIZE;
    pos.y += GameConstants.Tile.HALF_SIZE;
    return pos;
  }

  /**
   * Finds a tile from the provided position. The provided positions will be converted into an array index to retrieve the Tile instance if it exists.
   * @param {number} x
   * @param {number} y
   * @param {string} layerId
   * @param {Phaser.Scene} scene
   * @returns {Phaser.Tilemaps.Tile} a Tile instance from the tile map.
   */
  static getTileAtPosition(x:number, y:number, layerId:string, scene:Phaser.Scene) : Phaser.Tilemaps.Tile|null {
    return GameController.instance(scene).getTileAtWorldPosition(x, y, layerId, scene);
  }
}