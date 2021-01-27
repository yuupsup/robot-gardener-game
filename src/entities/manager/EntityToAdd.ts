import Phaser from 'phaser';
import Entity from "../Entity";

export default class EntityToAdd {
  entity:Entity;
  scene:Phaser.Scene;
  isStatic:boolean;
  groupId:string|null;

  constructor(entity:Entity, scene:Phaser.Scene, isStatic:boolean, groupId:string|null) {
    this.entity = entity;
    this.scene = scene;
    this.isStatic = isStatic;
    this.groupId = groupId;
  }
}