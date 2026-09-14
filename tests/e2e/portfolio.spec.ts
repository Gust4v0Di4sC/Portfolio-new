import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-splash-intro]').waitFor({ state: 'detached' });
});

test('renderiza as seções principais e navega por âncora', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1, name: 'Gustavo Dias' })).toBeVisible();
  for (const id of ['experiencia', 'projetos', 'habilidades', 'sobre', 'contato']) {
    await expect(page.locator(`#${id}`)).toBeAttached();
  }
  await page.getByRole('link', { name: 'Projetos', exact: true }).first().click();
  await expect(page).toHaveURL(/#projetos$/);
});

test('abre e fecha a prova de habilidade com controles acessíveis', async ({ page }) => {
  await page.locator('[data-proof-trigger="interfaces"]').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Interfaces' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Fechar prova de conceito' }).click();
  await expect(dialog).not.toBeVisible();
});

test('oferece link para pular diretamente ao conteúdo', async ({ page }) => {
  await page.keyboard.press('Tab');
  const skipLink = page.getByRole('link', { name: 'Pular para o conteúdo' });
  await expect(skipLink).toBeFocused();
  await skipLink.press('Enter');
  await expect(page.locator('#conteudo')).toBeFocused();
});
