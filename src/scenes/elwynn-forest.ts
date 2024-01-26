import elvinForest from '@assets/elwynn.json'
import { SPRITES, SIZES, TILES, GAME_CONFIG } from '../utils'
import { Player } from '../entities/player'
import { Enemy } from '../entities/enemy'

export class ElwynnForestScene extends Phaser.Scene {
    private player?: Player;
    private boar?: Enemy;

    constructor() {
        super('ElwynnForestScene')
    }

    preload() {
        this.load.image(TILES.ELVIN_FOREST, 'src/assets/summer_tiles.png')
        this.load.tilemapTiledJSON('map', 'src/assets/elwynn.json')
        this.load.spritesheet(SPRITES.PLAYER.BASE, 'src/assets/characters/alliance.png', {
            frameWidth: SIZES.PLAYER.WIDTH,
            frameHeight: SIZES.PLAYER.HEIGHT,
        })
        this.load.spritesheet(SPRITES.PLAYER.FIGHT, 'src/assets/characters/alliance-fight.png', {
            frameWidth: 64,
            frameHeight: 64,
        })
        this.load.spritesheet(SPRITES.BOAR, 'src/assets/characters/boar.png', {
            frameWidth: SIZES.SCORPION.WIDTH,
            frameHeight: SIZES.SCORPION.HEIGHT,
        })
    }

    create() {
        const map = this.make.tilemap({ key: 'map' })
        const tileset = map.addTilesetImage(elvinForest.tilesets[0].name, TILES.ELVIN_FOREST, SIZES.TILE, SIZES.TILE)
        const groundLayer = map.createLayer('ground', tileset!, 0, 0)
        const wallsLayer = map.createLayer('walls', tileset!, 0, 0)

        this.boar = new Enemy({scene: this, x: 600, y: 400, texture: SPRITES.BOAR });
        this.player = new Player({scene: this, x: 400, y: 250, texture: SPRITES.PLAYER.BASE, textures: { fight: SPRITES.PLAYER.FIGHT}})
        this.boar.setPlayer(this.player);
        this.player.setEnemies([this.boar]);
        // Настройка камеры
        this.cameras.main.setBounds(0, 0, GAME_CONFIG.MAP_WIDTH, GAME_CONFIG.MAP_HEIGHT)
        this.cameras.main.startFollow(this.player)

        // Ограничиваем перемещение игрока в пределах карты
        this.physics.world.setBounds(0, 0, GAME_CONFIG.MAP_WIDTH, GAME_CONFIG.MAP_HEIGHT)
        this.player.setCollideWorldBounds(true)

        wallsLayer.setCollisionByExclusion([-1])
        this.physics.add.collider(this.player, wallsLayer)
    }

    update(time, delta) {
        this.player.update(time, delta)
        this.boar.update()
    }
}
