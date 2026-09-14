import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('não possui violações automáticas de acessibilidade', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-splash-intro]').waitFor({ state: 'detached' });
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
