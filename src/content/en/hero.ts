import type { HeroContent } from '../types';

export const heroContent = {
  kicker: 'Front-end Developer & UI/UX Designer',
  title: 'Gustavo Dias',
  description:
    'I build clear, responsive, and maintainable web interfaces designed to evolve with the product.',
  actionsAriaLabel: 'Main actions',
  actions: {
    projects: { href: '#projetos', label: 'Explore', ariaLabel: 'Explore projects' },
    contact: { href: '#contato', label: 'Contact', ariaLabel: 'Get in touch' },
  },
  image: {
    alt: 'Stylized illustration of Gustavo Dias on a cover inspired by PlayStation 2-era games.',
    figureAriaLabel: 'Illustrated cover of Gustavo Dias with a gaming atmosphere.',
  },
} satisfies HeroContent;
