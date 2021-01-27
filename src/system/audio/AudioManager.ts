import Phaser from "phaser";
import {AudioConstants} from "./AudioConstants";

export default class AudioManager {
  sfx:Map<string, Phaser.Sound.BaseSound>;

  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene:Phaser.Scene) {
    this.sfx = new Map<string, Phaser.Sound.BaseSound>();
    // this.sfx.set(AudioConstants.SFX.LAND, scene.sound.add(AudioConstants.SFX.LAND, {volume: 0.4}));
    // this.sfx.set(AudioConstants.SFX.BUMP, scene.sound.add(AudioConstants.SFX.BUMP, {volume: 1}));
  }

  /**
   * @param id identifier used to store the sfx
   */
  getSFX(id:string) : Phaser.Sound.BaseSound|undefined {
    return this.sfx.get(id);
  }
}