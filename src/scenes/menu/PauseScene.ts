import Phaser from 'phaser';
import GameController from "../../GameController";
import {SceneConstants} from "../SceneConstants";
import {GameConstants} from "../../GameConstants";

export default class PauseScene extends Phaser.Scene {
  pausedText:Phaser.GameObjects.BitmapText|null
  continueText:Phaser.GameObjects.BitmapText|null;
  restartText:Phaser.GameObjects.BitmapText|null;
  skipSceneText:Phaser.GameObjects.BitmapText|null;

  screenOverlay:Phaser.GameObjects.Image|null;

  pausedScene:string; // holds key to the scene that paused

  constructor() {
    super(SceneConstants.Scenes.PAUSE);

    this.pausedText = null;
    this.continueText = null;
    this.restartText = null;
    this.skipSceneText = null;

    this.screenOverlay = null;

    this.pausedScene = "";
  }

  create(data) {
    this.pausedScene = data.pausedScene;
    const gameController = GameController.instance(this);
    gameController.registerSystem(this, SceneConstants.Systems.INPUT);
    gameController.registerSystem(this, SceneConstants.Systems.CAMERA);

    /**
     * Add controls
     */
    const inputManager = gameController.getInputManager(this);
    inputManager.addKey(this, Phaser.Input.Keyboard.KeyCodes.UP);
    inputManager.addKey(this, Phaser.Input.Keyboard.KeyCodes.DOWN);
    inputManager.addKey(this, Phaser.Input.Keyboard.KeyCodes.C); // action button
    inputManager.addKey(this, Phaser.Input.Keyboard.KeyCodes.ENTER);

    /**
     * Text
     */
    this.screenOverlay = this.add.image(0, 0, 'screen-overlay');
    this.screenOverlay.setOrigin(0, 0);
    this.screenOverlay.setDepth(-100);
    this.screenOverlay.alpha = 0.85;

    this.pausedText = this.add.bitmapText(GameConstants.Screen.ROOM_WIDTH * 0.5, GameConstants.Screen.ROOM_HEIGHT * 0.3, GameConstants.Font.FONT, "Paused", GameConstants.Font.SIZE);
    this.pausedText.setOrigin(0.5);
    this.pausedText.setDropShadow(1, 1, 0x211E20, 1);

    this.continueText = this.add.bitmapText(GameConstants.Screen.ROOM_WIDTH * 0.5, GameConstants.Screen.ROOM_HEIGHT * 0.4, GameConstants.Font.FONT, "Continue", GameConstants.Font.SIZE);
    this.continueText.setOrigin(0.5);
    this.continueText.setDropShadow(1, 1, 0x211E20, 1);

    this.restartText = this.add.bitmapText(GameConstants.Screen.ROOM_WIDTH * 0.5, GameConstants.Screen.ROOM_HEIGHT * 0.47, GameConstants.Font.FONT, "Restart", GameConstants.Font.SIZE);
    this.restartText.setOrigin(0.5);
    this.restartText.setDropShadow(1, 1, 0x211E20, 1);

    this.skipSceneText = this.add.bitmapText(GameConstants.Screen.ROOM_WIDTH * 0.5, GameConstants.Screen.ROOM_HEIGHT * 0.47, GameConstants.Font.FONT, "Skip Scene", GameConstants.Font.SIZE);
    this.skipSceneText.setOrigin(0.5);

    if (this.pausedScene === SceneConstants.Scenes.LEVEL) {
      this.skipSceneText.setVisible(false);
    } else {
      this.restartText.setVisible(false);
    }

    /**
     * Events
     */
    this.events.on('wake', function(sys, data) {
      this.pausedScene = data.pausedScene;
    }, this);
  }

  update(time: number, delta: number) {
    super.update(time, delta);
    const gameController = GameController.instance(this);
    const inputManager = gameController.getInputManager(this);
    inputManager.update();

    if (inputManager.isPressed(Phaser.Input.Keyboard.KeyCodes.ENTER)) {
      gameController.emitEvent(SceneConstants.Events.UNPAUSE, {pausedScene: this.pausedScene});
    }
  }
}