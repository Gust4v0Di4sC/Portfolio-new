export const getSystemConfigurationMotion = (reducedMotion: boolean) => ({
  motionFactor: reducedMotion ? 0.16 : 1,
  maxPixelRatio: reducedMotion ? 1 : 1.6,
  cubeFloatAmplitude: reducedMotion ? 0 : 0.34,
});
