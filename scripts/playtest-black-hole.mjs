import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';

import { chromium } from '@playwright/test';

const baseUrl = process.env.PLAYTEST_URL ?? 'http://127.0.0.1:4321';
const outputDirectory = resolve('test-results/game-playtest');

await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch();

const openGame = async (page) => {
  await page.goto(baseUrl);
  await page.locator('html[data-interface-controller-ready="true"]').waitFor();
  await page.waitForFunction(
    () =>
      !globalThis.document
        .querySelector('astro-island[component-url*="SplashIntro"]')
        ?.hasAttribute('ssr'),
  );
  await page.getByRole('button', { name: 'Role para entrar' }).click();
  await page.locator('[data-splash-intro]').waitFor({ state: 'hidden' });
  await page.getByRole('button', { name: 'Navegador' }).click();
  await page.locator('#projetos').waitFor();
  await page.getByRole('button', { name: 'Voltar ao menu principal' }).click();
  await page.getByRole('button', { name: 'Abrir apresentação' }).click();
  await page.waitForFunction(
    () =>
      !globalThis.document
        .querySelector('astro-island[component-url*="HeroCard"]')
        ?.hasAttribute('ssr'),
  );
  await page
    .getByRole('button', { name: 'Abrir o minijogo Fuga do Buraco Negro' })
    .click({ force: true });

  const dialog = page.getByRole('dialog', { name: 'Fuga do Buraco Negro' });
  const game = dialog.getByRole('button', {
    name: 'Jogo de plataforma Fuga do Buraco Negro',
  });
  await game.waitFor();
  await page.waitForFunction(() => {
    const host = globalThis.document.querySelector('.black-hole-game-host');
    return host?.getAttribute('data-game-state') === 'ready';
  });

  return { dialog, game };
};

const capture = async (locator, name) => {
  await locator.screenshot({ path: resolve(outputDirectory, `${name}.png`) });
};

const sampleFrameIntervals = (page, sampleSize = 20) =>
  page.evaluate(
    (targetSize) =>
      new Promise((resolveSample) => {
        const samples = [];
        let previous = globalThis.performance.now();
        const sample = (now) => {
          samples.push(now - previous);
          previous = now;
          if (samples.length >= targetSize) resolveSample(samples.slice(5));
          else globalThis.requestAnimationFrame(sample);
        };
        globalThis.requestAnimationFrame(sample);
      }),
    sampleSize,
  );

const summarizeFrameIntervals = (frameIntervals) => {
  const sortedIntervals = [...frameIntervals].sort((first, second) => first - second);
  const averageInterval =
    frameIntervals.reduce((total, interval) => total + interval, 0) / frameIntervals.length;

  return {
    framesSampled: frameIntervals.length,
    averageFrameIntervalMs: Number(averageInterval.toFixed(2)),
    percentile95FrameIntervalMs: Number(
      sortedIntervals[Math.floor(sortedIntervals.length * 0.95)].toFixed(2),
    ),
  };
};

const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const { dialog, game } = await openGame(desktop);
await capture(dialog, 'desktop-ready');
const readyFrameIntervals = await sampleFrameIntervals(desktop);

await desktop.keyboard.press('Space');
await game.evaluate((element) =>
  element.getAttribute('data-player-motion') === 'running'
    ? undefined
    : Promise.reject(new Error('O jogador não iniciou correndo.')),
);
await desktop.waitForTimeout(100);
await capture(dialog, 'desktop-running');
await desktop.waitForFunction(
  () => Number(globalThis.document.querySelector('[data-game-score]')?.textContent ?? 0) >= 5,
  undefined,
  { polling: 'raf', timeout: 10_000 },
);

await desktop.evaluate(() => {
  const host = globalThis.document.querySelector('.black-hole-game-host');
  if (!host) throw new Error('Host do jogo não encontrado.');

  globalThis.__blackHoleMotionSequence = [];
  const recordMotion = () => {
    const motion = host.getAttribute('data-player-motion');
    if (motion && globalThis.__blackHoleMotionSequence.at(-1) !== motion) {
      globalThis.__blackHoleMotionSequence.push(motion);
    }
  };

  recordMotion();
  const observer = new globalThis.MutationObserver(recordMotion);
  observer.observe(host, { attributes: true, attributeFilter: ['data-player-motion'] });
  globalThis.__blackHoleMotionObserver = observer;
});
await desktop.keyboard.press('Space');
await desktop.waitForFunction(
  () =>
    globalThis.__blackHoleMotionSequence?.includes('landing') ||
    globalThis.__blackHoleMotionSequence?.includes('gameover'),
  undefined,
  { polling: 'raf', timeout: 15_000 },
);

const motionSequence = await desktop.evaluate(() => {
  globalThis.__blackHoleMotionObserver?.disconnect();
  return globalThis.__blackHoleMotionSequence;
});
const expectedMotionSequence = ['running', 'rising', 'apex', 'falling', 'landing'];
let sequencePosition = 0;
for (const motion of motionSequence) {
  if (motion === expectedMotionSequence[sequencePosition]) sequencePosition += 1;
}
if (sequencePosition !== expectedMotionSequence.length) {
  throw new Error(`Sequência de movimento incompleta: ${motionSequence.join(' -> ')}`);
}

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
const mobileGame = await openGame(mobile);
await capture(mobileGame.dialog, 'mobile-ready');

await browser.close();

process.stdout.write(
  `${JSON.stringify(
    {
      screenshots: 3,
      motionSequence,
      ready: summarizeFrameIntervals(readyFrameIntervals),
    },
    null,
    2,
  )}\n`,
);
