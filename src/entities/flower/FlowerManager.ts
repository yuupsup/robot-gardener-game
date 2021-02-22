import Phaser from 'phaser';

import GameController from "../../GameController";
import {ColorConstants} from "../color/ColorConstants";
import {EntityConstants} from "../EntityConstants";
import Command from "../../pattern/command/Command";
import {CommandType} from "../../pattern/command/CommandType";
import {GameConstants} from "../../GameConstants";
import Flower from "./Flower";

export default class FlowerManager {

  /**
   * Check for flower in adjacent tile spaces. If a flower exists, then check that the next adjacent tile space is free.
   * When both conditions are passed, try to create a flower instance with the combined colors. A Flower instance WILL
   * ONLY be created when the combined colors is valid.
   * @param flower
   * @param xdir
   * @param ydir
   * @param scene
   */
  static createAdjacent(flower:Flower, xdir:number, ydir:number, scene:Phaser.Scene) : boolean {
    const levelManager = GameController.instance(scene).getLevelManager(scene);
    const props = FlowerManager.getFlowerPropertiesForNewInstance(flower, xdir, ydir, scene);
    if (props) {
      const color = props.color;
      const pos = props.position;
      const colorMix = props.colorMix;
      // color is valid, and no entity or tile collision
      if (ColorConstants.isColor(props.color) && flower.isFree(pos)) {
        // create a new flower instance
        const w = flower.getWidth();
        const h = flower.getHeight();
        new Flower({
          scene: scene,
          x: pos.x,
          y: pos.y,
          width: w,
          height: h,
          xoffset: w * 0.5,
          yoffset: h * 0.5,
          group: EntityConstants.Group.FLOWER,
          color: color,
          texture: 'flower'
        });

        GameController.instance(scene).getCommandManager(scene).add(new Command(CommandType.Level.CHECK_COMBINATION).addData({
          colorMix: colorMix,
          index: levelManager.getTodoIndex()
        }));
        return true;
        // todo NOTE, the grid positions for the created entity are not stored in the EntityManager until the NEXT update
      }
    }
    return false;
  }

  /**
   * Check for flower in adjacent tile spaces. If a flower exists, then check that the next adjacent tile space is free.
   * When both conditions are passed, return the properties of the flower to be created, or none when a new flower is
   * not to be created.
   * @param flower
   * @param xdir
   * @param ydir
   * @param scene
   */
  static getFlowerPropertiesForNewInstance(flower:Flower, xdir:number, ydir:number, scene:Phaser.Scene) : any|null {
    const colorManager = GameController.instance(scene).getColorManager();
    const tileSize = GameConstants.Tile.SIZE;
    let colorMix = ""; // holds the character representation of the colors involved

    const entity:any = flower.findAdjacent(xdir, ydir);
    if (entity) {
      let color = ColorConstants.Color.NONE;
      const pos = {
        x: entity.x + tileSize * xdir,
        y: entity.y + tileSize * ydir
      };
      const nextAdjEntity:any = entity.findAdjacent(xdir, ydir);
      const prevAdjEntity:any = flower.findAdjacent(xdir * -1, ydir * -1); // opposite adjacent entity

      if (flower.isWhite() && entity.isRBY() && (prevAdjEntity && !prevAdjEntity.isWhite() && !prevAdjEntity.isRBY())) { // white in between colors
        // get the new color
        color = colorManager.getCombinedColor(entity.color, prevAdjEntity.color, true);
        colorMix = entity.colorChar + ColorConstants.getColorCharacter(ColorConstants.Color.WHITE) + prevAdjEntity.colorChar;
      } else if (!flower.isWhite() && entity.isWhite() && (nextAdjEntity && !nextAdjEntity.isWhite())) { // adjacent color is white, next is not
        // get the new color
        color = colorManager.getCombinedColor(flower.color, nextAdjEntity.color, true);
        colorMix = flower.colorChar + ColorConstants.getColorCharacter(ColorConstants.Color.WHITE) + nextAdjEntity.colorChar;
        if (ColorConstants.isColor(color)) {
          const rby = flower.isRBY() ? flower : nextAdjEntity;
          const x = rby.holder ? rby.holder.getGridPosition().x + GameConstants.Tile.HALF_SIZE : rby.x;
          const y = rby.holder ? rby.holder.getGridPosition().y + GameConstants.Tile.HALF_SIZE : rby.y;

          // find the direction for new instance
          const dx = xdir !== 0 ? (x > entity.x ? 1 : -1) : 0;
          const dy = ydir !== 0 ? (y > entity.y ? 1 : -1) : 0;
          pos.x = x + tileSize * dx;
          pos.y = y + tileSize * dy;
        }
      } else if (!nextAdjEntity && !entity.isTileAdjacent(xdir, ydir)) { // color mix
        // get the new color
        color = colorManager.getCombinedColor(flower.color, entity.color, false);
        colorMix = flower.colorChar + entity.colorChar;
      }
      // color is valid, and no entity or tile collision
      if (ColorConstants.isColor(color) && flower.isFree(pos)) {
        return {
          color: color,
          position: pos,
          colorMix: colorMix
        }
      }
    }
    return null;
  }
}