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

test('abre a prévia de um projeto com ações externas', async ({ page }) => {
  const projectCarousel = page.locator('#projetos astro-island');
  await projectCarousel.scrollIntoViewIfNeeded();
  await expect(projectCarousel).not.toHaveAttribute('ssr', '');
  await page.locator('[data-project-trigger="1"]:visible').first().click();
  const dialog = page.getByRole('dialog', { name: 'InfoShop' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Disponível', { exact: true })).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'Abrir projeto' })).toHaveAttribute(
    'href',
    'https://infoshop.netlify.app/',
  );
  await expect(dialog.getByRole('link', { name: 'Abrir repositório' })).toHaveAttribute(
    'href',
    'https://github.com/Gust4v0Di4sC/Info-Shop',
  );
  await dialog.getByRole('button', { name: 'Fechar prévia do projeto' }).click();
  await expect(dialog).not.toBeVisible();
});

test('oferece link para pular diretamente ao conteúdo', async ({ page }) => {
  await page.keyboard.press('Tab');
  const skipLink = page.getByRole('link', { name: 'Pular para o conteúdo' });
  await expect(skipLink).toBeFocused();
  await skipLink.press('Enter');
  await expect(page.locator('#conteudo')).toBeFocused();
});
