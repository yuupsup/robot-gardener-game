import Phaser, {Scene} from 'phaser';
import {EntityConstants} from "../EntityConstants";
import GameController from "../../GameController";
import MoveEntity from "../MoveEntity";
import TileManager from "../../tile/TileManager";
import EntityManager from "../manager/EntityManager";
import ColorWheel from "../color/ColorWheel";
import Flower from "../flower/Flower";
import Command from "../../pattern/command/Command";
import {CommandType} from "../../pattern/command/CommandType";
import FlowerManager from "../flower/FlowerManager";

/**
 * todo
 *
 * 1. Need to decide how the "tile selector" will be displayed.
 */

export default class Player extends MoveEntity {
  tileSelector:Phaser.GameObjects.Sprite;
  // gridSelector:Phaser.GameObjects.Image;
  // sprites for the flower placement guide
  tileGuideLeft:Phaser.GameObjects.Sprite;
  tileGuideTop:Phaser.GameObjects.Sprite;
  tileGuideRight:Phaser.GameObjects.Sprite;
  tileGuideBottom:Phaser.GameObjects.Sprite;

  // color wheel
  colorWheel:ColorWheel;

  hold:Flower|null; // entity reference to the flower instance

  /**
   * Properties for tutorial
   * todo should we create a separate Player entity for this?
   */
  tutPickUp:boolean;
  tutPutDown:boolean;
  tutPair:boolean; // pair two flowers

  constructor(config:any) {
    super(config);
    const scene:Scene = config.scene;

    this.entityType = EntityConstants.Type.PLAYER;
    this.setDisplayOrigin(8, 12);

    // this.getVelocityMax().set(45, 45);
    this.getVelocityMax().set(40, 40);
    this.setAcc(1000);
    this.setDec(1000);

    this.ignoreEntityCollision = true;

    this.States.IDLE = 0;
    this.currentState = this.States.IDLE;

    this.AnimStates.IDLE = 0;
    this.animState = this.AnimStates.IDLE;


    this.tileSelector = scene.add.sprite(config.x, config.y, 'tile-select');
    // this.tileSelector.setDepth(EntityConstants.Depth.TILE_SELECTOR);
    // this.tileSelector.setVisible(false);

    this.tileGuideLeft = scene.add.sprite(config.x, config.y, 'tile-flower-guide').setVisible(false);
    this.tileGuideTop = scene.add.sprite(config.x, config.y, 'tile-flower-guide').setVisible(false);
    this.tileGuideRight = scene.add.sprite(config.x, config.y, 'tile-flower-guide').setVisible(false);
    this.tileGuideBottom = scene.add.sprite(config.x, config.y, 'tile-flower-guide').setVisible(false);

    // this.gridSelector = scene.add.sprite(config.x, config.y, 'grid-selector');
    // this.gridSelector.alpha = 0.5;
    // this.gridSelector.setDepth(EntityConstants.Depth.TILE_SELECTOR);

    this.colorWheel = new ColorWheel(scene);

    this.hold = null;

    /**
     * Properties for tutorial
     */
    this.tutPickUp = false;
    this.tutPutDown = false;
    this.tutPair = false;

    this.createAnimations(scene);

    // this.debugAABB.setVisible(true);
    // this.debugAABB.fillColor = 0x99eeff;
  }

  getEntityDepth(): number {
    return EntityConstants.Depth.PLAYER;
  }

  createAnimations(scene:Phaser.Scene) {
    scene.anims.create({
      key: 'idle',
      repeat: -1,
      frames: this.anims.generateFrameNumbers('player', {start: 0, end: 1}),
      frameRate: 3
    });
    scene.anims.create({
      key: 'idle-hold',
      repeat: -1,
      frames: this.anims.generateFrameNumbers('player', {start: 6, end: 7}),
      frameRate: 3
    });
    scene.anims.create({
      key: 'walk',
      repeat: -1,
      frames: this.anims.generateFrameNumbers('player', {start: 2, end: 5}),
      frameRate: 4
    });
    scene.anims.create({
      key: 'walk-hold',
      repeat: -1,
      frames: this.anims.generateFrameNumbers('player', {start: 8, end: 11}),
      frameRate: 4
    });
    this.anims.play('idle');

    /**
     * Selector
     */
    scene.anims.create({
      key: 'guide',
      repeat: -1,
      frames: this.tileGuideLeft.anims.generateFrameNumbers('tile-flower-guide', {start: 0, end: 3}),
      frameRate: 4
    });
    this.tileGuideLeft.anims.play('guide');
  }

  preUpdateCall(time:number, delta:number) {
    super.preUpdateCall(time, delta);

    /**
     * Tutorial logic
     */
    if (this.tutPutDown) {
      // do not allow movement as in the tutorial a flower is created
      // and we don't want the player to put the flower in the same position
      // as the generated flower
      this.getVelocity().x = 0;
      this.getVelocity().y = 0;
      return;
    }

    if (this.paused) {
      return;
    }

    const gameController = GameController.instance(this.scene);
    const inputManager = gameController.getInputManager(this.scene);

    if (inputManager.isDown(Phaser.Input.Keyboard.KeyCodes.LEFT)) {
      this.hdir -= 1;
      this.dir = -1;
    }
    if (inputManager.isDown(Phaser.Input.Keyboard.KeyCodes.RIGHT)) {
      this.hdir += 1;
      this.dir = 1;
    }

    if (inputManager.isDown(Phaser.Input.Keyboard.KeyCodes.UP)) {
      this.vdir -= 1;
    }
    if (inputManager.isDown(Phaser.Input.Keyboard.KeyCodes.DOWN)) {
      this.vdir += 1;
    }

    this.setFlipX(this.dir < 0);

    this.getVelocity().x = this.updateSpeed(this.getVelocity().x, this.getVelocityMax().x, this.getAcc(), this.getDec(), this.hdir, true, delta);
    this.getVelocity().y = this.updateSpeed(this.getVelocity().y, this.getVelocityMax().y, this.getAcc(), this.getDec(), this.vdir, true, delta);
  }

