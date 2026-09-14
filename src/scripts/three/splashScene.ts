import type { Group } from 'three';

export type ThreeModule = typeof import('three');
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
  animationDuration: reducedMotion ? 2200 : 12500,
  fadeDuration: reducedMotion ? 220 : 520,
});

export const loadThree = (): Promise<ThreeModule> => import('three');
