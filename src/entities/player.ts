import { SPRITES } from '../utils'
import { Entity, IEntity } from './entity'

export class Player extends Entity {
    textureKey: string
    target: Entity | null
    enemies: Entity[]

    constructor({ scene, x, y, texture, textures }: IEntity) {
        super({ scene, x, y, texture, type: SPRITES.PLAYER.TYPE })

        this.scene = scene
        const anims = scene.anims
        const animFrameRate = 9
        this.textureKey = texture
        this.enemies = []

        this.setSize(28, 32)
        this.setOffset(10, 16)

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

        anims.create({
            key: 'fight',
            frames: anims.generateFrameNumbers(textures.fight, {
                start: 3,
                end: 6,
            }),
            frameRate: animFrameRate,
            repeat: -1,
        })
    }

    findTarget(enemies) {
        if (this.target) {
            return this.target
        }

        let target = null
        let minDistance = Infinity
        for (const enemy of enemies) {
            const distanceToEnemy = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y)
            if (distanceToEnemy < minDistance) {
                Math.min(distanceToEnemy, minDistance)
                target = enemy
            }
        }
        this.target = target
        return target
    }

    setEnemies(enemies) {
        this.enemies = enemies
    }

    attack(target: Entity) {
        const distanceToEnemy = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y)

        if (distanceToEnemy > 50) return
        const time = Math.floor(this.scene.game.loop.time)
        // частота нанесения урона
        if (time % 1000 <= 3) {
            target.takeDamage(30)
        }
    }

    update(_, delta) {
        // const delta = this.scene.game.loop.delta;

        const cursors = this.scene.input.keyboard.createCursorKeys()
        this.resetFlip()
        
        if (cursors.space.isDown) {
            this.play('fight', true)

            const target = this.findTarget(this.enemies)
            const direction = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y)
            if (Math.abs(direction) > 2) {
                this.setFlipX(false)
            } else {
                this.setFlipX(true)
            }

            this.setVelocity(0, 0)
            this.attack(target)
        } else if (cursors.up.isDown) {
            this.play('up', true)
            this.setVelocity(0, -delta * 40)
        } else if (cursors.down.isDown) {
            this.play('down', true)
            this.setVelocity(0, delta * 40)
        } else if (cursors.left.isDown) {
            this.play('left', true)
            this.setVelocity(-delta * 40, 0)
        } else if (cursors.right.isDown) {
            this.play('right', true)
            this.setVelocity(delta * 40, 0)
        } else {
            this.setVelocity(0, 0)
            this.stop()
        }
    }
}
