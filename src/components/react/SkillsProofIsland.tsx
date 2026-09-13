import { useCallback, useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Accessibility,
  AppWindow,
  Atom,
  Braces,
  Cable,
  CloudUpload,
  CodeXml,
  FileType,
  FingerprintPattern,
  FlaskConical,
  Gauge,
  GitBranch,
  LayoutPanelTop,
  ListChecks,
  MousePointerClick,
  Orbit,
  Palette,
  PanelsTopLeft,
  PenTool,
  SearchCheck,
} from 'lucide-react';

import './SkillsProofIsland.css';

type ProofProject = {
  title: string;
  category: string;
  evidence: string;
  stack: string[];
};

type SkillItem = {
  name: string;
  Icon: LucideIcon;
};

type SkillGroup = {
  slug: string;
  title: string;
  summary: string;
  skills: SkillItem[];
  proofProjects: ProofProject[];
};

const groups: SkillGroup[] = [
  {
    slug: 'interfaces',
    title: 'Interfaces',
    summary:
      'Aplicação prática em telas responsivas, semânticas e preparadas para leitura por tecnologias assistivas.',
    skills: [
      { name: 'HTML', Icon: CodeXml },
      { name: 'CSS', Icon: Palette },
      { name: 'Acessibilidade', Icon: Accessibility },
      { name: 'Responsividade', Icon: PanelsTopLeft },
    ],
    proofProjects: [
      {
        title: 'Portfolio PS2',
        category: 'Interface principal',
        evidence:
          'Estrutura semântica em seções, grids responsivos, foco visível e controles com estados de hover/focus.',
        stack: ['Astro', 'HTML', 'CSS', 'Acessibilidade'],
      },
      {
        title: 'Memory Card de Projetos',
        category: 'Componente visual',
        evidence:
          'Cards de save com hierarquia clara, conteúdo escaneável e comportamento consistente em telas pequenas.',
        stack: ['CSS Grid', 'Responsividade', 'UI'],
      },
    ],
  },
  {
    slug: 'frameworks',
    title: 'Frameworks',
    summary:
      'Aplicação prática na composição do site com Astro e ilhas React para recursos interativos específicos.',
    skills: [
      { name: 'Astro', Icon: Orbit },
      { name: 'React', Icon: Atom },
      { name: 'Next.js', Icon: AppWindow },
      { name: 'TypeScript', Icon: FileType },
    ],
    proofProjects: [
      {
        title: 'Portfolio PS2',
        category: 'Arquitetura front-end',
        evidence:
          'Páginas e componentes em Astro, com componentes React isolados para splash, background e controles da interface.',
        stack: ['Astro', 'React', 'TypeScript'],
      },
      {
        title: 'Interface Controller',
        category: 'Interação client-side',
        evidence:
          'Camada React dedicada para efeitos e comandos globais sem transformar todo o site em SPA.',
        stack: ['React', 'TypeScript'],
      },
    ],
  },
  {
    slug: 'integracoes',
    title: 'Integrações',
    summary:
      'Aplicação prática em navegação, publicação, leitura por buscadores e fluxo de versionamento.',
    skills: [
      { name: 'APIs', Icon: Cable },
      { name: 'Git', Icon: GitBranch },
      { name: 'Deploy', Icon: CloudUpload },
      { name: 'SEO', Icon: SearchCheck },
    ],
    proofProjects: [
      {
        title: 'Base de Portfolio',
        category: 'Publicação',
        evidence:
          'Configuração Astro com sitemap, robots, favicon e metadados de página para indexação.',
        stack: ['Astro Sitemap', 'SEO', 'Deploy'],
      },
      {
        title: 'Fluxo de branch por feature',
        category: 'Versionamento',
        evidence:
          'Alterações isoladas em branch de feature, mantendo o fluxo de revisão pronto para pull request.',
        stack: ['Git', 'Branching'],
      },
    ],
  },
  {
    slug: 'qualidade',
    title: 'Qualidade',
    summary:
      'Aplicação prática em validação de build, padrões de código e decisões voltadas a estabilidade visual.',
    skills: [
      { name: 'Lint', Icon: ListChecks },
      { name: 'Testes', Icon: FlaskConical },
      { name: 'Performance', Icon: Gauge },
      { name: 'Semântica', Icon: Braces },
    ],
    proofProjects: [
      {
        title: 'Pipeline local',
        category: 'Validação',
        evidence:
          'Scripts de lint, check, build e testes configurados no projeto para verificar regressão antes de publicar.',
        stack: ['ESLint', 'Astro Check', 'Vitest'],
      },
      {
        title: 'Componentes estáticos primeiro',
        category: 'Performance',
        evidence:
          'Interatividade adicionada de forma pontual, preservando HTML renderizado pelo Astro e baixo custo de JavaScript.',
        stack: ['Astro', 'Semântica', 'Performance'],
      },
    ],
  },
  {
    slug: 'design',
    title: 'Design',
    summary:
      'Aplicação prática em direção visual, microinterações e consistência de experiência inspirada no universo PS2.',
    skills: [
      { name: 'UI', Icon: LayoutPanelTop },
      { name: 'UX', Icon: MousePointerClick },
      { name: 'Figma', Icon: PenTool },
      { name: 'Identidade visual', Icon: FingerprintPattern },
    ],
    proofProjects: [
      {
        title: 'Sistema visual PS2',
        category: 'Identidade',
        evidence:
          'Tokens de cor, tipografia, bordas, controles e estados visuais alinhados ao tema de Memory Card.',
        stack: ['UI', 'Identidade visual', 'CSS Tokens'],
      },
      {
        title: 'Jornada de Portfolio',
        category: 'Experiência',
        evidence:
          'Navegação por seções com chamadas claras, feedback visual em controles e conteúdo organizado por contexto.',
        stack: ['UX', 'Figma', 'Interação'],
      },
    ],
  },
];

