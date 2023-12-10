import durotarJSON from "@assets/durotar.json";

export class DurotarScene extends Phaser.Scene {
    constructor() {
      super('DurotarScene');
    }
  
    preload() {
      this.load.image("tiles", "src/assets/durotar.png");
      this.load.tilemapTiledJSON("map", "src/assets/durotar.json");
    }
  
    create() {
        const map = this.make.tilemap({ key: "map" });
        const tileset = map.addTilesetImage(durotarJSON.tilesets[0].name, "tiles", 32, 32);
        const groundLayer = map.createLayer("ground", tileset!, 0, 0);
    }
  }