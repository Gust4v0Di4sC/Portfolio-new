export type ProjectIcon = 'code' | 'boxes' | 'sparkles';

export const projectsContent = {
  eyebrow: 'Memory Card / Portfolio',
  title: 'Projetos',
  cardAriaLabel: 'Projetos em formato de Memory Card',
  memorySlot: 'Memory Card (PS2)/1',
  status: '3 saves profissionais — conteúdo em preparação',
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
      title: 'TODO: Projeto 01',
      category: 'Interface',
      year: '2026',
      description: 'Adicione um resumo curto do projeto, problema resolvido e papel exercido.',
      stack: ['Astro', 'CSS', 'UI'],
      id: 1,
      icon: 'code',
      href: '#contato',
    },
    {
      title: 'TODO: Projeto 02',
      category: 'Aplicação',
      year: '2026',
      description: 'Use este save para um case com demo, repositório e decisões técnicas.',
      stack: ['React', 'TypeScript'],
      id: 2,
      icon: 'boxes',
      href: '#contato',
    },
    {
      title: 'TODO: Projeto 03',
      category: 'Experiência',
      year: '2026',
      description: 'Reserve este espaço para um projeto visual, 3D ou interativo.',
      stack: ['Design', 'Motion'],
      id: 3,
      icon: 'sparkles',
      href: '#contato',
    },
  ] satisfies Array<{
    title: string;
    category: string;
    year: string;
    description: string;
    stack: string[];
    id: number;
    icon: ProjectIcon;
    href: string;
  }>,
} as const;
