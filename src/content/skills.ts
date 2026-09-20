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
          title: 'InfoShop',
          category: 'E-commerce responsivo',
          evidence:
            'Interface de loja com catálogo, listagens, carrinho, checkout e painel administrativo organizados em fluxos claros.',
          stack: ['Angular', 'TypeScript', 'HTML', 'CSS'],
        },
        {
          title: 'PetCorner',
          category: 'Ecossistema para pet shop',
          evidence:
            'Área pública e espaço do cliente com vitrine, pets, carrinho, pedidos e agendamentos reunidos em uma experiência consistente.',
          stack: ['Next.js', 'React', 'Responsividade', 'UI'],
        },
      ],
    },
    {
      slug: 'frameworks',
      title: 'Frameworks',
      summary:
        'Aplicação prática de frameworks modernos na construção de produtos web completos e interfaces componentizadas.',
      skills: [
        { name: 'Astro', icon: 'orbit' },
        { name: 'React', icon: 'atom' },
        { name: 'Next.js', icon: 'appWindow' },
        { name: 'TypeScript', icon: 'fileType' },
      ],
      proofProjects: [
        {
          title: 'PetCorner',
          category: 'Aplicação Next.js',
          evidence:
            'Ecossistema full-stack construído com Next.js e React para integrar loja, área do cliente, pedidos e agendamentos.',
          stack: ['Next.js', 'React', 'Firebase'],
        },
        {
          title: 'Theme Forge',
          category: 'Plataforma React',
          evidence:
            'Interface componentizada para criação e visualização de temas, conectada a uma arquitetura back-end dedicada.',
          stack: ['React', 'TypeScript', 'Chakra UI', 'NestJS'],
        },
      ],
    },
    {
      slug: 'integracoes',
      title: 'Integrações',
      summary:
        'Aplicação prática na integração entre interfaces, APIs e serviços externos para autenticação, dados e pagamentos.',
      skills: [
        { name: 'APIs', icon: 'cable' },
        { name: 'Git', icon: 'gitBranch' },
        { name: 'Deploy', icon: 'cloudUpload' },
        { name: 'SEO', icon: 'searchCheck' },
      ],
      proofProjects: [
        {
          title: 'InfoShop',
          category: 'Dados e serviços',
          evidence:
            'Integração do front-end Angular com Supabase e Express para sustentar autenticação, catálogo, checkout e operações administrativas.',
          stack: ['Angular', 'Supabase', 'Express', 'APIs'],
        },
        {
          title: 'PetCorner',
          category: 'Pagamentos e persistência',
          evidence:
            'Uso de Firebase e Stripe nos fluxos de cliente, carrinho, checkout, pedidos e agendamentos do ecossistema.',
          stack: ['Firebase', 'Stripe', 'Next.js', 'APIs'],
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
          title: 'Pizza Party',
          category: 'Arquitetura de produto',
          evidence:
            'Separação entre plataforma web, API e suporte mobile para atender loja, pedidos, delivery, eventos e operação offline.',
          stack: ['ASP.NET Core', 'Angular', 'PostgreSQL', 'Ionic'],
        },
        {
          title: 'Theme Forge',
          category: 'Reuso e consistência',
          evidence:
            'Estrutura voltada à criação e exportação de temas reutilizáveis, com dados organizados para facilitar manutenção e evolução.',
          stack: ['TypeScript', 'NestJS', 'Prisma', 'Componentização'],
        },
      ],
    },
    {
      slug: 'design',
      title: 'Design',
      summary:
        'Aplicação prática em sistemas visuais, organização de jornadas e consistência de experiência em produtos digitais.',
      skills: [
        { name: 'UI', icon: 'layout' },
        { name: 'UX', icon: 'mousePointer' },
        { name: 'Figma', icon: 'penTool' },
        { name: 'Identidade visual', icon: 'fingerprint' },
      ],
      proofProjects: [
        {
          title: 'Theme Forge',
          category: 'Sistema de temas',
          evidence:
            'Criação e visualização de paletas, tipografia e modos claro e escuro com exportação para diferentes formatos.',
          stack: ['UI', 'Chakra UI', 'Temas', 'Identidade visual'],
        },
        {
          title: 'PetCorner',
          category: 'Jornada do cliente',
          evidence:
            'Organização de uma jornada que conecta descoberta de serviços, gestão de pets, compras, pedidos e agendamentos.',
          stack: ['UX', 'React', 'Fluxos', 'Interação'],
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
