import Phaser from "phaser";
import Entity from "./Entity";
import CollisionManager from "../collision/CollisionManager";
import {GameConstants} from "../GameConstants";
import {TileUtils} from "../tile/TileUtils";
import {CollisionResolve} from "../collision/CollisionResolve";

export default class MoveEntity extends Entity {
  ignoreEntityCollision:boolean;

  constructor(config) {
    super(config);

    this.transformProperties.position = new Phaser.Math.Vector2(config.x || 0, config.y || 0);
    this.transformProperties.prevPosition = new Phaser.Math.Vector2(config.x || 0, config.y || 0);
    this.transformProperties.velocity = new Phaser.Math.Vector2(0, 0);
    this.transformProperties.prevVelocity = new Phaser.Math.Vector2(0, 0);
    this.transformProperties.velocityMax = new Phaser.Math.Vector2(0, 0);

    this.transformProperties.acc = 0;
    this.transformProperties.dec = 0;
  }

  getPosition() : Phaser.Math.Vector2 {
    return this.transformProperties.position;
  }

  getPrevPosition() : Phaser.Math.Vector2 {
    return this.transformProperties.prevPosition;
  }

  getVelocity() : Phaser.Math.Vector2 {
    return this.transformProperties.velocity;
  }

  getVelocityMax() : Phaser.Math.Vector2 {
    return this.transformProperties.velocityMax;
  }

  getAcc() : number {
    return this.transformProperties.acc;
  }

  setAcc(value:number) {
    this.transformProperties.acc = value;
  }

  getDec() : number {
    return this.transformProperties.dec;
  }

  setDec(value:number) {
    this.transformProperties.dec = value;
  }

  update(time: number, delta: number) {
    super.update(time, delta);

    if (this.isMoveable()) {
      const result = CollisionManager.sweptCollision(this.aabb, this.getPosition(), this.getVelocity(), this.id, delta,
        GameConstants.Screen.ROOM_WIDTH,
        GameConstants.Screen.ROOM_HEIGHT, CollisionResolve.SLIDE, TileUtils.Layer.COLLISION, this.ignoreEntityCollision, this.scene);

      this.updateTransform(result.position, result.velocity);
    }
  }

  /**
   * Returns updated speed value
   * @param _spd
   * @param _spdMax
   * @param _acc
   * @param _dec
   * @param _dir direction
   * @param ground
   * @param delta
   */
  updateSpeed(_spd:number, _spdMax:number, _acc:number, _dec:number, _dir:number, ground:boolean = true, delta:number) {
    let result = _spd;

    if (_dir !== 0) {
      // apply acceleration to the entity
      if (_dir > 0) {
        result = Phaser.Math.Clamp(result + _acc * delta, -_spdMax, _spdMax);
      } else {
        result = Phaser.Math.Clamp(result - _acc * delta, -_spdMax, _spdMax);
      }
    } else if (ground) {
      // apply deceleration to the entity
      if (_spd > 0) {
        result = Phaser.Math.Clamp(result - _dec * delta, 0, result);
      } else if (_spd < 0) {
        result = Phaser.Math.Clamp(result + _dec * delta, result, 0);
      }
    }
    return result;
  }

  updateTransform(pos:Phaser.Math.Vector2|any, vel:Phaser.Math.Vector2|any=undefined) {
    this.getPrevPosition().copy(this.getPosition());

    this.getPosition().set(pos.x, pos.y);

    // update the sprites position
    this.x = pos.x;
    this.y = pos.y;

    // update the bounds
    this.aabb.update(this.getPosition());

    if (vel) {
      this.getVelocity().set(vel.x, vel.y);
    }
  }
}