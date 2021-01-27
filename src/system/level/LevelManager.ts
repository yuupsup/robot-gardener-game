import Phaser from "phaser";
import {SceneConstants} from "../../scenes/SceneConstants";
import {EntityConstants} from "../../entities/EntityConstants";
import {LevelProperties} from "./LevelProperties";
import {TileUtils} from "../../tile/TileUtils";
import {CommandType} from "../../pattern/command/CommandType";
import Command from "../../pattern/command/Command";
import GameController from "../../GameController";
import Player from "../../entities/player/Player";
import EntityManager from "../../entities/manager/EntityManager";
import Flower from "../../entities/flower/Flower";
import TodoManager from "../../entities/manager/todo/TodoManager";

/**
 * Holds information related to the current level.
 */
export default class LevelManager {
  scene:Phaser.Scene;

  level:number;
  complete:boolean; // level complete
  next:boolean; // denotes changing levels

  todoManager:TodoManager;

  constructor(scene:Phaser.Scene) {
    this.scene = scene;

    this.level = 0;
    this.next = false;

    this.todoManager = new TodoManager();
  }

  createLevel() {
    this.level = Phaser.Math.Clamp(this.level, 0, LevelProperties.levels.length - 1);
    this.complete = false;
    this.next = false;

    const data = this.scene.cache.json.get(LevelProperties.getEntitiesForLevel(this.level));

    this.createTodoList(data);
    this.createTilemap();
    this.createEntities(data);
  }

  createTodoList(data:any) {
    this.todoManager.clear();
    if (data.todo) {
      for (let i = 0; i < data.todo.length; i++) {
        const todo = data.todo[i];
        this.todoManager.add(...todo.colors);
      }
    }
    // todo remove
    console.log(this.todoManager.get());
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

  createEntities(data:any) {

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

  /**
   * Returns the current index
   */
  getTodoIndex() : number {
    return this.todoManager.index;
  }

  command(command:Command) {
    if ((command.type === CommandType.Level.NEXT_LEVEL || command.type === CommandType.Level.RESTART) && !this.next) {
      if (command.type === CommandType.Level.NEXT_LEVEL) {
        this.level++;
      }
      this.next = true;
      GameController.instance(this.scene).emitEvent(SceneConstants.Events.START_LEVEL);
    } else if (command.type === CommandType.Level.CHECK_COMBINATION && !this.complete && this.getTodoIndex() === command.data.index) {
      // level cannot be completed & the color mix must be for the current item index
      const colorMix = command.data.colorMix; // holds the colors involved
      const currentMix = this.todoManager.get();

      if (colorMix === currentMix || colorMix.split("").reverse().join("") === currentMix) {
        if (this.todoManager.hasNext()) {
          this.todoManager.next();
          console.log(this.todoManager.get());
        } else {
          console.log("level completed");
          this.complete = true;
        }
        // todo need to play "correct" sound
      } else {
        console.log("Incorrect");
        // todo need to shake the item when incorrect, however it would have to be after all commands have been checked for the update
        // todo need to play "incorrect" sound ONLY after all other commands for the this manager has been checked
      }
    }
  }

  destroy() {
    this.todoManager.clear();
  }
}