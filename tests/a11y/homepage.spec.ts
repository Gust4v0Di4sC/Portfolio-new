import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('não possui violações automáticas de acessibilidade', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('mantém System Configuration, telas secundárias e Visor sem violações automáticas', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.goto('/');
  const splash = page.locator('[data-splash-intro]');
  await expect(page.locator('astro-island[component-url*="SplashIntro"]')).not.toHaveAttribute(
    'ssr',
    '',
  );
  for (let step = 0; step < 4; step += 1) {
    await page.mouse.wheel(0, 300);
  }
  await expect(splash).toBeHidden();

  await page.getByRole('button', { name: 'Configuração do Sistema' }).click();
  const systemResults = await new AxeBuilder({ page }).analyze();
  expect(systemResults.violations).toEqual([]);

  for (const screenName of ['Experiência', 'Habilidades', 'Sobre', 'Contato']) {
    await page.getByRole('button', { name: screenName, exact: true }).click();
    const screenResults = await new AxeBuilder({ page }).analyze();
    expect(screenResults.violations).toEqual([]);
    await page.getByRole('button', { name: 'Voltar para Configuração do Sistema' }).click();
  }

  await page.getByRole('button', { name: 'Ativar Visor' }).click();
  const viewerResults = await new AxeBuilder({ page }).analyze();
  expect(viewerResults.violations).toEqual([]);
});

test('mantém a rota inglesa e o seletor de idioma sem violações automáticas', async ({ page }) => {
  await page.goto('/en/');
  await expect(page.locator('astro-island[component-url*="SplashIntro"]')).not.toHaveAttribute(
    'ssr',
    '',
  );
  await page.getByRole('button', { name: 'Scroll to enter' }).click();
  await expect(page.locator('[data-splash-intro]')).toBeHidden({ timeout: 15_000 });
  await page.getByRole('button', { name: 'System Configuration' }).click();
  await page.getByRole('button', { name: 'Language', exact: true }).click();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('mantém o minijogo do hero sem violações automáticas', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('astro-island[component-url*="SplashIntro"]')).not.toHaveAttribute(
    'ssr',
    '',
  );
  await page.getByRole('button', { name: 'Role para entrar' }).click();
  await expect(page.locator('[data-splash-intro]')).toBeHidden({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Navegador' }).click();
  await page.getByRole('button', { name: 'Voltar ao menu principal' }).click();
  await page.getByRole('button', { name: 'Abrir apresentação' }).click();
  const heroCard = page.locator('astro-island[component-url*="HeroCard"]');
  await heroCard.scrollIntoViewIfNeeded();
  await expect(heroCard).not.toHaveAttribute('ssr', '', { timeout: 15_000 });
  await page.getByRole('button', { name: 'Abrir o minijogo Fuga do Buraco Negro' }).click();

  const gameHost = page.getByRole('button', {
    name: 'Jogo de plataforma Fuga do Buraco Negro',
  });
  await expect(gameHost).toHaveAttribute('data-game-state', 'ready', { timeout: 15_000 });
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
