import { SPRITES } from '../utils'
import { Entity } from './entity'

export class Player extends Entity {
    textureKey: string

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture, SPRITES.PLAYER)

        this.scene = scene
        const anims = scene.anims
        const animFrameRate = 9
        this.textureKey = texture

        anims.create({
            key: 'down',
            frames: anims.generateFrameNumbers(this.textureKey, {
                start: 0,
                end: 2,
            }),
            frameRate: animFrameRate,
            repeat: -1,
        })
        anims.create({
            key: 'left',
            frames: anims.generateFrameNumbers(this.textureKey, {
                start: 12,
                end: 14,
            }),
            frameRate: animFrameRate,
            repeat: -1,
        })

        anims.create({
            key: 'right',
            frames: anims.generateFrameNumbers(this.textureKey, {
                start: 24,
                end: 26,
            }),
            frameRate: animFrameRate,
            repeat: -1,
        })

        anims.create({
            key: 'up',
            frames: anims.generateFrameNumbers(this.textureKey, {
                start: 36,
                end: 38,
            }),
            frameRate: animFrameRate,
            repeat: -1,
        })
    }

    update() {
        const cursors = this.scene.input.keyboard.createCursorKeys()

        if (cursors.up.isDown) {
            this.entity.play('up', true)
            this.entity.setPosition(this.entity.x, this.entity.y - 1)
        } else if (cursors.down.isDown) {
            this.entity.play('down', true)
            this.entity.setPosition(this.entity.x, this.entity.y + 1)
        } else if (cursors.left.isDown) {
            this.entity.play('left', true)
            this.entity.setPosition(this.entity.x - 1, this.entity.y)
        } else if (cursors.right.isDown) {
            this.entity.play('right', true)
            this.entity.setPosition(this.entity.x + 1, this.entity.y)
        } else {
            this.entity.stop()
        }
    }
}
