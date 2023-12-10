import Phaser from 'phaser';
import './style.css'
import { scenes } from './scenes';
import { isDevelopment, isProduction } from './utils';

/**
 * https://photonstorm.github.io/phaser3-docs/Phaser.Types.Core.html#.GameConfig
 */
new Phaser.Game({
  width: 800, // 1024
  height: 600, // 768
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
