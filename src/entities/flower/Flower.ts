import Phaser from 'phaser';
import GridEntity from "../GridEntity";
import {EntityConstants} from "../EntityConstants";
import {ColorConstants} from "./ColorConstants";
import GameController from "../../GameController";
import Entity from "../Entity";
import TileManager from "../../tile/TileManager";
import EntityManager from "../manager/EntityManager";
import {GameConstants} from "../../GameConstants";
import {TileUtils} from "../../tile/TileUtils";

export default class Flower extends GridEntity {
  color:number;
  colorChar:string; // character symbol that represents the color

  pickup:boolean; // allowed to pickup this instance?
  holder:Entity|null; // reference to entity holding this instance

  constructor(config) {
    super(config);
    const scene:Phaser.Scene = config.scene;

    this.entityType = EntityConstants.Type.FLOWER;
    this.setDisplayOrigin(8, 8);

    this.color = config.color;
    // throw error
    if (this.color === undefined) {
      throw 'Color is not defined for Flower!';
    }
    if (this.color !== ColorConstants.Color.NONE) {
      // TODO FOR DEBUGGING ONLY!!
      const anim = scene.anims.get('flower');
      this.anims.setCurrentFrame(anim.frames[this.color]);
    }
    this.colorChar = GameController.instance(scene).getColorManager().getColorCharacter(this.color);

    this.pickup = config.pickup || true;
    this.holder = null;
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
      this.y = this.holder.y - this.offset.y;
    }
    const tpos = TileManager.getTilePosition(this.x, this.y);
    this.getGridPosition().set(tpos.x, tpos.y);
  }

  placed(x:number, y:number) {
    // snap to the grid
    const tpos = TileManager.getTileHalfPosition(x, y);
    this.setPosition(tpos.x, tpos.y);

    // create the adjacent instance
    this.createAdjacent(-1,  0); // left
    this.createAdjacent( 0, -1); // top
    this.createAdjacent( 1,  0); // right
    this.createAdjacent( 0,  1); // bottom
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
    const x = this.x + GameConstants.Tile.SIZE * xdir;
    const y = this.y + GameConstants.Tile.SIZE * ydir;
    return EntityManager.instance(this.scene).getEntityAtGridPosition(x, y, EntityConstants.Type.FLOWER, this);
  }

  isTileAdjacent(xdir:number, ydir:number) : boolean {
    const tileSize = GameConstants.Tile.SIZE;
    const tile = TileManager.getTileAtPosition(this.x + tileSize * xdir, this.y + tileSize * ydir, TileUtils.Layer.COLLISION, this.scene);
    return tile !== null && tile.index >= 0;
  }

  isFree(pos:any) : boolean {
    const entity = EntityManager.instance(this.scene).getEntityAtGridPosition(pos.x, pos.y, EntityConstants.Type.FLOWER, this);
    const tile = TileManager.getTileAtPosition(pos.x, pos.y, TileUtils.Layer.COLLISION, this.scene);
    return !entity && !(tile !== null && tile.index >= 0);
  }

  /**
   * Check for flower in adjacent tile spaces. If a flower exists, then check that the next adjacent tile space is free.
   * When both conditions are passed, try to create a flower instance with the combined colors. A Flower instance WILL
   * ONLY be created when the combined colors is valid.
   * @param xdir
   * @param ydir
   */
  createAdjacent(xdir:number, ydir:number) {
    const colorManager = GameController.instance(this.scene).getColorManager();
    const tileSize = GameConstants.Tile.SIZE;

    const entity:any = this.findAdjacent(xdir, ydir);
    if (entity) {
      let color = ColorConstants.Color.NONE;
      const pos = {
        x: entity.x + tileSize * xdir,
        y: entity.y + tileSize * ydir
      };
      const nextAdjEntity:any = entity.findAdjacent(xdir, ydir);
      const prevAdjEntity:any = this.findAdjacent(xdir * -1, ydir * -1); // opposite adjacent entity

      if (this.isWhite() && entity.isRBY() && (prevAdjEntity && !prevAdjEntity.isWhite() && !prevAdjEntity.isRBY())) { // white in between colors
        // get the new color
        color = colorManager.getCombinedColor(entity.color, prevAdjEntity.color, true);
      } else if (!this.isWhite() && entity.isWhite() && (nextAdjEntity && !nextAdjEntity.isWhite())) { // adjacent color is white, next is not
        // get the new color
        color = colorManager.getCombinedColor(this.color, nextAdjEntity.color, true);
        if (ColorConstants.isColor(color)) {
          const rby = this.isRBY() ? this : nextAdjEntity;
          // find the direction for new instance
          const dx = xdir !== 0 ? (rby.x > entity.x ? 1 : -1) : 0;
          const dy = ydir !== 0 ? (rby.y > entity.y ? 1 : -1) : 0;
          pos.x = rby.x + tileSize * dx;
          pos.y = rby.y + tileSize * dy;
        }
      } else if (!nextAdjEntity && !entity.isTileAdjacent(xdir, ydir)) { // color mix
        // get the new color
        color = colorManager.getCombinedColor(this.color, entity.color, false);
      }
      // color is valid, and no entity or tile collision
      if (ColorConstants.isColor(color) && this.isFree(pos)) {
        // create a new flower instance
        new Flower({
          scene: this.scene,
          x: pos.x,
          y: pos.y,
          width: entity.getWidth(),
          height: entity.getHeight(),
          xoffset: entity.getWidth() * 0.5,
          yoffset: entity.getHeight() * 0.5,
          group: EntityConstants.Group.FLOWER,
          color: color,
          texture: 'flower'
        });
        // todo NOTE, the grid positions for the created entity are not stored in the EntityManager until the NEXT update
      }
    }
  }
}