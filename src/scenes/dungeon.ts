import { Player } from '../entities/player'
import { Portal } from '../entities/portal'
import { SIZES, SPRITES, TILEMAP_KEYS, TILES } from '../utils'
import dungeon from '@assets/dungeon.json'
import { BaseScene } from './base-scene'

export class Dungeon extends BaseScene {
    player: Player
    constructor() {
        super('Dungeon')
    }

    preload() {
        this.load.spritesheet(SPRITES.PLAYER.BASE, 'src/assets/characters/alliance.png', {
            frameWidth: SIZES.PLAYER.WIDTH,
            frameHeight: SIZES.PLAYER.HEIGHT,
        })

        this.load.spritesheet(SPRITES.PLAYER.FIGHT, 'src/assets/characters/alliance-fight-small.png', {
            frameWidth: SIZES.PLAYER.WIDTH,
            frameHeight: SIZES.PLAYER.HEIGHT,
        })

        this.load.image(TILES.DUNGEON, 'src/assets/tiles-dungeon.png')

        this.load.tilemapTiledJSON(TILEMAP_KEYS.DUNGEON, 'src/assets/dungeon.json')
    }

    create() {
        const map = this.make.tilemap({ key: TILEMAP_KEYS.DUNGEON })
        const tilesetDungeon = map.addTilesetImage(dungeon.tilesets[0].name, TILES.DUNGEON, SIZES.TILE, SIZES.TILE)

        const backgroundLayer = map.createLayer('background', tilesetDungeon!, 0, 0)
        const wayLayer = map.createLayer('way', tilesetDungeon!, 0, 0)
        const lavaLayer = map.createLayer('lava', tilesetDungeon!, 0, 0)

        this.player = new Player({
            scene: this,
            x: 210,
            y: 250,
            textures: { fight: SPRITES.PLAYER.FIGHT, base: SPRITES.PLAYER.BASE },
        })
        // Настройка камеры
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
        this.cameras.main.startFollow(this.player)

        // Ограничиваем перемещение игрока в пределах карты
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
        this.player.setCollideWorldBounds(true)

        
        backgroundLayer.setCollisionByExclusion([-1])
        this.physics.add.collider(this.player, backgroundLayer);

        const portal = new Portal({ scene: this, x: 725, y: 75, textures: { base: SPRITES.PORTAL.BASE }})
        this.physics.add.collider(this.player, portal, () => {
            this.scene.stop();
            this.scene.remove('Dungeon');
            this.scene.start('ElwynnForestScene');
        });

    }

    updateScene() {
        this.player.update()
    }
}
