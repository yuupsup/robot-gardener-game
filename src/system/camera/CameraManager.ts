import Phaser from "phaser";
import {CommandType} from "../../pattern/command/CommandType";
import CameraTarget from "./CameraTarget";
import Entity from "../../entities/Entity";
import Command from "../../pattern/command/Command";

export default class CameraManager {
  scene:Phaser.Scene;
  camera:Phaser.Cameras.Scene2D.Camera;
  cameraTarget:CameraTarget;

  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene:Phaser.Scene) {
    this.scene = scene;
    this.camera = scene.cameras.main;
    // todo need to set the camera bounds for the room
    // this.camera.setBounds(0, 0, GameConstants.ROOM_WIDTH, GameConstants.ROOM_HEIGHT);

    this.cameraTarget = new CameraTarget(scene);
  }

  getCamera() {
    return this.camera;
  }

  setTargetFollow(gameObject:Entity|null) {
    this.cameraTarget.setFollow(gameObject);
  }

  setTargetPosition(x:number, y:number) {
    this.cameraTarget.setPosition(x, y);
  }

  /**
   * @param {Command} command
   */
  command(command:Command) {
    // if (command.type === CommandType.PLAYER_DEAD) {
    //   if (command.data) {
    //     const playerId: number = command.data.id;
    //     if (this.cameraTarget.isFollow(playerId)) {
    //       this.cameraTarget.setFollow(null);
    //     }
    //   }
    // }
  }

  update() {
    this.cameraTarget.update(this.scene, this.camera, true);
    this.camera.centerOn(this.cameraTarget.target.x, this.cameraTarget.target.y);
  }

  destroy() {

  }
}