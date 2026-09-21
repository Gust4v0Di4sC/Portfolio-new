import type { Group } from './splashThreeRuntime';

export type ThreeModule = typeof import('./splashThreeRuntime');
export type SplashBlock = {
  group: Group;
  targetY: number;
  delay: number;
  height: number;
  speed: number;
  sway: number;
};

export const getSplashTimings = (reducedMotion: boolean) => ({
  introDelay: reducedMotion ? 180 : 450,
  animationDuration: reducedMotion ? 2200 : 29030,
  fadeDuration: reducedMotion ? 220 : 520,
});

export const loadThree = (): Promise<ThreeModule> => import('./splashThreeRuntime');
