import Phaser from 'phaser';
import {EntityConstants} from "./EntityConstants";
import {CommandType} from "../pattern/command/CommandType";
import AABB from "../collision/AABB";
import Command from "../pattern/command/Command";
import EntityManager from "./manager/EntityManager";

export default class Entity extends Phaser.Physics.Arcade.Sprite {
  id:number;
  entityType:number;
  isEntity:boolean;
  groupId:string;

  transformProperties:any;
  grid:boolean; // entity snapped to grid

  dimension:Phaser.Math.Vector2; // width and height
  offset:Phaser.Math.Vector2;

  spd:number; // speed

  hdir:number; // horizontal (input) direction
  vdir:number; // vertical (input) direction
  dir:number; // entity direction

  moveable:boolean;

  paused:boolean; // entity is paused

  aabb:AABB;
  debugAABB:Phaser.GameObjects.Rectangle;

  States:any;
  currentState:number;

  AnimStates:any;
  animState:number;

  constructor(config:any) {
    super(config.scene, config.x, config.y, config.texture);

    this.id = config.id;
    this.entityType = EntityConstants.Type.NONE;
    this.isEntity = true;
    this.groupId = config.group || "";

    this.transformProperties = {};

    this.offset = new Phaser.Math.Vector2(config.xoffset || 0, config.yoffset || 0);
    this.dimension = new Phaser.Math.Vector2(config.width || 0, config.height || 0);

    this.spd = 0;

    this.hdir = 0;
    this.vdir = 0;
    this.dir = 1;

    this.moveable = true;

    this.aabb = AABB.create({x: config.x, y: config.y}, this.offset, this.dimension.x, this.dimension.y);

    const scene:Phaser.Scene = config.scene;
    this.debugAABB = scene.add.rectangle(this.aabb.x, this.aabb.y, this.aabb.width, this.aabb.height, 0xFF0000, 0.5);
    this.debugAABB.setOrigin(0, 0);
    this.debugAABB.setDepth(1000);
    this.debugAABB.setVisible(false);

    this.States = {};
    this.currentState = null;

    this.AnimStates = {};
    this.animState = null;

    // add the entities
    const entityManager = EntityManager.instance(config.scene);
    entityManager.addEntityToAdd(this, config.scene, true, this.groupId);
  }

  setup() {
    this.body.setSize(this.dimension.x, this.dimension.y);
    this.updateBody();
  }

  createAnimations(scene:Phaser.Scene) {

  }

  /**
   * Returns properties pertaining to this entity
   */
  getProperties() : any {
    return {};
  }

  getEntityDepth() : number {
    return 0;
  }

  getWidth() : number {
    return this.dimension.x;
  }

  getHeight() : number {
    return this.dimension.y;
  }

  isMoveable() : boolean {
    return this.moveable && !this.paused;
  }

  // eslint-disable-next-line no-unused-vars
  preUpdateCall(time:number, delta:number) {
    this.hdir = 0;
    this.vdir = 0;
  }

  update(time:number, delta:number) {
    super.update(time, delta);

    // for static bodies only
    this.updateBody();
  }

  // eslint-disable-next-line no-unused-vars
  postUpdate(time:number, delta:number) {
    this.setDepth(this.y + this.getEntityDepth());
  }

  updateBody(pos:any = null) {
    if (pos) {
      this.x = pos.x !== undefined ? pos.x : this.x;
      this.y = pos.y !== undefined ? pos.y : this.y;
    } else {
      this.body.x = this.x - this.offset.x;
      this.body.y = this.y - this.offset.y;
    }
    this.body.updateCenter();
  }

  command(command:Command) {
    if (command.type === CommandType.Entity.PAUSE) {
      this.paused = true;
    } else if (command.type === CommandType.Entity.UNPAUSE) {
      this.paused = false;
    }
  }
}