export const SPRITES = {
    PLAYER: {
        BASE: 'player',
        FIGHT: 'player_fight',
        TYPE: 'player'
    },
    BOAR: 'boar',
    PORTAL: {
        BASE: 'portal',
    }
}

export const TILES = {
    DURATOR: 'durotar',
    ELVIN_FOREST: 'elvin_forest',
    DUNGEON: 'dungeon',
}

export const SIZES = {
    PLAYER: {
        WIDTH: 48,
        HEIGHT: 48,
    },
    BOAR: {
        WIDTH: 32,
        HEIGHT: 32,
    },
    TILE: 32,
}

export const GAME_CONFIG = {
    WIDTH: 800,
    HEIGHT: 600,
    MAP_WIDTH: SIZES.TILE * 60,
    MAP_HEIGHT: SIZES.TILE * 40,
}

export const TILEMAP_KEYS = {
    DUNGEON: 'dungeon',
    ELVIN_FOREST: 'elvin_forest',
}