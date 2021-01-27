import Phaser from 'phaser';
import GridEntity from "../GridEntity";
import {EntityConstants} from "../EntityConstants";
import {ColorConstants} from "./ColorConstants";
import GameController from "../../GameController";
import Entity from "../Entity";
import TileManager from "../../tile/TileManager";
import EntityManager from "../manager/EntityManager";
import {GameConstants} from "../../GameConstants";

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
    if (this.color === ColorConstants.Color.WHITE) {
      // todo need to have extra logic for WHITE flower
    } else {
      this.createAdjacent(-1,  0); // left
      this.createAdjacent( 0, -1); // top
      this.createAdjacent( 1,  0); // right
      this.createAdjacent( 0,  1); // bottom
    }
  }

  findAdjacent(xdir:number, ydir:number) : Entity|null {
    const x = this.x + GameConstants.Tile.SIZE * xdir;
    const y = this.y + GameConstants.Tile.SIZE * ydir;
    return EntityManager.instance(this.scene).getEntityAtGridPosition(x, y, EntityConstants.Type.FLOWER, this);
  }

  /**
   * Check for flower in adjacent tile spaces. If a flower exists, then check that the next adjacent tile space is free.
   * When both conditions are passed, try to create a flower instance with the combined colors. A Flower instance WILL
   * ONLY be created when the combined colors is valid.
   * @param xdir
   * @param ydir
   */
  createAdjacent(xdir:number, ydir:number) {
    const entity:any = this.findAdjacent(xdir, ydir);
    if (entity && !entity.findAdjacent(xdir, ydir)) {
      // get the new color
      const colorManager = GameController.instance(this.scene).getColorManager();
      const color = colorManager.getCombinedColor(this.color, entity.color, false);
      if (color !== ColorConstants.Color.NONE) {
        // create a new flower instance
        new Flower({
          scene: this.scene,
          x: entity.x + GameConstants.Tile.SIZE * xdir,
          y: entity.y + GameConstants.Tile.SIZE * ydir,
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