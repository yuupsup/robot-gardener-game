import Phaser from "phaser";
import {SceneConstants} from "./SceneConstants";
export default class PreLoaderScene extends Phaser.Scene {
  constructor() {
    super(SceneConstants.Scenes.PRELOADER);
  }

  preload() {
    /**
     * Tile maps
     */
    this.load.tilemapTiledJSON("map", "assets/maps/map.json");
    this.load.image("tileset-extruded", "assets/images/tileset-extruded.png");

    /**
     * Levels
     */
    this.load.json("level1", "levels/level1.json");

    /**
     * Sprites
     */
    this.load.spritesheet("player", "assets/images/player-mask.png", {frameWidth: 16, frameHeight: 16});
    this.load.spritesheet("flower", "assets/images/flower.png", {frameWidth: 16, frameHeight: 16});
    // this.load.spritesheet("tile-select", "assets/images/tile-select.png", {frameWidth: 20, frameHeight: 20});
    this.load.spritesheet("tile-select", "assets/images/tile-select2.png", {frameWidth: 16, frameHeight: 16});
    this.load.spritesheet("color-wheel", "assets/images/color-wheel.png", {frameWidth: 17, frameHeight: 17});
    /**
     * SFX
     */
    // this.load.audio("land", "assets/sfx/land.ogg");
    // this.load.audio("bump", "assets/sfx/bump.mp3");
    // this.load.audio("song", "assets/sfx/song.mp3");
    /**
     * Font
     */
    // this.load.bitmapFont('dogica', "assets/font/dogica.png", "assets/font/dogica.xml");
  }

  create() {
    this.scene.start(SceneConstants.Scenes.GAME);
  }
}