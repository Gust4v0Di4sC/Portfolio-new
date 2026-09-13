import { Boxes, CodeXml, Sparkles } from 'lucide-react';

import Carousel from './Carousel';
import type { CarouselItemData } from './Carousel';

const projects: CarouselItemData[] = [
  {
    title: 'TODO: Projeto 01',
    category: 'Interface',
    year: '2026',
    description: 'Adicione um resumo curto do projeto, problema resolvido e papel exercido.',
    stack: ['Astro', 'CSS', 'UI'],
    id: 1,
    icon: <CodeXml className="carousel-icon" aria-hidden="true" />,
    href: '#contato',
  },
  {
    title: 'TODO: Projeto 02',
    category: 'Aplicação',
    year: '2026',
    description: 'Use este save para um case com demo, repositório e decisões técnicas.',
    stack: ['React', 'TypeScript'],
    id: 2,
    icon: <Boxes className="carousel-icon" aria-hidden="true" />,
    href: '#contato',
  },
  {
    title: 'TODO: Projeto 03',
    category: 'Experiência',
    year: '2026',
    description: 'Reserve este espaço para um projeto visual, 3D ou interativo.',
    stack: ['Design', 'Motion'],
    id: 3,
    icon: <Sparkles className="carousel-icon" aria-hidden="true" />,
    href: '#contato',
  },
];

export default function ProjectCarousel() {
  return (
    <Carousel items={projects} baseWidth={620} autoplay autoplayDelay={4500} pauseOnHover loop />
  );
}
