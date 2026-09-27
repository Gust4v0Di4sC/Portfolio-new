import type { NavigationContent } from '../types';

export const navigationContent = {
  ariaLabel: 'Main navigation',
  brand: { label: 'GD/>', href: '/en/', ariaLabel: 'Gustavo Dias, home page' },
  items: [
    { href: '#experiencia', label: 'Experience' },
    { href: '#projetos', label: 'Projects' },
    { href: '#habilidades', label: 'Skills' },
    { href: '#sobre', label: 'About' },
    { href: '#contato', label: 'Contact' },
  ],
} satisfies NavigationContent;
