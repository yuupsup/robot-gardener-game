import Phaser from 'phaser';
import {ColorConstants} from "./ColorConstants";
import {EntityConstants} from "../EntityConstants";

export default class ColorWheel {
  sprite:Phaser.GameObjects.Sprite;
  offset:Phaser.Math.Vector2;
  constructor(scene:Phaser.Scene) {
    this.sprite = scene.add.sprite(0, 0, 'flower');
    this.offset = new Phaser.Math.Vector2(-1, -18);
    this.sprite.setDepth(EntityConstants.Depth.COLOR_WHEEL)
    this.sprite.setVisible(false);

    this.createAnimations(scene);
  }

  createAnimations(scene:Phaser.Scene) {
    scene.anims.create({
      key: 'color-wheel',
      repeat: 0,
      frames: scene.anims.generateFrameNumbers('color-wheel', {start: 0, end: 6}),
      frameRate: 0
    });
  }

  show(pos:Phaser.Math.Vector2|any, color:number) {
    if (color !== ColorConstants.Color.NONE) {
      const anim = this.sprite.scene.anims.get('color-wheel');
      this.sprite.anims.setCurrentFrame(anim.frames[color]);
    }
    this.sprite.setPosition(pos.x + this.offset.x, pos.y + this.offset.y);
    this.sprite.setVisible(true);
  }

  hide() {
    this.sprite.setVisible(false);
  }
}