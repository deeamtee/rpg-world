import { Entity } from "./entity";

export class Portal extends Entity {
    constructor(config) {
        super(config)

        this.createAnimation('portal', config.textures.base, 0, 9, this.scene.anims, 9)
        this.play('portal');
    }
}
