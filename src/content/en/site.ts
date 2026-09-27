import type { SiteContent } from '../types';

export const siteContent = {
  language: 'en',
  locale: 'en_US',
  name: 'Gustavo Dias',
  title: 'Gustavo Dias | Front-end Developer and UI/UX Designer',
  description:
    'Portfolio of Gustavo Dias, a Front-end Developer and UI/UX Designer specializing in creative, accessible, and responsive digital interfaces.',
  author: 'Gustavo Dias',
  themeColor: '#02060d',
  keywords: [
    'Gustavo Dias',
    'front-end developer',
    'UI/UX designer',
    'web development',
    'responsive interfaces',
    'Astro',
    'React',
    'portfolio',
  ],
  socialImage: {
    path: '/og/portfolio-gustavo-dias.jpg',
    alt: 'Illustrated portrait of Gustavo Dias with blue digital elements.',
    width: 1200,
    height: 630,
  },
  sameAs: ['https://www.linkedin.com/in/gustavo-dias-charra/', 'https://github.com/Gust4v0Di4sC'],
  skipLink: 'Skip to content',
  jobTitle: 'Front-end Developer and UI/UX Designer',
  appTitle: 'Portfolio',
} satisfies SiteContent;
