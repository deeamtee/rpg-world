import elvinForest from '@assets/elwynn.json'
import { SPRITES, SIZES, TILES, TILEMAP_KEYS } from '../utils'
import { Player } from '../entities/player'
import { Enemy } from '../entities/enemy'
import { BaseScene } from './base-scene'
import { Dungeon } from './dungeon'
import { Portal } from '../entities/portal'
import socket from '../utils/socket'
import { PlayerData } from '../types/player-data'

export class ElwynnForestScene extends BaseScene {
    private player: Player;
    private boar?: Enemy;
    private boarSecond?: Enemy;
    private boarThird: Enemy
    killsCounter: number = 0;
    killsText: Phaser.GameObjects.Text;

    constructor() {
        super('ElwynnForestScene');
    }

    private createOtherPlayer = (playerData: PlayerData) => {
        const otherPlayer = new Player({
            scene: this,
            x: playerData.x,
            y: playerData.y,
            textures: { fight: SPRITES.PLAYER.FIGHT, base: SPRITES.PLAYER.BASE },
            isRemote: true,
        });
        otherPlayer.setTint(0x00bfff);
        otherPlayer.setDepth(1);
        let lastX = playerData.x;
        let lastY = playerData.y;
        let lastDirection = '';
        return {
            id: playerData.id,
            x: playerData.x,
            y: playerData.y,
            destroy: () => otherPlayer.destroy(),
            setPosition: (x: number, y: number) => {
                // Определяем направление движения
                const dx = x - lastX;
                const dy = y - lastY;
                let direction = lastDirection;
                if (dx !== 0 || dy !== 0) {
                    if (Math.abs(dx) > Math.abs(dy)) {
                        direction = dx > 0 ? 'right' : 'left';
                    } else {
                        direction = dy > 0 ? 'down' : 'up';
                    }
                    // Устанавливаем кадр/направление без анимации
                    if (direction !== lastDirection) {
                        otherPlayer.setDirectionFrame?.(direction as 'up' | 'down' | 'left' | 'right');
                        lastDirection = direction;
                    }
                }
                otherPlayer.x = x;
                otherPlayer.y = y;
                lastX = x;
                lastY = y;
            },
        };
    };

    preload() {
        this.load.image(TILES.ELVIN_FOREST, 'src/assets/summer_tiles.png')

        this.load.tilemapTiledJSON(TILEMAP_KEYS.ELVIN_FOREST, 'src/assets/elwynn.json')
        this.load.spritesheet(SPRITES.PLAYER.BASE, 'src/assets/characters/alliance.png', {
            frameWidth: SIZES.PLAYER.WIDTH,
            frameHeight: SIZES.PLAYER.HEIGHT,
        })
        this.load.spritesheet(SPRITES.PLAYER.FIGHT, 'src/assets/characters/alliance-fight-small.png', {
            frameWidth: SIZES.PLAYER.WIDTH,
            frameHeight: SIZES.PLAYER.HEIGHT,
        })
        this.load.spritesheet(SPRITES.BOAR, 'src/assets/characters/boar.png', {
            frameWidth: SIZES.BOAR.WIDTH,
            frameHeight: SIZES.BOAR.HEIGHT,
        })
        this.load.spritesheet(SPRITES.PORTAL.BASE, 'src/assets/portal.png', {
            frameWidth: 32,
            frameHeight: 32,
        })
    }

    create() {
        const map = this.make.tilemap({ key: TILEMAP_KEYS.ELVIN_FOREST })
        const tilesetElwynn = map.addTilesetImage(
            elvinForest.tilesets[0].name,
            TILES.ELVIN_FOREST,
            SIZES.TILE,
            SIZES.TILE
        )

        const groundLayer = map.createLayer('ground', tilesetElwynn!, 0, 0)
        const wallsLayer = map.createLayer('walls', tilesetElwynn!, 0, 0)
        // const portalsLayer = map.createLayer('portals', tilesetElwynn!, 0, 0)

        this.boar = new Enemy({ scene: this, x: 600, y: 400, textures: { base: SPRITES.BOAR } })
        this.boarSecond = new Enemy({ scene: this, x: 200, y: 300, textures: { base: SPRITES.BOAR } })
        this.boarThird = new Enemy({ scene: this, x: 1500, y: 1200, textures: { base: SPRITES.BOAR } })

        this.player = new Player({
            scene: this,
            x: 400,
            y: 250,
            textures: { fight: SPRITES.PLAYER.FIGHT, base: SPRITES.PLAYER.BASE },
        });
        this.setupMultiplayer(
            socket.id,
            () => ({ x: this.player.x, y: this.player.y, name: 'Hero' }),
            this.createOtherPlayer
        );

        this.boar.setPlayer(this.player);
        this.boarSecond.setPlayer(this.player);
        this.boarThird.setPlayer(this.player);
        this.player.setEnemies([this.boar, this.boarSecond, this.boarThird])
        // Настройка камеры
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
        this.cameras.main.startFollow(this.player)

        // Ограничиваем перемещение игрока в пределах карты
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
        this.player.setCollideWorldBounds(true)

        // portalsLayer.setCollisionByExclusion([-1])

        const portal = new Portal({ scene: this, x: 210, y: 205, textures: { base: SPRITES.PORTAL.BASE } })
        this.physics.add.collider(this.player, portal, () => {
            // Сообщаем серверу о смене сцены
            socket.emit('changeScene', 'Dungeon');
            this.scene.stop()
            this.scene.add('Dungeon', Dungeon, true)
        })

        wallsLayer.setCollisionByExclusion([-1])
        this.physics.add.collider(this.player, wallsLayer)

        this.killsText = this.add.text(770, 10, `${this.killsCounter}`, {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#ffffff',
        })
        this.killsText.setScrollFactor(0)
    }

    updateScene() {
        this.killsText.setText(`${this.killsCounter}`);
        this.player.update();
        this.emitPlayerMove(() => ({ x: this.player.x, y: this.player.y }));
        this.boar.update();
        this.boarSecond.update();
        this.boarThird.update();
    }
}
