export const BEST_SCORE_STORAGE_KEY = 'portfolio-black-hole-best';

export type Difficulty = {
  speed: number;
  gapMin: number;
  gapMax: number;
  platformMinWidth: number;
  platformMaxWidth: number;
  blackHoleClosingSpeed: number;
};

export type PlatformSpec = {
  x: number;
  y: number;
  width: number;
};

type StorageReader = Pick<Storage, 'getItem'>;
type StorageWriter = Pick<Storage, 'setItem'>;

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

export function getDifficulty(distance: number): Difficulty {
  const progress = clamp(distance / 14_000, 0, 1);
  const speed = 235 + progress * 205;
  const reachableGap = Math.floor(speed * 0.62);

  return {
    speed,
    gapMin: 64 + progress * 28,
    gapMax: Math.min(200, 118 + progress * 82, reachableGap),
    platformMinWidth: 132 - progress * 16,
    platformMaxWidth: 190 - progress * 24,
    blackHoleClosingSpeed: 3.5 + progress * 5.5,
  };
}

export function createPlatformSpec(
  previous: PlatformSpec,
  difficulty: Difficulty,
  random: () => number = Math.random,
): PlatformSpec {
  const gap = difficulty.gapMin + (difficulty.gapMax - difficulty.gapMin) * clamp(random(), 0, 1);
  const width =
    difficulty.platformMinWidth +
    (difficulty.platformMaxWidth - difficulty.platformMinWidth) * clamp(random(), 0, 1);
  const verticalOffset = (clamp(random(), 0, 1) - 0.5) * 84;
  const y = clamp(previous.y + verticalOffset, 350, 458);

  return {
    x: previous.x + previous.width / 2 + gap + width / 2,
    y,
    width,
  };
}

export function scoreFromDistance(distance: number) {
  return Math.max(0, Math.floor(distance / 12));
}

export function readBestScore(storage: StorageReader | null | undefined) {
  if (!storage) return 0;

  try {
    const score = Number.parseInt(storage.getItem(BEST_SCORE_STORAGE_KEY) ?? '', 10);
    return Number.isFinite(score) && score > 0 ? score : 0;
  } catch {
    return 0;
  }
}

export function writeBestScore(storage: StorageWriter | null | undefined, score: number) {
  if (!storage || !Number.isFinite(score) || score < 0) return;

  try {
    storage.setItem(BEST_SCORE_STORAGE_KEY, String(Math.floor(score)));
  } catch {
    // Storage may be unavailable in privacy mode. The in-memory score still works.
  }
}
