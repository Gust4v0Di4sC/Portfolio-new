import type { ExperienceContent } from '../types';

export const experienceContent = {
  eyebrow: 'Version Information',
  title: 'Experience',
  timelineAriaLabel: 'Professional timeline',
  tagsAriaLabel: 'Technologies and topics',
  items: [
    {
      role: 'Front-end Developer',
      company: 'Directy',
      period: 'Nov 2025 to May 2026',
      summary:
        'Worked on the evolution of production web applications, building and maintaining interfaces and reusable components, improving responsiveness, fixing bugs, and refactoring code. Collaborated with technical teams to validate requirements, investigate integration failures, and deliver features connected to REST APIs.',
      tags: ['React', 'TypeScript', 'JavaScript', 'TailwindCSS', 'REST APIs', 'Git/GitHub'],
    },
    {
      role: 'Systems Intern',
      company: 'Vale S.A.',
      period: 'Nov 2024 to Jul 2025',
      summary:
        'Contributed to internal automation, data organization, and process improvement projects. Gathered requirements, created Power Platform solutions, integrated information, built reports, validated results with business teams, and prepared technical documentation.',
      tags: ['Power Platform', 'Automation', 'Data', 'Reports', 'Requirements', 'Documentation'],
    },
    {
      role: 'Internal Systems Development and Support',
      company: 'Polícia Civil do Espírito Santo',
      period: 'Jan 2024 to Nov 2024',
      summary:
        'Developed, maintained, and supported the institutional intranet, including fixes, screen adjustments, and workflow improvements. Worked with database queries and validation, backups, inconsistency analysis, error reproduction, technical testing, and documentation of recurring solutions.',
      tags: ['PHP', 'MySQL', 'JavaScript', 'Intranet', 'Support', 'Testing'],
    },
    {
      role: 'Development and Systems Intern',
      company: 'Polícia Civil do Espírito Santo',
      period: 'Jul 2022 to Jun 2023',
      summary:
        'Maintained an internal vehicle census system and supported updates to intranet pages. Activities included data validation, small interface fixes, and documentation of completed changes.',
      tags: ['PHP', 'JavaScript', 'HTML', 'CSS', 'Data validation', 'Documentation'],
    },
  ],
} satisfies ExperienceContent;
