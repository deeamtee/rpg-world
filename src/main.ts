import Phaser from 'phaser';
import './style.css'
import { scenes } from './scenes';
import { GAME_CONFIG, isDevelopment, isProduction } from './utils';

/**
 * https://photonstorm.github.io/phaser3-docs/Phaser.Types.Core.html#.GameConfig
 */
new Phaser.Game({
  width: GAME_CONFIG.WIDTH, 
  height: GAME_CONFIG.HEIGHT,
  title: 'Phaser RPG',
  url: import.meta.env.URL || '',
  version: import.meta.env.VERSION || '0.0.1',
  scene: scenes,
  physics: {
    default: 'arcade',
    arcade: {
      debug: isDevelopment,
    },
  },
  disableContextMenu: isProduction,
  backgroundColor: '#000',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  pixelArt: true,
});