  update(time: number, delta: number) {
    super.update(time, delta);

    const inputManager = GameController.instance(this.scene).getInputManager(this.scene);
    const commandManager = GameController.instance(this.scene).getCommandManager(this.scene);

    // is flower in current tile position?
    const flower:any = EntityManager.instance(this.scene).getEntityAtGridPosition(this.x, this.y, EntityConstants.Type.FLOWER, this.hold);
    if (flower) {
      // show the color wheel
      const pos = TileManager.getTileHalfPosition(this.x, this.y);
      this.colorWheel.show(pos, flower.color);
    } else {
      // hide the color wheel
      this.colorWheel.hide();
    }
    // pickup/put down action
    if (!this.paused && inputManager.isPressed(Phaser.Input.Keyboard.KeyCodes.C)) {
      if (flower && flower.pickup && !this.hold) { // pick up
        flower.holder = this;
        this.hold = flower;

        /**
         * For tutorial purposes
         */
        if (this.tutPickUp) {
          commandManager.addStatic(CommandType.Level.TUTORIAL_PICK_UP);
          commandManager.addStatic(CommandType.Entity.PAUSE);
          this.tutPickUp = false;
        }
      } else if (!flower && this.hold) { // put down
        const success = this.hold.placed(this.x, this.y);

        this.hold.holder = null;
        this.hold = null;

        /**
         * For tutorial purposes
         */
        if (this.tutPutDown) {
          commandManager.addStatic(CommandType.Level.TUTORIAL_PUT_DOWN);
          commandManager.addStatic(CommandType.Entity.PAUSE);
          this.tutPutDown = false;
        }
        if (this.tutPair && success) {
          commandManager.addStatic(CommandType.Level.TUTORIAL_PAIR_FLOWERS);
          commandManager.addStatic(CommandType.Entity.PAUSE);
          this.tutPair = false;
        }
      }
    }
    // display the selector where the flower will be created
    if (this.hold) {
      // create the adjacent instance
      const left:any = FlowerManager.getFlowerPropertiesForNewInstance(this.hold, -1,  0, this.scene) // left
      const top:any = FlowerManager.getFlowerPropertiesForNewInstance(this.hold, 0, -1, this.scene) // top
      const right:any = FlowerManager.getFlowerPropertiesForNewInstance(this.hold, 1,  0, this.scene) // right
      const bottom:any = FlowerManager.getFlowerPropertiesForNewInstance(this.hold, 0,  1, this.scene) // bottom

      if (left) {
        this.tileGuideLeft.setPosition(left.position.x, left.position.y).setVisible(true);
        this.tileGuideLeft.anims.play('guide', true);
      } else {
        this.tileGuideLeft.setVisible(false);
      }
      if (top) {
        this.tileGuideTop.setPosition(top.position.x, top.position.y).setVisible(true);
        this.tileGuideTop.anims.play('guide', true);
      } else {
        this.tileGuideTop.setVisible(false);
      }
      if (right) {
        this.tileGuideRight.setPosition(right.position.x, right.position.y).setVisible(true);
        this.tileGuideRight.anims.play('guide', true);
      } else {
        this.tileGuideRight.setVisible(false);
      }
      if (bottom) {
        this.tileGuideBottom.setPosition(bottom.position.x, bottom.position.y).setVisible(true);
        this.tileGuideBottom.anims.play('guide', true);
      } else {
        this.tileGuideBottom.setVisible(false);
      }
    } else {
      // todo hide the selector
      this.tileGuideLeft.setVisible(false);
      this.tileGuideTop.setVisible(false);
      this.tileGuideRight.setVisible(false);
      this.tileGuideBottom.setVisible(false);
    }
  }

  postUpdate(time: number, delta: number) {
    super.postUpdate(time, delta);
    const vel = this.getVelocity();

    // animations
    if (vel.x === 0 && vel.y === 0) {
      this.anims.play(this.hold ? 'idle-hold' : 'idle', true);
    } else {
      this.anims.play(this.hold ? 'walk-hold' : 'walk', true);
    }
    // update selector position
    const targetPos = TileManager.getTileHalfPosition(this.x, this.y);
    this.tileSelector.x += (targetPos.x - this.tileSelector.x) / 8;
    this.tileSelector.y += (targetPos.y - this.tileSelector.y) / 8;
  }

  getGridPosition() : any {
    return TileManager.getTilePosition(this.x, this.y);
  }

  command(command: Command) {
    super.command(command);
    /**
     * Tutorial
     */
    if (command.type === CommandType.Player.TUTORIAL_PICK_UP) {
      this.tutPickUp = true;
    } else if (command.type === CommandType.Player.TUTORIAL_PUT_DOWN) {
      this.tutPutDown = true;
    } else if (command.type === CommandType.Player.TUTORIAL_PAIR_FLOWERS) {
      this.tutPair = true;
    }
  }

  destroy() {
    super.destroy();
    this.tileSelector.destroy();
    this.colorWheel.destroy();
  }
}