import { describe, expect, it, vi } from 'vitest';

import {
  BEST_SCORE_STORAGE_KEY,
  BLACK_HOLE_SPEED_CAP,
  createPlatformSpec,
  getBlackHoleSpeed,
  getDifficulty,
  readBestScore,
  scoreFromDistance,
  writeBestScore,
} from '../../src/game/black-hole/rules';

describe('regras de Fuga do Buraco Negro', () => {
  it('aumenta a dificuldade dentro de limites jogáveis', () => {
    const initial = getDifficulty(0);
    const maximum = getDifficulty(99_999);

    expect(maximum.speed).toBeGreaterThan(initial.speed);
    expect(initial.speed).toBe(235);
    expect(maximum.speed).toBe(440);
    expect(initial.gapMin).toBe(64);
    expect(maximum.gapMax).toBe(200);
    expect(maximum.platformMinWidth).toBe(116);
    expect(initial.platformMaxWidth).toBe(190);
    expect(maximum.platformMaxWidth).toBe(166);
  });

  it('adapta o buraco negro sem ultrapassar o limite seguro', () => {
    const playerSpeed = getDifficulty(0).speed;
    const normalSpeed = getBlackHoleSpeed(playerSpeed, 270, 0);
    const farSpeed = getBlackHoleSpeed(playerSpeed, 400, 0);
    const nearSpeed = getBlackHoleSpeed(playerSpeed, 170, 0);
    const maximumSpeed = getBlackHoleSpeed(999, 400, 99_999);

    expect(farSpeed).toBeGreaterThan(normalSpeed);
    expect(nearSpeed).toBeLessThan(playerSpeed);
    expect(maximumSpeed).toBe(BLACK_HOLE_SPEED_CAP);
    expect(maximumSpeed).toBeLessThan(getDifficulty(99_999).speed);
  });

  it('mantém uma margem de reação mesmo depois de uma corrida longa', () => {
    let distance = 0;
    let gap = 270;
    let smallestGap = gap;

    for (let frame = 0; frame < 60 * 180; frame += 1) {
      const playerSpeed = getDifficulty(distance).speed;
      const blackHoleSpeed = getBlackHoleSpeed(playerSpeed, gap, distance);
      gap += (playerSpeed - blackHoleSpeed) / 60;
      distance += playerSpeed / 60;
      smallestGap = Math.min(smallestGap, gap);
    }

    expect(smallestGap).toBeGreaterThan(175);
    expect(gap).toBeGreaterThan(smallestGap);
  });

  it('gera a próxima plataforma adiante e dentro da faixa vertical', () => {
    const previous = { x: 300, y: 486, width: 180 };
    const difficulty = getDifficulty(6_000);
    const random = vi.fn().mockReturnValueOnce(1).mockReturnValueOnce(0).mockReturnValueOnce(1);
    const next = createPlatformSpec(previous, difficulty, random);

    const gap = next.x - next.width / 2 - (previous.x + previous.width / 2);
    expect(gap).toBeCloseTo(difficulty.gapMax);
    expect(next.width).toBeCloseTo(difficulty.platformMinWidth);
    expect(next.y).toBeGreaterThanOrEqual(350);
    expect(next.y).toBeLessThanOrEqual(458);
  });

  it('mantém os extremos de geração dentro da curva tolerante', () => {
    const previous = { x: 300, y: 400, width: 166 };
    const difficulty = getDifficulty(99_999);
    const lowest = createPlatformSpec(previous, difficulty, () => 0);
    const highest = createPlatformSpec(previous, difficulty, () => 1);

    expect(lowest.y).toBe(358);
    expect(highest.y).toBe(442);
    expect(lowest.width).toBe(116);
    expect(highest.width).toBe(166);
    expect(highest.x - highest.width / 2 - (previous.x + previous.width / 2)).toBe(200);
  });

  it('converte distância em pontos sem valores negativos', () => {
    expect(scoreFromDistance(-50)).toBe(0);
    expect(scoreFromDistance(119)).toBe(9);
    expect(scoreFromDistance(120)).toBe(10);
  });

  it('lê e grava o recorde com fallback para storage indisponível', () => {
    const storage = {
      getItem: vi.fn().mockReturnValue('42'),
      setItem: vi.fn(),
    };

    expect(readBestScore(storage)).toBe(42);
    writeBestScore(storage, 87.9);
    expect(storage.setItem).toHaveBeenCalledWith(BEST_SCORE_STORAGE_KEY, '87');
    expect(readBestScore({ getItem: () => 'inválido' })).toBe(0);
    expect(
      readBestScore({
        getItem: () => {
          throw new Error('blocked');
        },
      }),
    ).toBe(0);
  });
});
