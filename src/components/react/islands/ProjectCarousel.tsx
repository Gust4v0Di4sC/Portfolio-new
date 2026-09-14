import { Boxes, CodeXml, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

import { projectsContent } from '../../../content';
import Carousel from '../bits/Carousel';
import type { CarouselItemData } from '../bits/Carousel';

const icons: Record<(typeof projectsContent.items)[number]['icon'], ReactNode> = {
  code: <CodeXml className="carousel-icon" aria-hidden="true" />,
  boxes: <Boxes className="carousel-icon" aria-hidden="true" />,
  sparkles: <Sparkles className="carousel-icon" aria-hidden="true" />,
};
const projects: CarouselItemData[] = projectsContent.items.map((project) => ({
  ...project,
  stack: [...project.stack],
  icon: icons[project.icon],
}));

export default function ProjectCarousel() {
  return (
    <Carousel
      items={projects}
      labels={projectsContent.carousel}
      baseWidth={620}
      autoplay
      autoplayDelay={4500}
      pauseOnHover
      loop
    />
  );
}
