import playerSpriteUrl from './char.webp?url';
import blackHoleSpriteUrl from './blackhole/blackhole_spritesheet_512x512.webp?url';
import platformCrackedUrl from './platforms/platform_cracked.webp?url';
import platformLongUrl from './platforms/platform_long.webp?url';
import platformMossyUrl from './platforms/platform_mossy.webp?url';
import platformSmallUrl from './platforms/platform_small.webp?url';

export const BLACK_HOLE_ASSETS = {
  player: {
    key: 'black-hole-runner',
    url: playerSpriteUrl,
    frameWidth: 311,
    frameHeight: 295,
    endFrame: 15,
    frames: {
      ready: 1,
      running: [2, 3, 4, 5, 6, 7, 8, 9],
      anticipation: 10,
      rising: 11,
      apex: 12,
      falling: 13,
      landing: 14,
      gameOver: 15,
    },
  },
  platforms: {
    long: { key: 'black-hole-platform-long', url: platformLongUrl },
    small: { key: 'black-hole-platform-small', url: platformSmallUrl },
    cracked: { key: 'black-hole-platform-cracked', url: platformCrackedUrl },
    mossy: { key: 'black-hole-platform-mossy', url: platformMossyUrl },
  },
  blackHole: {
    key: 'black-hole-threat',
    url: blackHoleSpriteUrl,
    frameWidth: 512,
    frameHeight: 512,
    endFrame: 5,
  },
} as const;
