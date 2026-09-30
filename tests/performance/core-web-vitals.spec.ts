import { expect, test } from '@playwright/test';

declare global {
  interface Window {
    __portfolioPerformance?: {
      cls: number;
      lcp: number;
      longTasks: number[];
    };
  }
}

test('mantém os Core Web Vitals e o payload inicial dentro do orçamento', async ({
  context,
  page,
}) => {
  const session = await context.newCDPSession(page);
  await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await session.send('Network.enable');
  await session.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
    connectionType: 'cellular3g',
  });

  await page.addInitScript(() => {
    window.__portfolioPerformance = { cls: 0, lcp: 0, longTasks: [] };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__portfolioPerformance!.lcp = entry.startTime;
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
        if (!shift.hadRecentInput) window.__portfolioPerformance!.cls += shift.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__portfolioPerformance!.longTasks.push(entry.duration);
      }
    }).observe({ type: 'longtask', buffered: true });
  });

  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3_000);

  const result = await page.evaluate(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const scripts = resources.filter((resource) => resource.name.includes('.js'));
    const names = resources.map((resource) => resource.name);
    const metrics = window.__portfolioPerformance!;
    return {
      cls: metrics.cls,
      initialJavaScriptKB:
        scripts.reduce((total, resource) => total + resource.transferSize, 0) / 1024,
      lcp: metrics.lcp,
      tbt: metrics.longTasks.reduce((total, duration) => total + Math.max(0, duration - 50), 0),
      names,
    };
  });

  expect(result.lcp).toBeLessThanOrEqual(2_500);
  expect(result.cls).toBeLessThanOrEqual(0.1);
  expect(result.tbt).toBeLessThanOrEqual(200);
  expect(result.initialJavaScriptKB).toBeLessThanOrEqual(215);
  expect(result.names.some((name) => /\/_astro\/runtime\.[\w-]+\.js/.test(name))).toBe(false);
  expect(result.names.some((name) => /\.(glb|webm)(\?|$)/.test(name))).toBe(false);
  expect(
    result.names.some((name) =>
      /char\.|blackhole_spritesheet|platform_(long|small|mossy|cracked)/.test(name),
    ),
  ).toBe(false);
});

test('carrega cenas e mídias pesadas somente após a interação correspondente', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));

  await page.goto('/', { waitUntil: 'networkidle' });
  await page.locator('[data-splash-enter]').click();
  await page.locator('[data-splash-intro]').waitFor({ state: 'hidden', timeout: 15_000 });

  expect(requests.some((url) => /\/_astro\/runtime\.[\w-]+\.js/.test(url))).toBe(false);
  expect(requests.some((url) => /\.(glb|webm)(\?|$)/.test(url))).toBe(false);

  await page.getByRole('button', { name: 'Navegador' }).click();
  await page.locator('[data-memory-slot="published"]').click();
  await expect.poll(() => requests.some((url) => /\.glb(\?|$)/.test(url))).toBe(true);
  expect(requests.some((url) => /media\/projects\/.*\.webm/.test(url))).toBe(false);

  await page.getByRole('button', { name: 'Voltar ao menu principal' }).click();
  await page.getByRole('button', { name: 'Abrir apresentação' }).click();
  await page
    .getByRole('button', { name: 'Abrir o minijogo Fuga do Buraco Negro' })
    .click({ force: true });
  await expect(page.locator('.black-hole-game-host[data-game-state="ready"]')).toBeVisible({
    timeout: 20_000,
  });
  expect(requests.some((url) => /\/_astro\/runtime\.[\w-]+\.js/.test(url))).toBe(true);
  expect(requests.some((url) => /blackhole_spritesheet/.test(url))).toBe(true);
});
