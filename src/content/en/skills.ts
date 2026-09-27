import type { SkillsContent } from '../types';

export const skillsContent = {
  eyebrow: 'System Abilities',
  title: 'Skills',
  cardEyebrow: 'Skill Set',
  singularProject: 'project',
  pluralProjects: 'projects',
  skillListLabel: 'Skills in',
  dialogEyebrow: 'Proof of Concept',
  closeLabel: 'Close proof of concept',
  relatedSkillsLabel: 'Related skills',
  actionsLabel: 'Proof of concept actions',
  projectsAction: 'Projects',
  backAction: 'Back',
  groups: [
    {
      slug: 'interfaces',
      title: 'Interfaces',
      summary:
        'Hands-on experience building responsive, semantic interfaces designed for assistive technologies.',
      skills: [
        { name: 'HTML', icon: 'codeXml' },
        { name: 'CSS', icon: 'palette' },
        { name: 'Accessibility', icon: 'accessibility' },
        { name: 'Responsive design', icon: 'panels' },
      ],
      proofProjects: [
        {
          title: 'InfoShop',
          category: 'Responsive e-commerce',
          evidence:
            'Store interface with a catalog, listings, cart, checkout, and admin dashboard organized into clear workflows.',
          stack: ['Angular', 'TypeScript', 'HTML', 'CSS'],
        },
        {
          title: 'PetCorner',
          category: 'Pet shop ecosystem',
          evidence:
            'Public area and customer space combining a storefront, pets, cart, orders, and appointments in a consistent experience.',
          stack: ['Next.js', 'React', 'Responsive design', 'UI'],
        },
      ],
    },
    {
      slug: 'frameworks',
      title: 'Frameworks',
      summary:
        'Hands-on use of modern frameworks to build complete web products and component-based interfaces.',
      skills: [
        { name: 'Astro', icon: 'orbit' },
        { name: 'React', icon: 'atom' },
        { name: 'Next.js', icon: 'appWindow' },
        { name: 'TypeScript', icon: 'fileType' },
      ],
      proofProjects: [
        {
          title: 'PetCorner',
          category: 'Next.js application',
          evidence:
            'Full-stack ecosystem built with Next.js and React to connect the store, customer area, orders, and appointments.',
          stack: ['Next.js', 'React', 'Firebase'],
        },
        {
          title: 'Theme Forge',
          category: 'React platform',
          evidence:
            'Component-based interface for creating and previewing themes, connected to a dedicated back-end architecture.',
          stack: ['React', 'TypeScript', 'Chakra UI', 'NestJS'],
        },
      ],
    },
    {
      slug: 'integracoes',
      title: 'Integrations',
      summary:
        'Hands-on integration of interfaces, APIs, and external services for authentication, data, and payments.',
      skills: [
        { name: 'APIs', icon: 'cable' },
        { name: 'Git', icon: 'gitBranch' },
        { name: 'Deployment', icon: 'cloudUpload' },
        { name: 'SEO', icon: 'searchCheck' },
      ],
      proofProjects: [
        {
          title: 'InfoShop',
          category: 'Data and services',
          evidence:
            'Integration of an Angular front end with Supabase and Express for authentication, catalog, checkout, and admin operations.',
          stack: ['Angular', 'Supabase', 'Express', 'APIs'],
        },
        {
          title: 'PetCorner',
          category: 'Payments and persistence',
          evidence:
            'Firebase and Stripe support customer, cart, checkout, order, and appointment workflows across the ecosystem.',
          stack: ['Firebase', 'Stripe', 'Next.js', 'APIs'],
        },
      ],
    },
    {
      slug: 'qualidade',
      title: 'Quality',
      summary:
        'Hands-on build validation, coding standards, and decisions focused on visual stability.',
      skills: [
        { name: 'Linting', icon: 'listChecks' },
        { name: 'Testing', icon: 'flask' },
        { name: 'Performance', icon: 'gauge' },
        { name: 'Semantics', icon: 'braces' },
      ],
      proofProjects: [
        {
          title: 'Pizza Party',
          category: 'Product architecture',
          evidence:
            'Separation between the web platform, API, and mobile support for the store, orders, delivery, events, and offline operation.',
          stack: ['ASP.NET Core', 'Angular', 'PostgreSQL', 'Ionic'],
        },
        {
          title: 'Theme Forge',
          category: 'Reuse and consistency',
          evidence:
            'Structure for creating and exporting reusable themes, with organized data that simplifies maintenance and evolution.',
          stack: ['TypeScript', 'NestJS', 'Prisma', 'Component design'],
        },
      ],
    },
    {
      slug: 'design',
      title: 'Design',
      summary:
        'Hands-on work with visual systems, journey design, and consistent experiences across digital products.',
      skills: [
        { name: 'UI', icon: 'layout' },
        { name: 'UX', icon: 'mousePointer' },
        { name: 'Figma', icon: 'penTool' },
        { name: 'Visual identity', icon: 'fingerprint' },
      ],
      proofProjects: [
        {
          title: 'Theme Forge',
          category: 'Theme system',
          evidence:
            'Creation and preview of palettes, typography, and light and dark modes, with export to multiple formats.',
          stack: ['UI', 'Chakra UI', 'Themes', 'Visual identity'],
        },
        {
          title: 'PetCorner',
          category: 'Customer journey',
          evidence:
            'A journey connecting service discovery, pet management, shopping, orders, and appointments.',
          stack: ['UX', 'React', 'Flows', 'Interaction'],
        },
      ],
    },
  ],
} satisfies SkillsContent;
