export class Entity extends Phaser.GameObjects.Sprite {
    public entity: this;
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, type: string) {
        super(scene, x, y, texture);

        this.scene = scene;
        this.type = type;
        this.entity = this.scene.add.existing(this);
    }
}