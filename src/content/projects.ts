import type { ProjectLogo } from './types';

export type { ProjectLogo } from './types';

export const projectsContent = {
  eyebrow: '',
  title: 'Projetos',
  cardAriaLabel: 'Projetos em formato de Memory Card',
  memorySelect: {
    title: 'Escolha um Memory Card',
    hint: 'Os arquivos foram separados por status',
  },
  memoryCards: [
    {
      status: 'published',
      title: 'Finalizados',
      subtitle: 'Memory Card / 1',
      countLabel: '2 arquivos salvos',
    },
    {
      status: 'construction',
      title: 'Em progresso',
      subtitle: 'Memory Card / 2',
      countLabel: '2 arquivos salvos',
    },
  ],
  gallery: {
    eyebrow: 'Navegador / Dados salvos',
    ariaLabel: 'Projetos do Memory Card selecionado',
    openLabel: 'Abrir projeto',
    backLabel: 'Trocar Memory Card',
  },
  memorySlot: 'Memory Card (PS2)/1',
  status: '4 saves profissionais — projetos em destaque',
  saveLabel: 'Portfólio / Dados salvos',
  instructionsAriaLabel: 'Instruções do carrossel',
  instructions: ['Arraste para navegar', 'Selecione um indicador para abrir outro save'],
  carousel: {
    ariaLabel: 'Projetos em destaque',
    ariaRoleDescription: 'carrossel',
    openLabel: 'Ver prévia',
    indicatorLabel: 'Ir para o projeto',
  },
  dialog: {
    eyebrow: 'Prévia do projeto',
    closeLabel: 'Fechar prévia do projeto',
    videoLabel: 'Prévia em vídeo',
    statusLabel: 'Status',
    stackLabel: 'Tecnologias',
    projectAction: 'Abrir projeto',
    repositoryAction: 'Abrir repositório',
    linksUnavailable: 'Links disponíveis após o lançamento.',
    animatedPreviewLabel: 'Prévia animada do projeto',
  },
  statusLabels: {
    published: 'Disponível',
    construction: 'Em construção',
  },
  projectIconLabel: 'Ícone 3D do projeto',
  items: [
    {
      title: 'InfoShop',
      category: 'E-commerce Full-stack',
      year: '2026',
      date: '2026-09-25',
      dateLabel: '25.09.2026',
      weight: '48 KB',
      description:
        'E-commerce de produtos de informática com loja pública, autenticação, carrinho, checkout, entregas e painel administrativo.',
      stack: ['Angular', 'TypeScript', 'Supabase', 'Express'],
      id: 1,
      logo: 'infoshop',
      status: 'published',
      projectUrl: 'https://infoshop.netlify.app/',
      repositoryUrl: 'https://github.com/Gust4v0Di4sC/Info-Shop',
      previewSlug: 'infoshop',
    },
    {
      title: 'PetCorner',
      category: 'Ecossistema Full-stack',
      year: '2026',
      date: '2026-08-12',
      dateLabel: '12.08.2026',
      weight: '42 KB',
      description:
        'Ecossistema para pet shop com vitrine, área do cliente, pets, carrinho, checkout, pedidos, agendamentos e painel administrativo.',
      stack: ['Next.js', 'React', 'Firebase', 'Stripe'],
      id: 2,
      logo: 'petcorner',
      status: 'published',
      projectUrl: 'https://pet-corner-next-nine.vercel.app/',
      repositoryUrl: 'https://github.com/Gust4v0Di4sC/Pet-Corner-Next',
      previewSlug: 'pet-corner',
    },
    {
      title: 'Pizza Party',
      category: 'Plataforma Full-stack',
      year: '2026',
      date: '2026-09-18',
      dateLabel: '18.09.2026',
      weight: '31 KB',
      description:
        'Gestão de pizzaria com loja online, pedidos, delivery, eventos, agendamentos, área administrativa e suporte mobile offline.',
      stack: ['.NET', 'ASP.NET Core', 'Angular', 'PostgreSQL', 'Ionic'],
      id: 3,
      logo: 'pizzaParty',
      status: 'construction',
      projectUrl: undefined,
      repositoryUrl: undefined,
      previewSlug: undefined,
    },
    {
      title: 'Theme Forge',
      category: 'Plataforma de Design',
      year: '2026',
      date: '2026-09-04',
      dateLabel: '04.09.2026',
      weight: '27 KB',
      description:
        'Criação, visualização e exportação de temas reutilizáveis com modos claro e escuro, paletas, tipografia e múltiplos formatos.',
      stack: ['React', 'TypeScript', 'Chakra UI', 'NestJS', 'Prisma'],
      id: 4,
      logo: 'themeForge',
      status: 'construction',
      projectUrl: undefined,
      repositoryUrl: undefined,
      previewSlug: undefined,
    },
  ] satisfies Array<{
    title: string;
    category: string;
    year: string;
    date: string;
    dateLabel: string;
    weight: string;
    description: string;
    stack: string[];
    id: number;
    logo: ProjectLogo;
    status: 'published' | 'construction';
    projectUrl: string | undefined;
    repositoryUrl: string | undefined;
    previewSlug: 'infoshop' | 'pet-corner' | undefined;
  }>,
} as const;
