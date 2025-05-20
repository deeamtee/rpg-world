import { SPRITES } from '../utils'
import socket from '../utils/socket'
import { Entity, IEntity } from './entity'

export class Player extends Entity {
    target: Entity | null
    enemies: Entity[]
    isAtacking: boolean
    playerHealthBar: Phaser.GameObjects.Graphics
    targetHealthBar: Phaser.GameObjects.Graphics
    moveSpeed: number
    isRemote: boolean

    constructor({ scene, x, y, textures, isRemote = false }: IEntity & { isRemote?: boolean }) {
        super({ scene, x, y, textures, type: SPRITES.PLAYER.TYPE })
        this.isRemote = isRemote

        this.scene = scene
        const anims = scene.anims
        const animFrameRate = 9
        this.enemies = []
        this.moveSpeed = 50

        this.setSize(28, 32)
        this.setOffset(10, 16)
        this.setScale(0.8)

        this.createAnimation('down', textures.base, 0, 2, anims, animFrameRate)
        this.createAnimation('left', textures.base, 12, 14, anims, animFrameRate)
        this.createAnimation('right', textures.base, 24, 26, anims, animFrameRate)
        this.createAnimation('up', textures.base, 36, 38, anims, animFrameRate)
        this.createAnimation('fight', textures.fight, 3, 6, anims, animFrameRate, 0)

        if (!this.isRemote) {
            this.setupKeysListeners()
        }

        this.on('animationcomplete', () => {
            this.isAtacking = false
            this.stop()
        })

        this.drawPlayerHealthBar()
    }

    private setupKeysListeners() {
        this.scene.input.keyboard.on('keydown-SPACE', () => {
            this.isAtacking = true
            const target = this.findTarget(this.enemies)
            this.play('fight', true)
            this.setVelocity(0, 0)
            this.attack(target)
            this.drawTargetHealthBar(target)
        })

        this.scene.input.keyboard.on('keydown-TAB', (e) => {
            e.preventDefault()
            const target = this.findTarget(this.enemies)
            if (target) {
                this.drawTargetHealthBar(target)
            } else {
                this.targetHealthBar.clear()
            }
        })
    }

    private findTarget(enemies) {
        let target = null
        let minDistance = Infinity
        for (const enemy of enemies) {
            const distanceToEnemy = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y)
            if (distanceToEnemy < minDistance) {
                minDistance = Math.min(distanceToEnemy, minDistance)
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
        target.takeDamage(25)
    }

    private drawPlayerHealthBar() {
        this.playerHealthBar = this.scene.add.graphics()
        this.playerHealthBar.setScrollFactor(0)
        this.drawHealthBar(this.playerHealthBar, 10, 10, this.health / this.maxHealth)
    }
    private drawTargetHealthBar(target) {
        this.targetHealthBar = this.scene.add.graphics()
        this.targetHealthBar.setScrollFactor(0)
        this.drawHealthBar(this.targetHealthBar, 10, 30, target.health / target.maxHealth)
    }

    private drawHealthBar(graphics, x, y, percentage) {
        graphics.fillStyle(0x000000, 1)
        graphics.fillRect(x, y, 100, 10)

        graphics.fillStyle(0x00ff00, 1)
        graphics.fillRect(x, y, 100 * percentage, 10)
    }

    /**
     * Устанавливает кадр персонажа по направлению (без анимации)
     */
    setDirectionFrame(direction: 'up' | 'down' | 'left' | 'right') {
        // Кадры для направлений должны совпадать с createAnimation
        const frameMap = {
            down: 1,   // средний кадр анимации вниз
            left: 13,  // средний кадр анимации влево
            right: 25, // средний кадр анимации вправо
            up: 37,    // средний кадр анимации вверх
        };
        const frame = frameMap[direction] ?? 1;
        this.setFrame(frame);
    }

    update() {
        if (this.isRemote) return
        const cursors = this.scene.input.keyboard.createCursorKeys()
        const delta = this.scene.game.loop.delta

        this.resetFlip()
        this.drawPlayerHealthBar()
        if (cursors.up.isDown) {
            this.play('up', true)
            this.setVelocity(0, -delta * this.moveSpeed)
            socket.emit('playerMove', { x: this.x, y: this.y })
        } else if (cursors.down.isDown) {
            this.play('down', true)
            this.setVelocity(0, delta * this.moveSpeed)
            socket.emit('playerMove', { x: this.x, y: this.y })
        } else if (cursors.left.isDown) {
            this.play('left', true)
            this.setVelocity(-delta * this.moveSpeed, 0)
            socket.emit('playerMove', { x: this.x, y: this.y })
        } else if (cursors.right.isDown) {
            this.play('right', true)
            this.setVelocity(delta * this.moveSpeed, 0)
            socket.emit('playerMove', { x: this.x, y: this.y })
        } else if (this.isAtacking) {
            this.setVelocity(0, 0)
        } else {
            this.setVelocity(0, 0)
            this.stop()
        }
    }
}
