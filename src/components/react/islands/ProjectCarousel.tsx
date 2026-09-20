import infoshopVideo from '../../../assets/images/infoshop-ps2-save-icon.webm?url';
import petcornerVideo from '../../../assets/images/petcorner-ps2-save-icon.webm?url';
import pizzaPartyVideo from '../../../assets/images/pizza-party-ps2-save-icon.webm?url';
import themeForgeVideo from '../../../assets/images/theme-forge-ps2-save-icon.webm?url';
import { projectsContent } from '../../../content';
import Carousel from '../bits/Carousel';
import type { CarouselItemData } from '../bits/Carousel';

const logoVideos: Record<(typeof projectsContent.items)[number]['logo'], string> = {
  infoshop: infoshopVideo,
  petcorner: petcornerVideo,
  pizzaParty: pizzaPartyVideo,
  themeForge: themeForgeVideo,
};
const projects: CarouselItemData[] = projectsContent.items.map((project) => ({
  ...project,
  stack: [...project.stack],
  icon: (
    <video
      className="project-logo-video"
      src={logoVideos[project.logo]}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
    />
  ),
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