export default function SkillsProofIsland() {
  const [selectedGroup, setSelectedGroup] = useState<SkillGroup | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const closeDialog = useCallback(() => {
    dialogRef.current?.close();
    setSelectedGroup(null);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (selectedGroup && !dialog.open) {
      dialog.showModal();
    }

    if (!selectedGroup && dialog.open) {
      dialog.close();
    }
  }, [selectedGroup]);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return undefined;
    }

    const handleClose = () => setSelectedGroup(null);
    const handleClick = (event: MouseEvent) => {
      if (event.target === dialog) {
        closeDialog();
      }
    };

    dialog.addEventListener('close', handleClose);
    dialog.addEventListener('click', handleClick);

    return () => {
      dialog.removeEventListener('close', handleClose);
      dialog.removeEventListener('click', handleClick);
    };
  }, [closeDialog]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const dialog = dialogRef.current;

      if (event.key !== 'Escape' || !dialog?.open) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      closeDialog();
    };

    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [closeDialog]);

  return (
    <section
      id="habilidades"
      className="skills section-shell container"
      aria-labelledby="habilidades-title"
    >
      <div className="section-heading">
        <p>System Abilities</p>
        <h2 id="habilidades-title">Habilidades</h2>
      </div>

      <div className="skill-grid">
        {groups.map((group) => (
          <button
            className="skill-group"
            type="button"
            key={group.slug}
            aria-controls="skill-proof-dialog"
            aria-haspopup="dialog"
            data-sound="confirm"
            data-proof-trigger={group.slug}
            onClick={() => setSelectedGroup(group)}
          >
            <span className="skill-group-header">
              <span>
                <span className="skill-kicker">Skill Set</span>
                <span className="skill-title">{group.title}</span>
              </span>
              <span className="proof-count">
                {group.proofProjects.length}{' '}
                {group.proofProjects.length === 1 ? 'projeto' : 'projetos'}
              </span>
            </span>

            <span className="skill-list" aria-label={`Habilidades de ${group.title}`}>
              {group.skills.map(({ name, Icon }) => (
                <span className="skill-row" key={name}>
                  <span className="skill-icon" aria-hidden="true">
                    <Icon size={18} strokeWidth={1.7} />
                  </span>
                  <span>{name}</span>
                </span>
              ))}
            </span>
          </button>
        ))}
      </div>

      <dialog
        id="skill-proof-dialog"
        className="skill-proof-dialog"
        aria-labelledby="skill-proof-title"
        aria-describedby="skill-proof-summary"
        ref={dialogRef}
      >
        {selectedGroup && (
          <article className="proof-panel">
            <header className="proof-header">
              <div>
                <p>Proof of Concept</p>
                <h3 id="skill-proof-title">{selectedGroup.title}</h3>
                <span id="skill-proof-summary">{selectedGroup.summary}</span>
              </div>

              <button
                className="proof-close ps-control ps-control-circle"
                type="button"
                aria-label="Fechar prova de conceito"
                data-sound="back"
                onClick={closeDialog}
              >
                <span className="ps-symbol" aria-hidden="true">
                  ×
                </span>
              </button>
            </header>

            <div className="proof-skills" aria-label="Habilidades relacionadas">
              {selectedGroup.skills.map(({ name }) => (
                <span key={name}>{name}</span>
              ))}
            </div>

            <ul className="proof-list">
              {selectedGroup.proofProjects.map((project) => (
                <li key={`${selectedGroup.slug}-${project.title}`}>
                  <strong>{project.title}</strong>
                  <span>{project.category}</span>
                  <p>{project.evidence}</p>
                  <small>{project.stack.join(' + ')}</small>
                </li>
              ))}
            </ul>

            <footer className="proof-actions" aria-label="Ações da prova de conceito">
              <a
                className="ps-control ps-control-cross"
                href="#projetos"
                data-sound="confirm"
                onClick={closeDialog}
              >
                <span className="ps-symbol" aria-hidden="true">
                  ×
                </span>
                <span>Projetos</span>
              </a>
              <button
                className="ps-control ps-control-circle"
                type="button"
                data-sound="back"
                onClick={closeDialog}
              >
                <span className="ps-symbol" aria-hidden="true">
                  ○
                </span>
                <span>Voltar</span>
              </button>
            </footer>
          </article>
        )}
      </dialog>
    </section>
  );
}
