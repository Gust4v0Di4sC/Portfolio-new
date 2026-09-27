import type { FooterContent } from '../types';

export const footerContent = {
  credit: 'Developed by Gustavo Dias.',
  socialsAriaLabel: 'Social networks',
  socials: [
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/gustavo-dias-charra/',
      icon: '/icons/social/linkedin.svg',
      iconClass: '',
      ariaLabel: "Visit Gustavo Dias's LinkedIn profile (opens in a new tab)",
    },
    {
      label: 'GitHub',
      href: 'https://github.com/Gust4v0Di4sC',
      icon: '/icons/social/github.svg',
      iconClass: 'github-icon',
      ariaLabel: "Visit Gustavo Dias's GitHub profile (opens in a new tab)",
    },
  ],
} satisfies FooterContent;
