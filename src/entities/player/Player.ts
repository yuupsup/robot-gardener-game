import Phaser, {Scene} from 'phaser';
import {EntityConstants} from "../EntityConstants";
import GameController from "../../GameController";
import MoveEntity from "../MoveEntity";
import TileManager from "../../tile/TileManager";
import EntityManager from "../manager/EntityManager";
import ColorWheel from "./ColorWheel";
import Flower from "../flower/Flower";

/**
 * todo
 *
 * 1. Need to decide how the "tile selector" will be displayed.
 */

export default class Player extends MoveEntity {
  tileSelector:Phaser.GameObjects.Sprite;
  // color wheel
  colorWheel:ColorWheel;

  hold:Flower|null; // entity reference to the flower instance

  constructor(config:any) {
    super(config);
    const scene:Scene = config.scene;

    this.entityType = EntityConstants.Type.PLAYER;
    this.setDisplayOrigin(8, 8);

    // this.getVelocityMax().set(35, 35);
    this.getVelocityMax().set(45, 45);
    this.setAcc(1000);
    this.setDec(1000);

    this.ignoreEntityCollision = true;

    this.createAnimations(scene);

    this.States.IDLE = 0;
    this.currentState = this.States.IDLE;

    this.AnimStates.IDLE = 0;
    this.animState = this.AnimStates.IDLE;


    this.tileSelector = scene.add.sprite(config.x, config.y, 'tile-select');
    this.tileSelector.setDepth(EntityConstants.Depth.TILE_SELECTOR);

    this.colorWheel = new ColorWheel(scene);

    this.hold = null;

    // this.debugAABB.setVisible(true);
    // this.debugAABB.fillColor = 0x99eeff;
  }

  getEntityDepth(): number {
    return EntityConstants.Depth.PLAYER;
  }

  createAnimations(scene:Phaser.Scene) {

  }

  preUpdateCall(time:number, delta:number) {
    super.preUpdateCall(time, delta);

    if (this.paused) {
      return;
    }

    const gameController = GameController.instance(this.scene);
    const inputManager = gameController.getInputManager(this.scene);

    if (inputManager.isDown(Phaser.Input.Keyboard.KeyCodes.LEFT)) {
      this.hdir -= 1;
    }
    if (inputManager.isDown(Phaser.Input.Keyboard.KeyCodes.RIGHT)) {
      this.hdir += 1;
    }

    if (inputManager.isDown(Phaser.Input.Keyboard.KeyCodes.UP)) {
      this.vdir -= 1;
    }
    if (inputManager.isDown(Phaser.Input.Keyboard.KeyCodes.DOWN)) {
      this.vdir += 1;
    }

    this.getVelocity().x = this.updateSpeed(this.getVelocity().x, this.getVelocityMax().x, this.getAcc(), this.getDec(), this.hdir, true, delta);
    this.getVelocity().y = this.updateSpeed(this.getVelocity().y, this.getVelocityMax().y, this.getAcc(), this.getDec(), this.vdir, true, delta);
  }

  update(time: number, delta: number) {
    super.update(time, delta);

    const inputManager = GameController.instance(this.scene).getInputManager(this.scene);

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
    if (inputManager.isPressed(Phaser.Input.Keyboard.KeyCodes.C)) {
      if (flower && flower.pickup && !this.hold) { // pick up
        flower.holder = this;
        this.hold = flower;
      } else if (!flower && this.hold) { // put down
        this.hold.placed(this.x, this.y);

        this.hold.holder = null;
        this.hold = null;
      }
    }
  }

  postUpdate(time: number, delta: number) {
    super.postUpdate(time, delta);

    const vel = this.getVelocity();
    const targetPos = (vel.x === 0 && vel.y === 0) ? TileManager.getTileHalfPosition(this.x, this.y) : {x: this.x, y: this.y};

    this.tileSelector.x += (targetPos.x - this.tileSelector.x) / 10;
    this.tileSelector.y += (targetPos.y - this.tileSelector.y) / 10;
  }
}