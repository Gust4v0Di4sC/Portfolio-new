export type SkillIcon =
  | 'accessibility'
  | 'appWindow'
  | 'atom'
  | 'braces'
  | 'cable'
  | 'cloudUpload'
  | 'codeXml'
  | 'fileType'
  | 'fingerprint'
  | 'flask'
  | 'gauge'
  | 'gitBranch'
  | 'layout'
  | 'listChecks'
  | 'mousePointer'
  | 'orbit'
  | 'palette'
  | 'panels'
  | 'penTool'
  | 'searchCheck';

export const skillsContent = {
  eyebrow: 'System Abilities',
  title: 'Habilidades',
  cardEyebrow: 'Skill Set',
  singularProject: 'projeto',
  pluralProjects: 'projetos',
  skillListLabel: 'Habilidades de',
  dialogEyebrow: 'Proof of Concept',
  closeLabel: 'Fechar prova de conceito',
  relatedSkillsLabel: 'Habilidades relacionadas',
  actionsLabel: 'Ações da prova de conceito',
  projectsAction: 'Projetos',
  backAction: 'Voltar',
  groups: [
    {
      slug: 'interfaces',
      title: 'Interfaces',
      summary:
        'Aplicação prática em telas responsivas, semânticas e preparadas para leitura por tecnologias assistivas.',
      skills: [
        { name: 'HTML', icon: 'codeXml' },
        { name: 'CSS', icon: 'palette' },
        { name: 'Acessibilidade', icon: 'accessibility' },
        { name: 'Responsividade', icon: 'panels' },
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
        { name: 'Astro', icon: 'orbit' },
        { name: 'React', icon: 'atom' },
        { name: 'Next.js', icon: 'appWindow' },
        { name: 'TypeScript', icon: 'fileType' },
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
        { name: 'APIs', icon: 'cable' },
        { name: 'Git', icon: 'gitBranch' },
        { name: 'Deploy', icon: 'cloudUpload' },
        { name: 'SEO', icon: 'searchCheck' },
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
        { name: 'Lint', icon: 'listChecks' },
        { name: 'Testes', icon: 'flask' },
        { name: 'Performance', icon: 'gauge' },
        { name: 'Semântica', icon: 'braces' },
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
        { name: 'UI', icon: 'layout' },
        { name: 'UX', icon: 'mousePointer' },
        { name: 'Figma', icon: 'penTool' },
        { name: 'Identidade visual', icon: 'fingerprint' },
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
  ] satisfies Array<{
    slug: string;
    title: string;
    summary: string;
    skills: Array<{ name: string; icon: SkillIcon }>;
    proofProjects: Array<{ title: string; category: string; evidence: string; stack: string[] }>;
  }>,
} as const;
