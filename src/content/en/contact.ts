import type { ContactContent } from '../types';

export const contactContent = {
  title: 'Get in touch',
  description: "Let's build something amazing together.",
  email: 'dscharraa@gmail.com',
  actionLabel: 'Send email',
  socialsAriaLabel: 'Professional profiles',
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
} satisfies ContactContent;
