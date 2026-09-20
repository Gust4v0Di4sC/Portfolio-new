import { describe, expect, it } from 'vitest';

import {
  experienceContent,
  navigationContent,
  projectsContent,
  siteContent,
  skillsContent,
} from '../../src/content';

describe('blocos de conteúdo', () => {
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
    expect(experienceContent.items).toHaveLength(2);
    expect(projectsContent.items).toHaveLength(4);
    expect(skillsContent.groups).toHaveLength(5);
    for (const project of projectsContent.items) {
      expect(project.title).not.toBe('');
      expect(project.description.length).toBeGreaterThan(20);
      expect(project.stack.length).toBeGreaterThan(0);
    }
    expect(projectsContent.items.filter(({ status }) => status === 'construction')).toHaveLength(2);
  });
});
