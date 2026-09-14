import { describe, expect, it } from 'vitest';

import { getSplashTimings } from '../../src/scripts/three/splashScene';

describe('configuração da splash Three.js', () => {
  it('reduz o tempo e a animação quando o usuário prefere menos movimento', () => {
    const standard = getSplashTimings(false);
    const reduced = getSplashTimings(true);
    expect(reduced.animationDuration).toBeLessThan(standard.animationDuration);
    expect(reduced.fadeDuration).toBeLessThan(standard.fadeDuration);
    expect(reduced.introDelay).toBeLessThan(standard.introDelay);
  });
});
