import { describe, expect, it } from 'vitest';

import {
  defaultLocale,
  experienceContent,
  getContent,
  locales,
  navigationContent,
  projectsContent,
  siteContent,
  skillsContent,
} from '../../src/content';

describe('blocos de conteúdo', () => {
  it('registra português como padrão e oferece o pacote completo em inglês', () => {
    expect(defaultLocale).toBe('pt-BR');
    expect(locales).toEqual(['pt-BR', 'en']);

    const portuguese = getContent('pt-BR');
    const english = getContent('en');
    expect(portuguese.site.language).toBe('pt-BR');
    expect(english.site.language).toBe('en');
    expect(english.menu.systemTitle).toBe('System Configuration');
    expect(english.projects.items.map(({ id }) => id)).toEqual(
      portuguese.projects.items.map(({ id }) => id),
    );
    expect(english.skills.groups.map(({ slug }) => slug)).toEqual(
      portuguese.skills.groups.map(({ slug }) => slug),
    );
    expect(portuguese.hero.game.title).toBe('Fuga do Buraco Negro');
    expect(english.hero.game.title).toBe('Escape the Black Hole');
    expect(portuguese.about.title).toBe('Sobre mim');
    expect(english.about.title).toBe('About me');
    expect(portuguese.contact.action.label).toBe('Enviar e-mail');
    expect(english.contact.action.label).toBe('Send email');
    expect(portuguese.contact.action.href).toBe('mailto:dscharraa@gmail.com');
  });

  it('mantém os metadados essenciais preenchidos', () => {
    expect(siteContent.language).toBe('pt-BR');
    expect(siteContent.title).toContain('Gustavo Dias');
    expect(siteContent.description.length).toBeGreaterThan(20);
  });

  it('aponta a navegação para seções existentes', () => {
    expect(navigationContent.items.map(({ href }) => href)).toEqual([
      '#experiencia',
      '#projetos',
      '#habilidades',
      '#sobre',
      '#contato',
    ]);
  });

  it('mantém cards editoriais com conteúdo mínimo', () => {
    expect(experienceContent.items).toHaveLength(4);
    expect(projectsContent.items).toHaveLength(4);
    expect(skillsContent.groups).toHaveLength(5);
    for (const project of projectsContent.items) {
      expect(project.title).not.toBe('');
      expect(project.description.length).toBeGreaterThan(20);
      expect(project.stack.length).toBeGreaterThan(0);
    }
    expect(projectsContent.items.filter(({ status }) => status === 'construction')).toHaveLength(2);
  });

  it('configura prévias WebM somente para InfoShop e PetCorner', () => {
    const projectsWithPreview = projectsContent.items.filter(({ previewSlug }) => previewSlug);

    expect(projectsWithPreview.map(({ title }) => title)).toEqual(['InfoShop', 'PetCorner']);
    expect(projectsWithPreview.map(({ previewSlug }) => previewSlug)).toEqual([
      'infoshop',
      'pet-corner',
    ]);
  });

  it('mantém as auditorias de projeto localizadas e com pontuações válidas', () => {
    const portuguese = getContent('pt-BR');
    const english = getContent('en');
    const portugueseAudits = portuguese.projects.items.filter(({ audit }) => audit);
    const englishAudits = english.projects.items.filter(({ audit }) => audit);

    expect(portugueseAudits.map(({ title }) => title)).toEqual(['InfoShop', 'PetCorner']);
    expect(englishAudits.map(({ title }) => title)).toEqual(['InfoShop', 'PetCorner']);
    expect(portuguese.projects.dialog.metricsLabel).toBe('Métricas de performance');
    expect(english.projects.dialog.metricsLabel).toBe('Performance metrics');

    for (const project of portugueseAudits) {
      expect(project.audit?.tool).toBe('Lighthouse');
      expect(project.audit?.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      for (const score of Object.values(project.audit?.scores ?? {})) {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }
    }
  });

  it('liga as provas de habilidade aos projetos cadastrados', () => {
    const projectTitles = new Set(projectsContent.items.map(({ title }) => title));

    for (const group of skillsContent.groups) {
      for (const project of group.proofProjects) {
        expect(projectTitles.has(project.title)).toBe(true);
      }
    }
  });
});
