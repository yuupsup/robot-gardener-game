import Phaser from "phaser";
import {CommandType} from "../../pattern/command/CommandType";
import Command from "../../pattern/command/Command";
import GameController from "../../GameController";
import {TileUtils} from "../../tile/TileUtils";
import {LevelProperties} from "./LevelProperties";
import Player from "../../entities/player/Player";
import {SceneConstants} from "../../scenes/SceneConstants";
import EntityManager from "../../entities/manager/EntityManager";
import {EntityConstants} from "../../entities/EntityConstants";
import destroy = Phaser.Loader.FileTypesManager.destroy;
import Flower from "../../entities/flower/Flower";

/**
 * Holds information related to the current level.
 */
export default class LevelManager {
  scene:Phaser.Scene;

  level:number;
  next:boolean; // denotes changing levels

  constructor(scene:Phaser.Scene) {
    this.scene = scene;

    this.level = 0;
    this.next = false;
  }

  createLevel() {
    this.level = Phaser.Math.Clamp(this.level, 0, LevelProperties.levels.length - 1);
    this.next = false;

    this.createTilemap();
    this.createEntities();
  }

  /**
   * Setup the tile map
   */
  createTilemap() {
    GameController.createTileMapPropertiesForScene(this.scene, {
      map: LevelProperties.getMapForLevel(this.level),
      tileId: "tileset",
      tileIdExtruded: "tileset-extruded"
    });
    GameController.instance(this.scene).addTilemapLayer(this.scene, TileUtils.Layer.COLLISION, 0, 0);
  }

  createEntities() {
    const data = this.scene.cache.json.get(LevelProperties.getEntitiesForLevel(this.level));

    if (data.player) {
      const d = data.player;
      new Player({
        scene: this.scene,
        x: d.x,
        y: d.y,
        width: d.width,
        height: d.height,
        xoffset: d.width * 0.5,
        yoffset: d.height * 0.5,
        texture: 'player'
      });
    }
    if (data.flowers) {
      // todo should we even remove the group from the scene?
      EntityManager.instance(this.scene).createGroup(Flower, EntityConstants.Group.FLOWER, true, this.scene);
      for (let i = 0; i < data.flowers.length; i++) {
        const d = data.flowers[i];
        new Flower({
          scene: this.scene,
          x: d.x,
          y: d.y,
          width: d.width,
          height: d.height,
          xoffset: d.width * 0.5,
          yoffset: d.height * 0.5,
          group: EntityConstants.Group.FLOWER,
          color: d.color,
          texture: 'flower'
        });
      }
    }
  }

  update() {

  }

  postUpdate() {
    // restart level (only when the request to move to next level has not been made)
    // todo remove the restart button
    const inputManager = GameController.instance(this.scene).getInputManager(this.scene);
    if (inputManager.isPressed(Phaser.Input.Keyboard.KeyCodes.R) && !this.next) {
      // clear all commands
      const commandManager = GameController.instance(this.scene).getCommandManager(this.scene);
      commandManager.clear();
      commandManager.addStatic(CommandType.Entity.PAUSE);
      commandManager.addStatic(CommandType.Level.RESTART);
    }
  }

  command(command:Command) {
    if ((command.type === CommandType.Level.NEXT_LEVEL || command.type === CommandType.Level.RESTART) && !this.next) {
      if (command.type === CommandType.Level.NEXT_LEVEL) {
        this.level++;
      }
      this.next = true;
      GameController.instance(this.scene).emitEvent(SceneConstants.Events.START_LEVEL);
    }
  }

  destroy() {

  }
}