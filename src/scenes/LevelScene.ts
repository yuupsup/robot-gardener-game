import Phaser from 'phaser';
import {SceneConstants} from "./SceneConstants";
import {CommandType} from "../pattern/command/CommandType";
import GameController from "../GameController";
import EntityManager from "../entities/manager/EntityManager";
import {GameConstants} from "../GameConstants";

export default class LevelScene extends Phaser.Scene {
  entityManager:EntityManager;

  constructor() {
    super(SceneConstants.Scenes.LEVEL);
    this.entityManager = new EntityManager(this);
  }

  create() {
    const gameController = GameController.instance(this);
    gameController.registerSystem(this, SceneConstants.Systems.INPUT);
    gameController.registerSystem(this, SceneConstants.Systems.CAMERA);
    gameController.registerSystem(this, SceneConstants.Systems.COMMAND);
    gameController.registerSystem(this, SceneConstants.Systems.DIALOG);
    gameController.registerSystem(this, SceneConstants.Systems.LEVEL);

    /**
     * Add static commands
     */
    const commandManager = gameController.getCommandManager(this);
    commandManager.setStatic(CommandType.Entity.PAUSE);
    commandManager.setStatic(CommandType.Entity.UNPAUSE);
    commandManager.setStatic(CommandType.Level.NEXT_LEVEL);
    commandManager.setStatic(CommandType.Level.RESTART);
    commandManager.setStatic(CommandType.Level.TUTORIAL_PICK_UP);
    commandManager.setStatic(CommandType.Level.TUTORIAL_PUT_DOWN);
    commandManager.setStatic(CommandType.Player.TUTORIAL_PICK_UP);
    commandManager.setStatic(CommandType.Player.TUTORIAL_PUT_DOWN);

    /**
     * Add controls
     */
    const inputManager = gameController.getInputManager(this);
    if (inputManager) {
      inputManager.addKey(this, Phaser.Input.Keyboard.KeyCodes.LEFT);
      inputManager.addKey(this, Phaser.Input.Keyboard.KeyCodes.RIGHT);
      inputManager.addKey(this, Phaser.Input.Keyboard.KeyCodes.UP);
      inputManager.addKey(this, Phaser.Input.Keyboard.KeyCodes.DOWN);
      inputManager.addKey(this, Phaser.Input.Keyboard.KeyCodes.C);
      inputManager.addKey(this, Phaser.Input.Keyboard.KeyCodes.R);
      inputManager.addKey(this, Phaser.Input.Keyboard.KeyCodes.ENTER);

      inputManager.enableMouse(this);
    }

    /**
     * Animations
     */
    this.createAnimations();

    /**
     * Camera
     */
    gameController.getCameraManager(this).getCamera().setBounds(0, 0, GameConstants.Screen.ROOM_WIDTH, GameConstants.Screen.ROOM_HEIGHT);

    /**
     * Level Manager
     */
    gameController.getLevelManager(this).createLevel();


    /**
     * Debugging purposes
     * Displays a grid on the scene
     */
    this.add.grid(0, 0, GameConstants.Screen.ROOM_WIDTH, GameConstants.Screen.ROOM_HEIGHT, GameConstants.Tile.SIZE, GameConstants.Tile.SIZE, 0xe9efec).setAltFillStyle(0xe9efec).setOutlineStyle().setOrigin(0, 0).setDepth(-100);

    const textbox = this.add.image(GameConstants.Screen.ROOM_WIDTH * 0.5, GameConstants.Screen.ROOM_HEIGHT - 32, 'textbox');

    /**
     * Events
     */
    gameController.onEvent(SceneConstants.Events.START_LEVEL, (function (self:LevelScene) {
      return function () {
        // 1. entity manager
        // 2. tile map
        self.entityManager.destroy();
        const gameController = GameController.instance(self);
        gameController.destroyTilemap(self);
        gameController.getLevelManager(self).createLevel();
      };
    })(this), null);

    gameController.onEvent(SceneConstants.Events.LEVEL_PAUSE, (function (self:Phaser.Scene) {
      return function () {
        self.scene.pause(SceneConstants.Scenes.LEVEL);
        GameController.instance(self).emitEvent(SceneConstants.Events.PAUSE, {pausedScene: self.scene.key});
      };
    })(this), null);

    gameController.onEvent(SceneConstants.Events.LEVEL_RESUME, (function (self:Phaser.Scene) {
      return function () {
        self.scene.resume(SceneConstants.Scenes.LEVEL);
      };
    })(this), null);
  }

  createAnimations() {
    /**
     * Flowers
     * todo for debugging flowers have actual colors, when done debugging the flowers will have no color
     */
    this.anims.create({
      key: 'flower',
      repeat: -1,
      frames: this.anims.generateFrameNumbers('flower', {start: 0, end: 1}),
      frameRate: 3
    });

    /**
     * Color Letters
     */
    this.anims.create({
      key: 'color-letters',
      repeat: 0,
      frames: this.anims.generateFrameNumbers('color-letters', {start: 0, end: 6}),
      frameRate: 0
    });
  }

  update(time: number, delta: number) {
    super.update(time, delta);

    this.entityManager.update(time, delta * 0.001);

    const commandManager = GameController.instance(this).getCommandManager(this);
    if (commandManager) {
      commandManager.lateUpdate();
    }
  }
}