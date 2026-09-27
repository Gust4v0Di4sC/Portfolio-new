import type { Group } from './splashThreeRuntime';

export type ThreeModule = typeof import('./splashThreeRuntime');
export type SplashBlock = {
  group: Group;
  targetY: number;
  delay: number;
  height: number;
  speed: number;
  sway: number;
  originX: number;
  originZ: number;
  driftX: number;
  driftY: number;
  driftZ: number;
};

export const getSplashMotion = (reducedMotion: boolean) => ({
  introDelay: reducedMotion ? 0 : 450,
  motionFactor: reducedMotion ? 0.12 : 1,
  sceneTimeOffset: reducedMotion ? 20 : 0,
  starCount: reducedMotion ? 80 : 180,
  cubeCount: reducedMotion ? 6 : 8,
  maxPixelRatio: reducedMotion ? 1 : 2,
});

export const loadThree = (): Promise<ThreeModule> => import('./splashThreeRuntime');
