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
    frameWidth: 443,
    frameHeight: 443,
    endFrame: 7,
    anchors: {
      0: { x: 228 / 443, y: 428 / 443 },
      1: { x: 211 / 443, y: 428 / 443 },
      2: { x: 216 / 443, y: 426 / 443 },
      3: { x: 225 / 443, y: 428 / 443 },
      4: { x: 221 / 443, y: 408 / 443 },
      5: { x: 193 / 443, y: 390 / 443 },
      6: { x: 211 / 443, y: 412 / 443 },
      7: { x: 220 / 443, y: 404 / 443 },
    } as Record<number, { x: number; y: number }>,
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
