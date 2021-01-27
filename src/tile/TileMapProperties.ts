import Phaser from 'phaser';

export default class TileMapProperties {
  tilemap:Phaser.Tilemaps.Tilemap|null;
  tileset:Phaser.Tilemaps.Tileset|null;
  tilemapLayers:Map<string, Phaser.Tilemaps.TilemapLayer>;

  constructor(tilemap:Phaser.Tilemaps.Tilemap, tileset:Phaser.Tilemaps.Tileset) {
    this.tilemap = tilemap;
    this.tileset = tileset;
    this.tilemapLayers = new Map<string, Phaser.Tilemaps.TilemapLayer>();
  }

  addTilemapLayer(layerId:string, x:number, y:number) {
    if (!this.tilemapLayers.has(layerId)) {
      this.tilemapLayers.set(layerId, this.tilemap.createLayer(layerId, this.tileset, x, y));
    }
  }

  getTilemapLayer(layerId:string) : Phaser.Tilemaps.TilemapLayer|undefined {
    return this.tilemapLayers.get(layerId);
  }

  destroy() {
    this.tilemapLayers.clear();
    this.tilemap.destroy(); // destroys the tilemap (removes from scene) and destroys tile layers
    this.tilemap = null;
    this.tileset = null;
  }
}