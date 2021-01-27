import Phaser from "phaser";
import Entity from "./Entity";
import TileManager from "../tile/TileManager";

export default class GridEntity extends Entity {
  constructor(config) {
    super(config);

    this.grid = true;

    const pos = TileManager.getTilePosition(config.x || 0, config.y || 0);
    this.transformProperties.gridPosition = new Phaser.Math.Vector2(pos);
    this.transformProperties.gridPrevPosition = new Phaser.Math.Vector2(pos);
  }

  getGridPosition() : Phaser.Math.Vector2 {
    return this.transformProperties.gridPosition;
  }

  getGridPrevPosition() : Phaser.Math.Vector2 {
    return this.transformProperties.gridPrevPosition;
  }

  preUpdateCall(time: number, delta: number) {
    super.preUpdateCall(time, delta);
    this.getGridPrevPosition().copy(this.getGridPosition());
  }
}