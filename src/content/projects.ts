export type ProjectLogo = 'infoshop' | 'petcorner' | 'pizzaParty' | 'themeForge';

export const projectsContent = {
  eyebrow: 'Memory Card / Portfolio',
  title: 'Projetos',
  cardAriaLabel: 'Projetos em formato de Memory Card',
  memorySlot: 'Memory Card (PS2)/1',
  status: '4 saves profissionais — projetos em destaque',
  saveLabel: 'Portfolio / Save Data',
  instructionsAriaLabel: 'Instruções do carrossel',
  instructions: ['Arraste para navegar', 'Selecione um indicador para abrir outro save'],
  carousel: {
    ariaLabel: 'Projetos em destaque',
    ariaRoleDescription: 'carrossel',
    openLabel: 'Ver prévia',
    indicatorLabel: 'Ir para o projeto',
  },
  dialog: {
    eyebrow: 'Project Preview',
    closeLabel: 'Fechar prévia do projeto',
    statusLabel: 'Status',
    stackLabel: 'Tecnologias',
    projectAction: 'Abrir projeto',
    repositoryAction: 'Abrir repositório',
    linksUnavailable: 'Links disponíveis após o lançamento.',
  },
  statusLabels: {
    published: 'Disponível',
    construction: 'Em construção',
  },
  items: [
    {
      title: 'InfoShop',
      category: 'E-commerce Full-stack',
      year: '2026',
      description:
        'E-commerce de produtos de informática com loja pública, autenticação, carrinho, checkout, entregas e painel administrativo.',
      stack: ['Angular', 'TypeScript', 'Supabase', 'Express'],
      id: 1,
      logo: 'infoshop',
      status: 'published',
      projectUrl: 'https://infoshop.netlify.app/',
      repositoryUrl: 'https://github.com/Gust4v0Di4sC/Info-Shop',
    },
    {
      title: 'PetCorner',
      category: 'Ecossistema Full-stack',
      year: '2026',
      description:
        'Ecossistema para pet shop com vitrine, área do cliente, pets, carrinho, checkout, pedidos, agendamentos e painel administrativo.',
      stack: ['Next.js', 'React', 'Firebase', 'Stripe'],
      id: 2,
      logo: 'petcorner',
      status: 'published',
      projectUrl: 'https://pet-corner-next-nine.vercel.app/',
      repositoryUrl: 'https://github.com/Gust4v0Di4sC/Pet-Corner-Next',
    },
    {
      title: 'Pizza Party',
      category: 'Plataforma Full-stack',
      year: '2026',
      description:
        'Gestão de pizzaria com loja online, pedidos, delivery, eventos, agendamentos, área administrativa e suporte mobile offline.',
      stack: ['.NET', 'ASP.NET Core', 'Angular', 'PostgreSQL', 'Ionic'],
      id: 3,
      logo: 'pizzaParty',
      status: 'construction',
      projectUrl: undefined,
      repositoryUrl: undefined,
    },
    {
      title: 'Theme Forge',
      category: 'Plataforma de Design',
      year: '2026',
      description:
        'Criação, visualização e exportação de temas reutilizáveis com modos claro e escuro, paletas, tipografia e múltiplos formatos.',
      stack: ['React', 'TypeScript', 'Chakra UI', 'NestJS', 'Prisma'],
      id: 4,
      logo: 'themeForge',
      status: 'construction',
      projectUrl: undefined,
      repositoryUrl: undefined,
    },
  ] satisfies Array<{
    title: string;
    category: string;
    year: string;
    description: string;
    stack: string[];
    id: number;
    logo: ProjectLogo;
    status: 'published' | 'construction';
    projectUrl: string | undefined;
    repositoryUrl: string | undefined;
  }>,
} as const;
