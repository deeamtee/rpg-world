export interface IEntity {
    scene: Phaser.Scene
    x: number;
    y: number;
    textures?: { fight?: string, base: string };
    type?: string;
}

export class Entity extends Phaser.Physics.Arcade.Sprite {
    health: number
    maxHealth: number;

    constructor(config: IEntity) {
        const { scene, x, y, textures, type } = config;
        super(scene, x, y, textures.base)

        this.scene = scene
        this.type = type
        this.scene.physics.add.existing(this)
        this.scene.add.existing(this)

        // добавление жизни
        this.health = 100;
        this.maxHealth = 100;
    }

    takeDamage(damage: number) {
        if (this.health > 0) {
            this.health -= damage;
        }
    }
    
}
