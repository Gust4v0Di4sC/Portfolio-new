import { aboutContent } from './about';
import { contactContent } from './contact';
import { experienceContent } from './experience';
import { footerContent } from './footer';
import { heroContent } from './hero';
import { menuContent } from './menu';
import { navigationContent } from './navigation';
import { projectsContent } from './projects';
import { siteContent } from './site';
import { skillsContent } from './skills';
import { splashContent } from './splash';
import type { PortfolioContent } from '../types';

export const enContent = {
  site: siteContent,
  navigation: navigationContent,
  menu: menuContent,
  hero: heroContent,
  experience: experienceContent,
  projects: projectsContent,
  skills: skillsContent,
  about: aboutContent,
  contact: contactContent,
  footer: footerContent,
  splash: splashContent,
} satisfies PortfolioContent;
