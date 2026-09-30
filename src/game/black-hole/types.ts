export type BlackHoleGameState = 'loading' | 'ready' | 'playing' | 'paused' | 'gameover';

export type BlackHoleGameCallbacks = {
  onStateChange: (state: BlackHoleGameState) => void;
  onScoreChange: (score: number) => void;
  onBestChange: (best: number) => void;
};

export type BlackHoleGameOptions = BlackHoleGameCallbacks & {
  parent: HTMLElement;
  initialBest: number;
  reducedMotion: boolean;
};

export type BlackHoleGameController = {
  action: () => void;
  restart: () => void;
  pause: () => void;
  resume: () => void;
  destroy: () => void;
};
