import { expect, test, type Page } from '@playwright/test';

const finishSplash = async (page: Page) => {
  await expect(page.locator('astro-island[component-url*="SplashIntro"]')).not.toHaveAttribute(
    'ssr',
    '',
  );
  const enterButton = page.getByRole('button', { name: 'Role para entrar' });
  await expect(enterButton).toBeVisible();
  await enterButton.click();
  await expect(page.locator('[data-splash-intro]')).toBeHidden({ timeout: 15_000 });
};

const enterPortfolio = async (page: Page) => {
  await finishSplash(page);
  await page.getByRole('button', { name: 'Navegador' }).click();
  await expect(page.locator('#projetos')).toBeVisible();
};

const openSystemScreen = async (page: Page, screenName: string) => {
  await page.getByRole('button', { name: 'Voltar ao menu principal' }).click();
  await page.getByRole('button', { name: 'Configuração do Sistema' }).click();
  await page.getByRole('button', { name: screenName, exact: true }).click();
};

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-interface-controller-ready', 'true');
  await enterPortfolio(page);
});

test('usa a splash como entrada e revela o menu orbital ao rolar', async ({ page }) => {
  await page.goto('/');
  const splash = page.locator('[data-splash-intro]');

  await expect(splash).toBeVisible();
  await expect(splash.getByRole('heading', { name: 'Gustavo Dias' })).toBeVisible();
  await expect(splash.getByRole('button', { name: 'Role para entrar' })).toBeVisible();
  await expect
    .poll(() =>
      splash.locator('[data-splash-canvas]').evaluate((canvas: HTMLCanvasElement) => canvas.width),
    )
    .toBeGreaterThan(300);

  await page.mouse.wheel(0, 220);
  await expect
    .poll(() => splash.getAttribute('data-transition-progress').then(Number))
    .toBeGreaterThan(0.2);
  await expect(splash).toBeVisible();

  await page.mouse.wheel(0, -140);
  await expect
    .poll(() => splash.getAttribute('data-transition-progress').then(Number))
    .toBeLessThan(0.15);

  for (let step = 0; step < 4; step += 1) {
    await page.mouse.wheel(0, 300);
  }
  await expect(splash).toBeHidden();
  await expect(page.getByRole('navigation', { name: 'Opções do portfólio' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Navegador' })).toHaveAttribute(
    'aria-current',
    'true',
  );
  await expect(page.locator('#projetos')).toBeHidden();
  await expect(page.locator('.orbital-path')).toHaveCount(4);
  await expect(page.locator('.orbital-ring, .orbital-haze, .orbital-core')).toHaveCount(0);
  const light = page.locator('.orbital-light').first();
  const initialLightPosition = await light.boundingBox();
  await page.waitForTimeout(600);
  const nextLightPosition = await light.boundingBox();
  expect(
    initialLightPosition &&
      nextLightPosition &&
      Math.hypot(
        nextLightPosition.x - initialLightPosition.x,
        nextLightPosition.y - initialLightPosition.y,
      ),
  ).toBeGreaterThan(5);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

  await page.mouse.wheel(0, -180);
  await expect(splash).toBeVisible();
  await expect(page.locator('html')).toHaveClass(/splash-active/);
  await expect
    .poll(() => splash.getAttribute('data-transition-progress').then(Number))
    .toBeLessThan(0.98);

  for (let step = 0; step < 4; step += 1) {
    await page.mouse.wheel(0, 300);
  }
  await expect(splash).toBeHidden();
  await expect(page.getByRole('button', { name: 'Navegador' })).toBeFocused();
});

test('reabre a intro somente a partir do menu principal', async ({ page }) => {
  const splash = page.locator('[data-splash-intro]');

  await page.mouse.wheel(0, -240);
  await expect(splash).toBeHidden();

  await page.getByRole('button', { name: 'Voltar ao menu principal' }).click();
  await page.getByRole('button', { name: 'Abrir apresentação' }).click();
  await page.mouse.wheel(0, -240);
  await expect(splash).toBeHidden();

  const heroScreen = page.locator('[data-screen="hero"]');
  await expect(heroScreen).toBeVisible();
  await expect
    .poll(() => heroScreen.evaluate((element) => getComputedStyle(element).backgroundImage))
    .toContain('radial-gradient');
  await expect
    .poll(() =>
      heroScreen.evaluate((element) => getComputedStyle(element, '::before').backgroundImage),
    )
    .toContain('repeating-linear-gradient');

  await page.getByRole('button', { name: 'Voltar ao menu principal' }).click();
  await page.getByRole('button', { name: 'Configuração do Sistema' }).click();
  await page.getByRole('button', { name: 'Experiência', exact: true }).click();
  await page.mouse.wheel(0, -240);
  await expect(splash).toBeHidden();

  await page.getByRole('button', { name: 'Voltar para Configuração do Sistema' }).click();
  await page.getByRole('button', { name: 'Voltar' }).click();
  await page.mouse.wheel(0, -240);
  await expect(splash).toBeVisible();
});

test('abre projetos pelo Browser e agrupa as demais opções no System Configuration', async ({
  page,
}) => {
  await page.goto('/');
  await finishSplash(page);

  await page.getByRole('button', { name: 'Configuração do Sistema' }).click();
  const systemMenu = page.getByRole('navigation', { name: 'Opções do portfólio' });
  await expect(systemMenu.getByRole('button', { name: 'Experiência' })).toHaveAttribute(
    'aria-current',
    'true',
  );
  await expect(systemMenu.getByRole('button', { name: 'Habilidades' })).toBeVisible();
  await expect(systemMenu.getByRole('button', { name: 'Sobre' })).toBeVisible();
  await expect(systemMenu.getByRole('button', { name: 'Contato' })).toBeVisible();

  const secondaryScreens = [
    { name: 'Experiência', hash: 'experiencia', shortcut: false },
    { name: 'Habilidades', hash: 'habilidades', shortcut: true },
    { name: 'Sobre', hash: 'sobre', shortcut: false },
    { name: 'Contato', hash: 'contato', shortcut: true },
  ];

  for (const screen of secondaryScreens) {
    await systemMenu.getByRole('button', { name: screen.name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#${screen.hash}$`));
    await expect(page.locator(`#${screen.hash}`)).toBeInViewport();
    if (screen.hash === 'sobre') {
      await expect(page.getByRole('heading', { level: 1, name: 'Sobre mim' })).toBeVisible();
    }

    const returnButton = page.getByRole('button', {
      name: 'Voltar para Configuração do Sistema',
    });
    await expect(returnButton).toBeVisible();
    await expect(returnButton).toHaveAttribute('data-return-destination', 'system');

    if (screen.shortcut) await page.keyboard.press('Escape');
    else await returnButton.click();

    await expect(page.locator('[data-menu-view="system"]')).toBeVisible();
    const restoredOption = systemMenu.getByRole('button', { name: screen.name, exact: true });
    await expect(restoredOption).toHaveAttribute('aria-current', 'true');
    await expect(restoredOption).toBeFocused();
  }
});

test('sincroniza cubos, relógio e modo Visor no System Configuration', async ({ page }) => {
  await page.getByRole('button', { name: 'Voltar ao menu principal' }).click();
  await page.getByRole('button', { name: 'Configuração do Sistema' }).click();

  const menu = page.locator('[data-menu-view="system"]');
  const scene = page.locator('[data-system-scene]');
  await expect(menu).toBeVisible();
  await expect(scene).toHaveAttribute('data-cube-count', '5');
  await expect(scene).toHaveAttribute('data-selected-index', '0');
  await expect(scene).toHaveAttribute('data-scene-ready', /^(true|fallback)$/);
  await expect(scene.locator('canvas')).toHaveCount(1);
  await expect(menu.locator('.system-date')).toHaveText(/^\d{4}\/\d{2}\/\d{2}$/);
  await expect(menu.locator('.system-time')).toHaveText(/^\d{2}:\d{2}:\d{2}$/);

  const initialTime = await menu.locator('.system-time').textContent();
  await expect.poll(() => menu.locator('.system-time').textContent()).not.toBe(initialTime);

  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('button', { name: 'Habilidades', exact: true })).toHaveAttribute(
    'aria-current',
    'true',
  );
  await expect(scene).toHaveAttribute('data-selected-index', '1');

  await page.getByRole('button', { name: 'Ativar Visor' }).click();
  await expect(page.locator('[data-menu-view="viewer"]')).toBeVisible();
  await expect(scene).toHaveAttribute('data-viewer-mode', 'true');
  await expect(page.getByRole('navigation', { name: 'Opções do portfólio' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Sair do Visor' })).toBeFocused();

  await page.keyboard.press('z');
  await expect(page.locator('[data-menu-view="system"]')).toBeVisible();
  await expect(scene).toHaveAttribute('data-viewer-mode', 'false');
  await expect(page.getByRole('button', { name: 'Habilidades', exact: true })).toHaveAttribute(
    'aria-current',
    'true',
  );

  await page.getByRole('button', { name: 'Ativar Visor' }).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-menu-view="system"]')).toBeVisible();
});

test('mantém System Configuration utilizável em viewport móvel', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Voltar ao menu principal' }).click();
  await page.getByRole('button', { name: 'Configuração do Sistema' }).click();

  await expect(page.getByRole('heading', { name: 'Configuração do Sistema' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Contato', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ativar Visor' })).toBeVisible();
  await expect(page.locator('.system-date')).toBeVisible();
  await expect(page.locator('.system-time')).toBeVisible();

  await page.getByRole('button', { name: 'Contato', exact: true }).click();
  await expect(page.locator('#contato')).toBeInViewport();
  const emailLink = page.getByRole('link', {
    name: 'Enviar e-mail para Gustavo Dias',
  });
  await expect(emailLink).toBeVisible();
  await expect(emailLink).toHaveAttribute('href', 'mailto:dscharraa@gmail.com');
  const actionsBox = await page.locator('.contact-actions').boundingBox();
  const returnBox = await page
    .getByRole('button', { name: 'Voltar para Configuração do Sistema' })
    .boundingBox();
  expect(actionsBox).not.toBeNull();
  expect(returnBox).not.toBeNull();
  if (!actionsBox || !returnBox) throw new Error('Elementos de contato não foram renderizados');
  expect(returnBox.y).toBeGreaterThan(actionsBox.y + actionsBox.height);
});

test('troca o idioma pelo submenu e persiste a escolha entre visitas', async ({ page }) => {
  await page.getByRole('button', { name: 'Voltar ao menu principal' }).click();
  await page.getByRole('button', { name: 'Configuração do Sistema' }).click();
  await page.getByRole('button', { name: 'Idioma', exact: true }).click();

  const languageMenu = page.getByRole('navigation', { name: 'Seleção de idioma' });
  await expect(languageMenu.getByRole('button', { name: 'Português (Brasil)' })).toHaveAttribute(
    'aria-current',
    'true',
  );
  await languageMenu.getByRole('button', { name: 'Português (Brasil)' }).click();
  await expect(languageMenu).toBeVisible();
  await expect(page).not.toHaveURL(/\/en\/$/);
  await page.keyboard.press('ArrowDown');
  await expect(languageMenu.getByRole('button', { name: 'English' })).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(/\/en\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('button', { name: 'Scroll to enter' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('portfolio-locale'))).toBe('en');

  await page.goto('/');
  await expect(page).toHaveURL(/\/en\/$/);

  await page.getByRole('button', { name: 'Scroll to enter' }).click();
  await expect(page.locator('[data-splash-intro]')).toBeHidden({ timeout: 15_000 });
  await page.getByRole('button', { name: 'System Configuration' }).click();
  await page.getByRole('button', { name: 'Language', exact: true }).click();
  await page.getByRole('button', { name: 'Português (Brasil)' }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('portfolio-locale')))
    .toBe('pt-BR');
});

test('publica metadados e alternates localizados nas duas rotas', async ({ page }) => {
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/$/);
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
    'href',
    /\/en\/$/,
  );
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'pt_BR');

  await page.goto('/en/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page).toHaveTitle(/Front-end Developer/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/en\/$/);
  await expect(page.locator('link[rel="alternate"][hreflang="pt-BR"]')).toHaveAttribute(
    'href',
    /\/$/,
  );
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'en_US');
  await expect
    .poll(() => page.locator('script[type="application/ld+json"]').textContent())
    .toContain('Front-end Developer and UI/UX Designer');
});

test('exibe cada seção como uma tela isolada e abre o Hero pelo triângulo', async ({ page }) => {
  await expect(page.locator('#projetos')).toBeVisible();
  for (const id of ['hero', 'experiencia', 'habilidades', 'sobre', 'contato']) {
    await expect(page.locator(`#${id}`)).toBeHidden();
  }
  await expect(page).toHaveURL(/#projetos$/);

  await page.getByRole('button', { name: 'Voltar ao menu principal' }).click();
  await page.getByRole('button', { name: 'Abrir apresentação' }).click();
  await expect(page.locator('#hero')).toBeVisible();
  await expect(page.locator('#projetos')).toBeHidden();
  await expect(page.getByRole('heading', { level: 1, name: 'Gustavo Dias' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Voltar ao menu principal' })).toBeVisible();
  await expect(page).toHaveURL(/#hero$/);

  await page.getByRole('link', { name: 'Explorar projetos' }).click();
  await expect(page.locator('#projetos')).toBeVisible();
  await expect(page.locator('#hero')).toBeHidden();
  await expect(page).toHaveURL(/#projetos$/);
});

test('abre e fecha a prova de habilidade com controles acessíveis', async ({ page }) => {
  await openSystemScreen(page, 'Habilidades');
  await expect(
    page.locator('astro-island[component-url*="SkillsProofIsland"]'),
  ).not.toHaveAttribute('ssr', '');
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
  await page.locator('[data-memory-slot="published"]').click();
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
  const skipLink = page.getByRole('link', { name: 'Pular para o conteúdo' });
  await skipLink.focus();
  await expect(skipLink).toBeFocused();
  await skipLink.press('Enter');
  await expect(page.locator('#conteudo')).toBeFocused();
});

test('executa os comandos de teclado no contexto correto da interface', async ({ page }) => {
  await openSystemScreen(page, 'Habilidades');
  const skillTrigger = page.locator('[data-proof-trigger="interfaces"]');
  await skillTrigger.scrollIntoViewIfNeeded();
  await skillTrigger.focus();
  await page.keyboard.press('x');

  const skillDialog = page.getByRole('dialog', { name: 'Interfaces' });
  await expect(skillDialog).toBeVisible();
  await page.keyboard.press('o');
  await expect(skillDialog).not.toBeVisible();

  await page.getByRole('button', { name: 'Voltar para Configuração do Sistema' }).click();
  await expect(page.getByRole('button', { name: 'Habilidades', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Voltar' }).click();
  await page.getByRole('button', { name: 'Navegador' }).click();
  await expect(page.locator('#projetos astro-island')).not.toHaveAttribute('ssr', '', {
    timeout: 15_000,
  });
  await page.locator('[data-memory-slot="published"]').click();
  const projectTrigger = page.locator('[data-project-trigger="1"]:visible').first();
  await projectTrigger.scrollIntoViewIfNeeded();
  await projectTrigger.focus();
  await page.keyboard.press('x');

  const projectDialog = page.getByRole('dialog', { name: 'InfoShop' });
  await expect(projectDialog).toBeVisible();

  await projectDialog.getByRole('link', { name: 'Abrir repositório' }).scrollIntoViewIfNeeded();
  const repositoryPagePromise = page.waitForEvent('popup');
  await page.keyboard.press('z');
  const repositoryPage = await repositoryPagePromise;
  await expect(repositoryPage).toHaveURL(/github\.com\/Gust4v0Di4sC\/Info-Shop\/?$/);
  await repositoryPage.close();

  await page.keyboard.press('Escape');
  await expect(projectDialog).not.toBeVisible();
});

test('separa os projetos entre os dois Memory Cards', async ({ page }) => {
  const projectBrowser = page.locator('#projetos astro-island');
  await projectBrowser.scrollIntoViewIfNeeded();
  await expect(projectBrowser).not.toHaveAttribute('ssr', '', {
    timeout: 15_000,
  });
  await expect(page.locator('[data-memory-slot]')).toHaveCount(2);

  await page.locator('[data-memory-slot="published"]').click();
  await expect(page.locator('[data-project-trigger="1"]')).toBeVisible();
  await expect(page.locator('[data-project-trigger="2"]')).toBeVisible();
  await expect(page.locator('[data-project-trigger="3"]')).toHaveCount(0);

  await page.getByRole('button', { name: 'Trocar Memory Card' }).click();
  await page.locator('[data-memory-slot="construction"]').click();
  await expect(page.locator('[data-project-trigger="3"]')).toBeVisible();
  await expect(page.locator('[data-project-trigger="4"]')).toBeVisible();
  await expect(page.locator('[data-project-trigger="1"]')).toHaveCount(0);
});

test('abre a seleção de Memory Cards somente após acionar o Browser', async ({ page }) => {
  await page.goto('/?fluxo=inicial#projetos');
  await finishSplash(page);

  await expect(page.locator('#projetos')).toBeHidden();
  await expect(page.locator('[data-memory-slot]:visible')).toHaveCount(0);
  await expect(page).not.toHaveURL(/#projetos$/);

  await page.getByRole('button', { name: 'Navegador' }).click();
  await expect(page.locator('#projetos')).toBeVisible();
  await expect(page.locator('[data-memory-slot]:visible')).toHaveCount(2);

  await page.locator('[data-memory-slot="published"]').click();
  await expect(page.locator('[data-project-trigger="1"]')).toBeVisible();
  await page.getByRole('button', { name: 'Voltar ao menu principal' }).click();
  await page.getByRole('button', { name: 'Navegador' }).click();

  await expect(page.locator('[data-memory-slot]:visible')).toHaveCount(2);
  await expect(page.locator('[data-project-trigger="1"]')).toHaveCount(0);
});

test('abre, joga, fecha e recria o minijogo do hero sem duplicar o canvas', async ({ page }) => {
  test.setTimeout(45_000);
  await page.getByRole('button', { name: 'Voltar ao menu principal' }).click();
  await page.getByRole('button', { name: 'Abrir apresentação' }).click();

  const trigger = page.getByRole('button', { name: 'Abrir o minijogo Fuga do Buraco Negro' });
  await expect(trigger).toBeVisible();
  await trigger.click();

  const dialog = page.getByRole('dialog', { name: 'Fuga do Buraco Negro' });
  const gameHost = dialog.getByRole('button', {
    name: 'Jogo de plataforma Fuga do Buraco Negro',
  });
  await expect(dialog).toBeVisible();
  await expect(gameHost).toHaveAttribute('data-game-state', 'ready', { timeout: 15_000 });
  await expect(gameHost.locator('canvas')).toHaveCount(1);

  await page.keyboard.press('Space');
  await expect(gameHost).toHaveAttribute('data-game-state', 'playing');
  await expect(gameHost).toHaveAttribute('data-player-motion', 'running');
  await expect
    .poll(() => dialog.locator('[data-game-score]').textContent().then(Number))
    .toBeGreaterThan(0);

  await page.keyboard.press('Space');
  await expect(gameHost).toHaveAttribute('data-player-motion', /rising|falling/);

  const firstBlackHoleFrame = await gameHost.getAttribute('data-black-hole-frame');
  await expect
    .poll(() => gameHost.getAttribute('data-black-hole-frame'))
    .not.toBe(firstBlackHoleFrame);

  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(gameHost).toHaveAttribute('data-game-state', 'paused');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(gameHost).toHaveAttribute('data-game-state', 'playing');

  await expect(gameHost).toHaveAttribute('data-game-state', 'gameover', { timeout: 20_000 });
  await expect(dialog.getByText('O vazio alcançou você')).toBeVisible();
  const savedBest = Number(await dialog.locator('[data-game-best]').textContent());
  expect(savedBest).toBeGreaterThan(0);
  await expect
    .poll(() => page.evaluate(() => Number(localStorage.getItem('portfolio-black-hole-best'))))
    .toBe(savedBest);

  await dialog.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(gameHost).toHaveAttribute('data-game-state', 'playing');
  await expect(gameHost).toHaveAttribute('data-player-motion', 'running');
  await expect(gameHost).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(gameHost.locator('canvas')).toHaveCount(0);

  await trigger.click();
  await expect(dialog).toBeVisible();
  await expect(gameHost).toHaveAttribute('data-game-state', 'ready', { timeout: 15_000 });
  await expect(gameHost.locator('canvas')).toHaveCount(1);
  await expect(dialog.locator('[data-game-best]')).toHaveText(
    savedBest.toString().padStart(4, '0'),
  );
});

test('localiza e ajusta o minijogo para viewport móvel', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en/');
  await page.getByRole('button', { name: 'Scroll to enter' }).click();
  await expect(page.locator('[data-splash-intro]')).toBeHidden({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Browser' }).click();
  await page.getByRole('button', { name: 'Return to main menu' }).click();
  await page.getByRole('button', { name: 'Open presentation' }).click();
  await page.getByRole('button', { name: 'Open the Escape the Black Hole minigame' }).click();

  const dialog = page.getByRole('dialog', { name: 'Escape the Black Hole' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Ready to run?')).toBeVisible({ timeout: 15_000 });
  const box = await dialog.boundingBox();
  expect(box).not.toBeNull();
  if (!box) throw new Error('O modal do minijogo não foi renderizado');
  expect(box.width).toBeLessThanOrEqual(390);
  expect(box.height).toBeLessThanOrEqual(844);
});
