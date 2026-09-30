export type Locale = 'pt-BR' | 'en';

export type ProjectLogo = 'infoshop' | 'petcorner' | 'pizzaParty' | 'themeForge';
export type ProjectStatus = 'published' | 'construction';
export type SkillIcon =
  | 'accessibility'
  | 'appWindow'
  | 'atom'
  | 'braces'
  | 'cable'
  | 'cloudUpload'
  | 'codeXml'
  | 'fileType'
  | 'fingerprint'
  | 'flask'
  | 'gauge'
  | 'gitBranch'
  | 'layout'
  | 'listChecks'
  | 'mousePointer'
  | 'orbit'
  | 'palette'
  | 'panels'
  | 'penTool'
  | 'searchCheck';

export interface SiteContent {
  language: Locale;
  locale: 'pt_BR' | 'en_US';
  name: string;
  title: string;
  description: string;
  author: string;
  themeColor: string;
  keywords: readonly string[];
  socialImage: { path: string; alt: string; width: number; height: number };
  sameAs: readonly string[];
  skipLink: string;
  jobTitle: string;
  appTitle: string;
}

export interface NavigationContent {
  ariaLabel: string;
  brand: { label: string; href: string; ariaLabel: string };
  items: readonly { href: string; label: string }[];
}

export interface MenuContent {
  main: { browser: string; systemConfiguration: string };
  systemTitle: string;
  language: string;
  languageTitle: string;
  portuguese: string;
  english: string;
  portfolioOptions: string;
  mainMenuAriaLabel: string;
  systemAriaLabel: string;
  languageAriaLabel: string;
  localDateTimeAriaLabel: string;
  controlsAriaLabel: string;
  back: string;
  enter: string;
  viewer: string;
  enableViewer: string;
  exitViewer: string;
  presentation: string;
  openPresentation: string;
  returnToMain: string;
  returnToSystem: string;
  menu: string;
}

export interface HeroContent {
  kicker: string;
  title: string;
  description: string;
  actionsAriaLabel: string;
  actions: {
    projects: { href: string; label: string; ariaLabel: string };
    contact: { href: string; label: string; ariaLabel: string };
  };
  image: { alt: string; figureAriaLabel: string };
  game: {
    triggerLabel: string;
    eyebrow: string;
    title: string;
    closeLabel: string;
    canvasLabel: string;
    loadingLabel: string;
    scoreLabel: string;
    bestLabel: string;
    readyTitle: string;
    instructions: string;
    gameOverTitle: string;
    retryLabel: string;
  };
}

export interface ExperienceContent {
  eyebrow: string;
  title: string;
  timelineAriaLabel: string;
  tagsAriaLabel: string;
  items: readonly {
    role: string;
    company: string;
    period: string;
    summary: string;
    tags: readonly string[];
  }[];
}

export interface ProjectContentItem {
  title: string;
  category: string;
  year: string;
  date: string;
  dateLabel: string;
  weight: string;
  description: string;
  stack: readonly string[];
  id: number;
  logo: ProjectLogo;
  status: ProjectStatus;
  projectUrl?: string | undefined;
  repositoryUrl?: string | undefined;
  previewSlug?: 'infoshop' | 'pet-corner' | undefined;
}

export interface ProjectsContent {
  eyebrow: string;
  title: string;
  cardAriaLabel: string;
  memorySelect: { title: string; hint: string };
  memoryCards: readonly {
    status: ProjectStatus;
    title: string;
    subtitle: string;
    countLabel: string;
  }[];
  gallery: { eyebrow: string; ariaLabel: string; openLabel: string; backLabel: string };
  memorySlot: string;
  status: string;
  saveLabel: string;
  instructionsAriaLabel: string;
  instructions: readonly string[];
  carousel: {
    ariaLabel: string;
    ariaRoleDescription: string;
    openLabel: string;
    indicatorLabel: string;
  };
  dialog: {
    eyebrow: string;
    closeLabel: string;
    videoLabel: string;
    statusLabel: string;
    stackLabel: string;
    projectAction: string;
    repositoryAction: string;
    linksUnavailable: string;
    animatedPreviewLabel: string;
  };
  statusLabels: Record<ProjectStatus, string>;
  projectIconLabel: string;
  items: readonly ProjectContentItem[];
}

export interface SkillsContent {
  eyebrow: string;
  title: string;
  cardEyebrow: string;
  singularProject: string;
  pluralProjects: string;
  skillListLabel: string;
  dialogEyebrow: string;
  closeLabel: string;
  relatedSkillsLabel: string;
  actionsLabel: string;
  projectsAction: string;
  backAction: string;
  groups: readonly {
    slug: string;
    title: string;
    summary: string;
    skills: readonly { name: string; icon: SkillIcon }[];
    proofProjects: readonly {
      title: string;
      category: string;
      evidence: string;
      stack: readonly string[];
    }[];
  }[];
}

export interface AboutContent {
  eyebrow: string;
  title: string;
  paragraphs: readonly string[];
}

export interface ContactContent {
  title: string;
  description: string;
  action: {
    label: string;
    href: string;
    icon: string;
    ariaLabel: string;
  };
  socialsAriaLabel: string;
  socials: readonly {
    label: string;
    href: string;
    icon: string;
    iconClass: string;
    ariaLabel: string;
  }[];
}

export interface FooterContent {
  credit: string;
  socialsAriaLabel: string;
  socials: ContactContent['socials'];
}

export interface SplashContent {
  ariaLabel: string;
  title: string;
  subtitle: string;
  invitation: string;
  scrollHint: string;
}

export interface PortfolioContent {
  site: SiteContent;
  navigation: NavigationContent;
  menu: MenuContent;
  hero: HeroContent;
  experience: ExperienceContent;
  projects: ProjectsContent;
  skills: SkillsContent;
  about: AboutContent;
  contact: ContactContent;
  footer: FooterContent;
  splash: SplashContent;
}
