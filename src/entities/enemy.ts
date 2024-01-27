import { Entity, IEntity } from './entity'
import { Player } from './player'

type Position = { x: number; y: number };

export class Enemy extends Entity {
    moveSpeed: number;
    direction: number;
    agroDistance: number;
    player: Player;
    target: Entity;
    initialPosition: Position;
    originalX: number;
    targetX: number;
    followRange: number;
    isFollowing: boolean;
    attackDamage: number;
    attackRange: number;
    isAlive: boolean;

    constructor({ scene, x, y, textures, type }: IEntity) {
        super({ scene, x, y, textures, type })

        this.scene = scene

        this.moveSpeed = 100
        this.agroDistance = 100
        this.isAlive = true;
        this.initialPosition = { x, y }
        this.attackRange = 40
        this.targetX = x + 100
        this.followRange = 250
        this.isFollowing = false
        this.attackDamage = 10

        this.setFlipX(true)
        this.cycleTween()
    }

    setPlayer(player: Player) {
        this.player = player
    }

    followPlayer(player) {
        this.scene.physics.moveToObject(this, player, this.moveSpeed)
    }

    returnToOriginalPosition() {
        const distanceToPosition = Phaser.Math.Distance.Between(
            this.x,
            this.y,
            this.initialPosition.x,
            this.initialPosition.y
        )

        this.setVelocity(0, 0)
        this.scene.tweens.add({
            targets: this,
            x: this.initialPosition.x,
            y: this.initialPosition.y,
            duration: (distanceToPosition * 1000) / this.moveSpeed, 
            onComplete: () => {
                this.cycleTween()
            },
        })


        this.health = 100;
    }

    cycleTween() {
        this.scene.tweens.add({
            targets: this,
            x: this.targetX,
            y: this.initialPosition.y,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            onRepeat: () => {
                this.setFlipX(true)
            },
            onYoyo: () => {
                this.setFlipX(false)
            },
        })

        if (this.body.velocity.x > 0) {
            this.setFlipX(false)
        } else if (this.body.velocity.x < 0) {
            this.setFlipX(true) 
        }
    }

    stopCycleTween() {
        this.scene?.tweens.killTweensOf(this)
    }

    update() {
        const player = this.player
        const distanceToPlayer = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y)
        const distanceToPosition = Phaser.Math.Distance.Between(
            this.x,
            this.y,
            this.initialPosition.x,
            this.initialPosition.y
        )

        if (!this.isFollowing && distanceToPlayer < this.agroDistance) {
            this.isFollowing = true
            this.stopCycleTween()
        }

        if (this.isFollowing && this.isAlive) {
            this.followPlayer(player)

            if (distanceToPlayer < this.attackRange) {
                this.setVelocity(0, 0)
                this.attack(player)
            }

            if (distanceToPosition > this.followRange) {
                this.isFollowing = false
                this.returnToOriginalPosition()
            }
        }
    }
    attack(target: Entity) {
        const time = Math.floor(this.scene.game.loop.time)
        if (time % 2000 <= 3) {
            target.takeDamage(this.attackDamage)
        }
    }

    deactivate() {
        this.stopCycleTween();
        this.setPosition(this.initialPosition.x, this.initialPosition.y)
        this.setVisible(false)
        this.isAlive = false;
        this.destroy()
    }

    takeDamage(damage: number) {
        super.takeDamage(damage)

        if (this.health <= 0) {
            
            this.deactivate()
        }
    }
}
