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
  await expect(projectCarousel).not.toHaveAttribute('ssr', '', { timeout: 15_000 });
  await page.locator('[data-project-trigger="1"]:visible').first().click();
  const dialog = page.getByRole('dialog', { name: 'InfoShop' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Disponível', { exact: true })).toBeVisible();
  const previewVideo = dialog.getByLabel('Prévia animada do projeto InfoShop');

  await expect(previewVideo).toHaveAttribute('preload', 'metadata');
  await expect(previewVideo).toHaveAttribute('autoplay', '');
  await expect(previewVideo).toHaveAttribute('loop', '');
  await expect(previewVideo).toBeVisible();
  await expect(dialog.locator('video source')).toHaveAttribute(
    'src',
    '/media/projects/infoshop-preview.webm',
  );
  await expect(previewVideo).toHaveAttribute('poster', '/media/projects/infoshop-poster.webp');
  await expect
    .poll(() =>
      previewVideo.evaluate((video: HTMLVideoElement) => ({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration,
      })),
    )
    .toEqual({ width: 1280, height: 720, duration: 10 });
  await expect
    .poll(() => previewVideo.evaluate((video: HTMLVideoElement) => video.paused))
    .toBe(false);
  await expect
    .poll(() => previewVideo.evaluate((video: HTMLVideoElement) => video.currentTime))
    .toBeGreaterThan(0.1);
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

test('executa os comandos de teclado no contexto correto da interface', async ({ page }) => {
  await page.keyboard.press('a');
  await expect(page).toHaveURL(/#contato$/);

  const skillTrigger = page.locator('[data-proof-trigger="interfaces"]');
  await skillTrigger.scrollIntoViewIfNeeded();
  await skillTrigger.focus();
  await page.keyboard.press('x');

  const skillDialog = page.getByRole('dialog', { name: 'Interfaces' });
  await expect(skillDialog).toBeVisible();
  await page.keyboard.press('o');
  await expect(skillDialog).not.toBeVisible();

  const projectTrigger = page.locator('[data-project-trigger="1"]:visible').first();
  await projectTrigger.scrollIntoViewIfNeeded();
  await expect(page.locator('#projetos astro-island')).not.toHaveAttribute('ssr', '', {
    timeout: 15_000,
  });
  await projectTrigger.focus();
  await page.keyboard.press('x');

  const projectDialog = page.getByRole('dialog', { name: 'InfoShop' });
  await expect(projectDialog).toBeVisible();

  const repositoryPagePromise = page.waitForEvent('popup');
  await page.keyboard.press('z');
  const repositoryPage = await repositoryPagePromise;
  await expect(repositoryPage).toHaveURL(/github\.com\/Gust4v0Di4sC\/Info-Shop\/?$/);
  await repositoryPage.close();

  await page.keyboard.press('Escape');
  await expect(projectDialog).not.toBeVisible();
});

test('navega pelo carrossel com as setas do teclado', async ({ page }) => {
  const firstIndicator = page.getByRole('button', { name: /Ir para o projeto 1:/ });
  const secondIndicator = page.getByRole('button', { name: /Ir para o projeto 2:/ });
  await firstIndicator.scrollIntoViewIfNeeded();
  await firstIndicator.click();
  await expect(firstIndicator).toHaveAttribute('aria-current', 'true');

  await firstIndicator.press('ArrowRight');
  await expect(secondIndicator).toHaveAttribute('aria-current', 'true');
  await secondIndicator.press('ArrowLeft');
  await expect(firstIndicator).toHaveAttribute('aria-current', 'true');
});
