import GridEntity from "../GridEntity";
import {EntityConstants} from "../EntityConstants";
import {ColorConstants} from "../color/ColorConstants";
import Entity from "../Entity";
import TileManager from "../../tile/TileManager";
import EntityManager from "../manager/EntityManager";
import {GameConstants} from "../../GameConstants";
import {TileUtils} from "../../tile/TileUtils";
import FlowerManager from "./FlowerManager";
import Player from "../player/Player";

export default class Flower extends GridEntity {
  color:number;
  colorChar:string; // character symbol that represents the color

  pickup:boolean; // allowed to pickup this instance?
  holder:Player|null; // reference to entity holding this instance

  constructor(config) {
    super(config);
    // const scene:Phaser.Scene = config.scene;

    this.entityType = EntityConstants.Type.FLOWER;
    this.setDisplayOrigin(8, 8);

    this.color = config.color;
    // throw error
    if (this.color === undefined) {
      throw 'Color is not defined for Flower!';
    }
    if (this.color !== ColorConstants.Color.NONE) {
      // TODO FOR DEBUGGING ONLY!!
      // todo used to show visual colors for the flowers
      // const anim = scene.anims.get('flower');
      // this.anims.setCurrentFrame(anim.frames[this.color]);
    }
    this.colorChar = ColorConstants.getColorCharacter(this.color);

    this.pickup = config.pickup || true;
    this.holder = null;

    this.anims.play('flower');
  }

  getEntityDepth(): number {
    if (this.holder) {
      return EntityConstants.Depth.FLOWER_HOLD;
    }
    return EntityConstants.Depth.FLOWER;
  }

  postUpdate(time: number, delta: number) {
    super.postUpdate(time, delta);

    // update grid position
    if (this.holder) {
      this.x = this.holder.x;
      this.y = this.holder.y - (this.offset.y + 6);
    }
    const tpos = TileManager.getTilePosition(this.x, this.y);
    this.getGridPosition().set(tpos.x, tpos.y);
  }

  placed(x:number, y:number) : boolean {
    // snap to the grid
    const tpos = TileManager.getTileHalfPosition(x, y);
    this.setPosition(tpos.x, tpos.y);

    let success = false;
    // create the adjacent instance
    success = (!success) ? FlowerManager.createAdjacent(this, -1,  0, this.scene) : true; // left
    success = (!success) ? FlowerManager.createAdjacent(this, 0, -1, this.scene) : true; // top
    success = (!success) ? FlowerManager.createAdjacent(this, 1,  0, this.scene) : true; // right
    success = (!success) ? FlowerManager.createAdjacent(this, 0,  1, this.scene) : true; // bottom
    return success;
  }

  isRBY() : boolean {
    switch(this.color) {
      case ColorConstants.Color.RED:
      case ColorConstants.Color.BLUE:
      case ColorConstants.Color.YELLOW:
        return true;
    }
    return false;
  }

  isWhite() : boolean {
    return this.color === ColorConstants.Color.WHITE;
  }

  findAdjacent(xdir:number, ydir:number) : Entity|null {
    const pos = this.holder ? this.holder.getGridPosition() : {x: this.x, y: this.y};
    const x = pos.x + GameConstants.Tile.SIZE * xdir;
    const y = pos.y + GameConstants.Tile.SIZE * ydir;
    return EntityManager.instance(this.scene).getEntityAtGridPosition(x, y, EntityConstants.Type.FLOWER, this);
  }

  isTileAdjacent(xdir:number, ydir:number) : boolean {
    const pos = this.holder ? this.holder.getGridPosition() : {x: this.x, y: this.y};
    const x = pos.x + GameConstants.Tile.SIZE * xdir;
    const y = pos.y + GameConstants.Tile.SIZE * ydir;
    const tile = TileManager.getTileAtPosition(x, y, TileUtils.Layer.COLLISION, this.scene);
    return tile !== null && tile.index >= 0;
  }

  isFree(pos:any) : boolean {
    const entity = EntityManager.instance(this.scene).getEntityAtGridPosition(pos.x, pos.y, EntityConstants.Type.FLOWER, this);
    const tile = TileManager.getTileAtPosition(pos.x, pos.y, TileUtils.Layer.COLLISION, this.scene);
    return !entity && !(tile !== null && tile.index >= 0);
  }
}