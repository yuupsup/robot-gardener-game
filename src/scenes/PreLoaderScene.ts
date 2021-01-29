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
    //this.load.image("tileset-extruded", "assets/images/tileset-extruded.png");
    this.load.image("tileset-extruded", "assets/images/tileset-grass-extruded.png");

    /**
     * Levels
     */
    this.load.json("tutorial", "levels/tutorial.json");
    this.load.json("level1", "levels/level1.json");
    this.load.json("level2", "levels/level2.json");
    this.load.json("gameover", "levels/gameover.json");

    /**
     * Images
     */
    // this.load.image("textbox", "assets/images/textbox.png");
    this.load.image("textbox", "assets/images/textbox-2.png");
    this.load.image("screen-overlay", "assets/images/screen-overlay.png");
    this.load.image("todo-item", "assets/images/todo-item.png");
    this.load.image("cross", "assets/images/cross.png");
    this.load.image("grid-selector", "assets/images/grid-selector.png");

    /**
     * Sprites
     */
    this.load.spritesheet("player", "assets/images/robot.png", {frameWidth: 16, frameHeight: 16});
    this.load.spritesheet("flower", "assets/images/flower.png", {frameWidth: 16, frameHeight: 16});
    // this.load.spritesheet("tile-select", "assets/images/tile-select.png", {frameWidth: 20, frameHeight: 20});
    this.load.spritesheet("tile-select", "assets/images/tile-select2.png", {frameWidth: 16, frameHeight: 16});
    this.load.spritesheet("color-wheel", "assets/images/color-wheel.png", {frameWidth: 17, frameHeight: 17});
    this.load.spritesheet("color-letters", "assets/images/color-letters.png", {frameWidth: 5, frameHeight: 6});
    /**
     * SFX
     */
    // this.load.audio("land", "assets/sfx/land.ogg");
    // this.load.audio("bump", "assets/sfx/bump.mp3");
    // this.load.audio("song", "assets/sfx/song.mp3");
    /**
     * Font
     */
    this.load.bitmapFont('pixilator', "assets/fonts/pixilator.png", "assets/fonts/pixilator.xml");
    this.load.bitmapFont('pixilator-black', "assets/fonts/pixilator-black.png", "assets/fonts/pixilator-black.xml");
  }

  create() {
    this.scene.start(SceneConstants.Scenes.GAME);
  }
}