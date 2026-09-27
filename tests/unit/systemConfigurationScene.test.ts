import { describe, expect, it } from 'vitest';

import { getSystemConfigurationMotion } from '../../src/scripts/three/systemConfigurationScene';

describe('configuração da cena do System Configuration', () => {
  it('usa movimento completo na experiência padrão', () => {
    expect(getSystemConfigurationMotion(false)).toEqual({
      motionFactor: 1,
      maxPixelRatio: 1.6,
      cubeFloatAmplitude: 0.34,
    });
  });

  it('reduz velocidade, resolução e oscilação quando solicitado', () => {
    expect(getSystemConfigurationMotion(true)).toEqual({
      motionFactor: 0.16,
      maxPixelRatio: 1,
      cubeFloatAmplitude: 0,
    });
  });
});
