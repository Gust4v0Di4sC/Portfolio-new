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
  game: {
    triggerLabel: 'Open the Escape the Black Hole minigame',
    eyebrow: 'Secret minigame',
    title: 'Escape the Black Hole',
    closeLabel: 'Close minigame',
    canvasLabel: 'Escape the Black Hole platform game',
    loadingLabel: 'Loading game...',
    scoreLabel: 'Score',
    bestLabel: 'Best',
    readyTitle: 'Ready to run?',
    instructions: 'Click, tap, or press Space, W, or the up arrow to jump.',
    gameOverTitle: 'The void caught you',
    retryLabel: 'Try again',
  },
} satisfies HeroContent;
