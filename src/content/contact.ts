export const contactContent = {
  title: 'Entre em contato comigo',
  description: 'Vamos criar algo incrível juntos.',
  action: {
    label: 'Enviar e-mail',
    href: 'mailto:dscharraa@gmail.com',
    icon: '/icons/social/email.svg',
    ariaLabel: 'Enviar e-mail para Gustavo Dias',
  },
  socialsAriaLabel: 'Perfis profissionais',
  socials: [
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/gustavo-dias-charra/',
      icon: '/icons/social/linkedin.svg',
      iconClass: '',
      ariaLabel: 'Visitar LinkedIn de Gustavo Dias (abre em nova aba)',
    },
    {
      label: 'GitHub',
      href: 'https://github.com/Gust4v0Di4sC',
      icon: '/icons/social/github.svg',
      iconClass: 'github-icon',
      ariaLabel: 'Visitar GitHub de Gustavo Dias (abre em nova aba)',
    },
  ],
} as const;
