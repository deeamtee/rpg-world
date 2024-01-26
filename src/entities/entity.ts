export interface IEntity {
    scene: Phaser.Scene
    x: number;
    y: number;
    texture: string;
    textures?: { fight?: string };
    type?: string;
}

export class Entity extends Phaser.Physics.Arcade.Sprite {
    health: number

    constructor(config: IEntity) {
        const { scene, x, y, texture, type } = config;
        super(scene, x, y, texture)

        this.scene = scene
        this.type = type
        this.scene.physics.add.existing(this)
        this.scene.add.existing(this)

        // добавление жизни
        this.health = 100
    }

    takeDamage(damage: number) {
        if (this.health > 0) {
            this.health -= damage;
        }
    }
    
}
