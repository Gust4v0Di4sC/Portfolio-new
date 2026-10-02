export const BEST_SCORE_STORAGE_KEY = 'portfolio-black-hole-best';

export type Difficulty = {
  speed: number;
  gapMin: number;
  gapMax: number;
  platformMinWidth: number;
  platformMaxWidth: number;
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

export const MAX_PLAYER_SPEED = 440;
export const BLACK_HOLE_SPEED_CAP = MAX_PLAYER_SPEED - 15;

const BLACK_HOLE_BASE_SPEED = 245;
const BLACK_HOLE_SPEED_INCREASE = BLACK_HOLE_SPEED_CAP - BLACK_HOLE_BASE_SPEED;
const BLACK_HOLE_FAR_GAP = 360;
const BLACK_HOLE_NEAR_GAP = 185;

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
  };
}

export function getBlackHoleSpeed(playerSpeed: number, gap: number, distance: number) {
  const progress = clamp(distance / 14_000, 0, 1);
  let speed = BLACK_HOLE_BASE_SPEED + progress * BLACK_HOLE_SPEED_INCREASE;

  if (gap > BLACK_HOLE_FAR_GAP) speed += 25;
  else if (gap < BLACK_HOLE_NEAR_GAP) speed -= 35;

  return clamp(speed, 0, Math.min(BLACK_HOLE_SPEED_CAP, playerSpeed + 25));
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
