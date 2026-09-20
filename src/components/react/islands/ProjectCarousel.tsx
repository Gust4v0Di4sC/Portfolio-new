import infoshopModel from '../../../assets/images/infoshop-ps2-save-icon.glb?url';
import infoshopVideo from '../../../assets/images/infoshop-ps2-save-icon.webm?url';
import petcornerModel from '../../../assets/images/petcorner-ps2-save-icon.glb?url';
import petcornerVideo from '../../../assets/images/petcorner-ps2-save-icon.webm?url';
import pizzaPartyModel from '../../../assets/images/pizza-party-ps2-save-icon.glb?url';
import pizzaPartyVideo from '../../../assets/images/pizza-party-ps2-save-icon.webm?url';
import themeForgeModel from '../../../assets/images/theme-forge-ps2-save-icon.glb?url';
import themeForgeVideo from '../../../assets/images/theme-forge-ps2-save-icon.webm?url';
import { projectsContent } from '../../../content';
import Carousel from '../bits/Carousel';
import type { CarouselItemData } from '../bits/Carousel';
import ProjectLogo3D from '../bits/ProjectLogo3D';

const logoAssets: Record<
  (typeof projectsContent.items)[number]['logo'],
  { model: string; video: string }
> = {
  infoshop: { model: infoshopModel, video: infoshopVideo },
  petcorner: { model: petcornerModel, video: petcornerVideo },
  pizzaParty: { model: pizzaPartyModel, video: pizzaPartyVideo },
  themeForge: { model: themeForgeModel, video: themeForgeVideo },
};
const projects: CarouselItemData[] = projectsContent.items.map((project) => ({
  ...project,
  stack: [...project.stack],
  icon: (
    <ProjectLogo3D
      modelSrc={logoAssets[project.logo].model}
      videoSrc={logoAssets[project.logo].video}
      label={`Logo animada do projeto ${project.title}`}
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
