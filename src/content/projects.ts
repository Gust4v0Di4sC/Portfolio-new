export type ProjectLogo = 'infoshop' | 'petcorner' | 'pizzaParty' | 'themeForge';

export const projectsContent = {
  eyebrow: 'Memory Card / Portfolio',
  title: 'Projetos',
  cardAriaLabel: 'Projetos em formato de Memory Card',
  memorySlot: 'Memory Card (PS2)/1',
  status: '4 saves profissionais — conteúdo em preparação',
  saveLabel: 'Portfolio / Save Data',
  instructionsAriaLabel: 'Instruções do carrossel',
  instructions: ['Arraste para navegar', 'Selecione um indicador para abrir outro save'],
  carousel: {
    ariaLabel: 'Projetos em destaque',
    ariaRoleDescription: 'carrossel',
    openLabel: 'Abrir projeto',
    indicatorLabel: 'Ir para o projeto',
  },
  items: [
    {
      title: 'InfoShop',
      category: 'Interface',
      year: '2026',
      description: 'Adicione um resumo curto do projeto, problema resolvido e papel exercido.',
      stack: ['Astro', 'CSS', 'UI'],
      id: 1,
      logo: 'infoshop',
      href: '#contato',
    },
    {
      title: 'PetCorner',
      category: 'Aplicação',
      year: '2026',
      description: 'Use este save para um case com demo, repositório e decisões técnicas.',
      stack: ['React', 'TypeScript'],
      id: 2,
      logo: 'petcorner',
      href: '#contato',
    },
    {
      title: 'Pizza Party',
      category: 'Experiência',
      year: '2026',
      description: 'Reserve este espaço para um projeto visual, 3D ou interativo.',
      stack: ['Design', 'Motion'],
      id: 3,
      logo: 'pizzaParty',
      href: '#contato',
    },
    {
      title: 'Theme Forge',
      category: 'Experiência',
      year: '2026',
      description:
        'Reserve este espaço para apresentar o projeto, seus objetivos e decisões técnicas.',
      stack: ['Design', 'Front-end'],
      id: 4,
      logo: 'themeForge',
      href: '#contato',
    },
  ] satisfies Array<{
    title: string;
    category: string;
    year: string;
    description: string;
    stack: string[];
    id: number;
    logo: ProjectLogo;
    href: string;
  }>,
} as const;
