import { describe, expect, it } from 'vitest';

import { getSplashMotion } from '../../src/scripts/three/splashScene';

describe('configuração da entrada Three.js', () => {
  it('mantém movimento na experiência padrão', () => {
    expect(getSplashMotion(false)).toEqual({
      introDelay: 450,
      motionFactor: 1,
      sceneTimeOffset: 0,
      starCount: 180,
      cubeCount: 8,
      maxPixelRatio: 2,
    });
  });

  it('mantém uma cena mais leve e suave quando o usuário prefere menos movimento', () => {
    expect(getSplashMotion(true)).toEqual({
      introDelay: 0,
      motionFactor: 0.12,
      sceneTimeOffset: 20,
      starCount: 80,
      cubeCount: 6,
      maxPixelRatio: 1,
    });
  });
});
