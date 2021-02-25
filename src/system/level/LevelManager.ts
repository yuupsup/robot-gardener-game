import Phaser from "phaser";
import {SceneConstants} from "../../scenes/SceneConstants";
import {EntityConstants} from "../../entities/EntityConstants";
import {LevelProperties} from "./LevelProperties";
import {TileUtils} from "../../tile/TileUtils";
import {CommandType} from "../../pattern/command/CommandType";
import GameController from "../../GameController";
import Player from "../../entities/player/Player";
import Flower from "../../entities/flower/Flower";
import EntityManager from "../../entities/manager/EntityManager";
import TodoManager from "../../entities/manager/todo/TodoManager";
import Command from "../../pattern/command/Command";
import TutorialManager from "./TutorialManager";
import {GameConstants} from "../../GameConstants";
import MessageGraph from "../../gui/dialog/message/MessageGraph";
import MessageNode from "../../gui/dialog/message/MessageNode";

/**
 * Holds information related to the current level.
 */
export default class LevelManager {
  scene:Phaser.Scene;

  level:number;
  tutorial:boolean; // is current level the tutorial
  complete:boolean; // level complete
  gameover:boolean;
  next:boolean; // denotes changing levels

  currentLevelModal:Phaser.GameObjects.Image;
  currentLevelText:Phaser.GameObjects.BitmapText;

  startLevelTime:number; // time until the game can be played
  startLevelTimeMax:number;
  startLevelTimeSpd:number;

  endLevelTime:number;
  endLevelTimeMax:number;
  endLevelTimeSpd:number;

  play:boolean;

  textbox:Phaser.GameObjects.Image;

  todoManager:TodoManager;

  tutorialManager:TutorialManager;

  constructor(scene:Phaser.Scene) {
    this.scene = scene;

    this.level = 0;
    this.tutorial = false;
    this.complete = false;
    this.gameover = false;
    this.next = false;

    this.startLevelTimeMax = 20;
    this.startLevelTime = this.startLevelTimeMax;
    this.startLevelTimeSpd = 10;

    this.endLevelTimeMax = 20;
    this.endLevelTime = this.endLevelTimeMax;
    this.endLevelTimeSpd = 10;

    this.play = false;

    this.currentLevelModal = scene.add.image(GameConstants.Screen.ROOM_WIDTH * 0.5, GameConstants.Screen.ROOM_HEIGHT * 0.4, 'todo-item');
    this.currentLevelModal.setDepth(GameConstants.Depth.MESSAGE_BOX);

    this.currentLevelText = scene.add.bitmapText(GameConstants.Screen.ROOM_WIDTH * 0.5, GameConstants.Screen.ROOM_HEIGHT * 0.4, GameConstants.Font.BLACK.FONT, 'Level ' + this.level, GameConstants.Font.BLACK.SIZE);
    this.currentLevelText.setOrigin(0.5);
    this.currentLevelText.setDepth(GameConstants.Depth.MESSAGE_BOX_TEXT);

    this.textbox = scene.add.image(GameConstants.Screen.ROOM_WIDTH * 0.5, GameConstants.Screen.ROOM_HEIGHT - 32, 'textbox');

    this.todoManager = new TodoManager(scene);
    this.tutorialManager = new TutorialManager(this.todoManager);
  }

  createLevel() {
    this.level = Phaser.Math.Clamp(this.level, 0, LevelProperties.levels.length - 1);
    this.tutorial = false;
    this.complete = false;
    this.next = false;
    this.play = false;

    const gameController = GameController.instance(this.scene);

    // todo need to clear the dialog manager here?
    const dialogManager = gameController.getDialogManager(this.scene);
    dialogManager.clear();

    dialogManager.setPosition(80, GameConstants.Screen.ROOM_HEIGHT - 51);
    dialogManager.pause();

    const data = this.scene.cache.json.get(LevelProperties.getLevelData(this.level));

    /**
     * Game Over screen
     */
    if (LevelProperties.isGameOver(this.level)) {
      this.gameover = true;

      // todo do something here
      // play music?
      this.currentLevelModal.setVisible(true);
      this.currentLevelText.setText('Game Over').setVisible(true);

      // todo add dialog message

      const mg = new MessageGraph();
      mg.addNode(new MessageNode("A").setMessage("Thank you for playing!"));
      dialogManager.addMessage(mg);
      dialogManager.disable(); // do not allow user to press buttons
      dialogManager.unpause();

    } else {
      this.startLevelTime = this.startLevelTimeMax;
      this.currentLevelModal.setVisible(true);
      this.currentLevelText.setText(this.level === 0 ? 'Tutorial' : 'Level ' + this.level);
      this.currentLevelText.setVisible(true);

      gameController.getCommandManager(this.scene).addStatic(CommandType.Entity.PAUSE); // pause all entities
    }

    this.createTodoList(data);

    /**
     * Tutorial
     */
    if (LevelProperties.isTutorial(this.level)) {
      this.tutorial = true;
      this.tutorialManager.setup(data, this.scene);
    }
    this.createTilemap();
    this.createEntities(data);
  }

