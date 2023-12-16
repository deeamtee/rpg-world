import durotarJSON from "@assets/durotar.json";
import { SPRITES, SIZES, TILES } from "../utils";
import { Player } from "../entities/player";

export class DurotarScene extends Phaser.Scene {
    private player?: Player;

    constructor() {
      super('DurotarScene');
    }
  
    preload() {
      this.load.image(TILES.DURATOR, "src/assets/durotar.png");
      this.load.tilemapTiledJSON("map", "src/assets/durotar.json");
      this.load.spritesheet(SPRITES.PLAYER, 'src/assets/characters/alliance.png', {
        frameWidth: SIZES.PLAYER.WIDTH,
        frameHeight: SIZES.PLAYER.HEIGHT,
    })
    }
  
    create() {
        const map = this.make.tilemap({ key: "map" });
        const tileset = map.addTilesetImage(durotarJSON.tilesets[0].name, TILES.DURATOR, SIZES.TILE, SIZES.TILE);
        const groundLayer = map.createLayer("ground", tileset!, 0, 0);
        const wallsLayer = map.createLayer("walls", tileset!, 0, 0);

        this.player = new Player(this, 400, 250, SPRITES.PLAYER);

    }

    update(){
      this.player.update();
    }
  }