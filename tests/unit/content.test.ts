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
    expect(portuguese.splash.invitation).toBe('Entre e faça parte da experiência.');
    expect(english.splash.invitation).toBe('Step in and be part of the experience.');
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

  it('liga as provas de habilidade aos projetos cadastrados', () => {
    const projectTitles = new Set(projectsContent.items.map(({ title }) => title));

    for (const group of skillsContent.groups) {
      for (const project of group.proofProjects) {
        expect(projectTitles.has(project.title)).toBe(true);
      }
    }
  });
});