  createTodoList(data:any) {
    this.todoManager.reset();
    if (data.todo) {
      for (let i = 0; i < data.todo.length; i++) {
        const todo = data.todo[i];
        this.todoManager.add(...todo.colors);
      }
      // setup the item display
      this.todoManager.updateLetterDisplay();
      this.todoManager.setMoveIn();
    }
  }

  /**
   * Setup the tile map
   */
  createTilemap() {
    GameController.createTileMapPropertiesForScene(this.scene, {
      map: LevelProperties.getMapForLevel(this.level),
      tileId: "tileset-grass",
      tileIdExtruded: "tileset-extruded"
    });
    const gameController = GameController.instance(this.scene);
    gameController.addTilemapLayer(this.scene, TileUtils.Layer.GRASS, 0, 0);
    gameController.addTilemapLayer(this.scene, TileUtils.Layer.COLLISION, 0, 0);
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

  update(time:number, delta:number) {
    const gameController = GameController.instance(this.scene);
    const inputManager = gameController.getInputManager(this.scene);
    const commandManager = gameController.getCommandManager(this.scene);
    const dialogManager = gameController.getDialogManager(this.scene);

    if (this.play && !this.complete) {
      if (inputManager.isPressed(Phaser.Input.Keyboard.KeyCodes.ENTER)) {
        gameController.emitEvent(SceneConstants.Events.LEVEL_PAUSE);
      }
      // item manager
      this.todoManager.update(time, delta);
    } else if (this.complete) {

      // need to pause for a second then fade to next level
      if (this.endLevelTime > 0) {
        this.endLevelTime -= this.endLevelTimeSpd * delta;

        // todo need to fade out the camera

        if (this.endLevelTime <= 0 ) {
          commandManager.addStatic(CommandType.Level.NEXT_LEVEL);
        }
      }

    } else if (this.startLevelTime > 0) {
      this.startLevelTime -= this.startLevelTimeSpd * delta;
      if (this.startLevelTime <= 0) {
        this.play = true;

        // todo need to fade in the camera

        // hide the level modal
        this.currentLevelModal.setVisible(false);
        this.currentLevelText.setVisible(false);

        // upause dialog manager
        dialogManager.unpause();

        // unpause entities
        if (!this.tutorial) {
          commandManager.addStatic(CommandType.Entity.UNPAUSE);
        }
      }
    }
  }

  postUpdate() {
    // restart level (only when the request to move to next level has not been made)
    // todo remove the restart button
    // const inputManager = GameController.instance(this.scene).getInputManager(this.scene);
    // if (inputManager.isPressed(Phaser.Input.Keyboard.KeyCodes.R) && !this.next) {
    //   // clear all commands
    //   const commandManager = GameController.instance(this.scene).getCommandManager(this.scene);
    //   commandManager.clear();
    //   commandManager.addStatic(CommandType.Entity.PAUSE);
    //   commandManager.addStatic(CommandType.Level.RESTART);
    // }
  }

  /**
   * Returns the current index
   */
  getTodoIndex() : number {
    return this.todoManager.index;
  }

  command(command:Command) {
    const commandManager = GameController.instance(this.scene).getCommandManager(this.scene);

    if (this.tutorial) {
      this.tutorialManager.command(command, this.scene);
    }
    if ((command.type === CommandType.Level.NEXT_LEVEL
      || command.type === CommandType.Level.RESTART || command.type === CommandType.Level.SKIP_SCENE) && !this.next) {
      if (command.type === CommandType.Level.NEXT_LEVEL || (command.type === CommandType.Level.SKIP_SCENE && this.tutorial)) {
        this.level++;
      }
      this.next = true;
      this.tutorial = false;
      this.play = false;

      GameController.instance(this.scene).emitEvent(SceneConstants.Events.START_LEVEL);
    } else if (command.type === CommandType.Level.CHECK_COMBINATION && !this.complete) {
      // level cannot be completed & the color mix must be for the current item index
      const colorMixes = command.data.colorMixes; // holds the colors involved

      for (let i = 0; i < colorMixes.length; i++) {
        const currentMix = this.todoManager.getMix();
        const colorMix = colorMixes[i];

        if (colorMix === currentMix || colorMix.split("").reverse().join("") === currentMix) {
          if (this.todoManager.hasNext()) {
            this.todoManager.next();
          } else {
            this.todoManager.done = true;

            if (!this.tutorial) {
              this.complete = true;

              this.currentLevelModal.setVisible(true);
              this.currentLevelText.setText("Level Complete").setVisible(true);

              this.endLevelTime = this.endLevelTimeMax;

              // pause entities
              commandManager.addStatic(CommandType.Entity.PAUSE);
            }
          }
          this.todoManager.setMoveOut();
          // todo need to play "correct" sound

          break; // ignore the other mixes included
        }
      }
    }
  }

  destroy() {
    this.todoManager.reset();
  }
}