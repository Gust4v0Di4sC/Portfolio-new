import { useCallback, useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Accessibility,
  AppWindow,
  Atom,
  Braces,
  Cable,
  CloudUpload,
  CodeXml,
  FileType,
  FingerprintPattern,
  FlaskConical,
  Gauge,
  GitBranch,
  LayoutPanelTop,
  ListChecks,
  MousePointerClick,
  Orbit,
  Palette,
  PanelsTopLeft,
  PenTool,
  SearchCheck,
} from 'lucide-react';

import { skillsContent as content } from '../../../content';
import type { SkillIcon } from '../../../content/skills';
import DialogCloseButton from '../bits/DialogCloseButton';
import './SkillsProofIsland.css';

const icons: Record<SkillIcon, LucideIcon> = {
  accessibility: Accessibility,
  appWindow: AppWindow,
  atom: Atom,
  braces: Braces,
  cable: Cable,
  cloudUpload: CloudUpload,
  codeXml: CodeXml,
  fileType: FileType,
  fingerprint: FingerprintPattern,
  flask: FlaskConical,
  gauge: Gauge,
  gitBranch: GitBranch,
  layout: LayoutPanelTop,
  listChecks: ListChecks,
  mousePointer: MousePointerClick,
  orbit: Orbit,
  palette: Palette,
  panels: PanelsTopLeft,
  penTool: PenTool,
  searchCheck: SearchCheck,
};

type SkillGroup = (typeof content.groups)[number];

export default function SkillsProofIsland() {
  const [selectedGroup, setSelectedGroup] = useState<SkillGroup | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeDialog = useCallback(() => {
    dialogRef.current?.close();
    setSelectedGroup(null);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selectedGroup && !dialog.open) dialog.showModal();
    if (!selectedGroup && dialog.open) dialog.close();
  }, [selectedGroup]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    const handleClose = () => setSelectedGroup(null);
    const handleClick = (event: MouseEvent) => {
      if (event.target === dialog) closeDialog();
    };
    dialog.addEventListener('close', handleClose);
    dialog.addEventListener('click', handleClick);
    return () => {
      dialog.removeEventListener('close', handleClose);
      dialog.removeEventListener('click', handleClick);
    };
  }, [closeDialog]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !dialogRef.current?.open) return;
      event.preventDefault();
      event.stopPropagation();
      closeDialog();
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [closeDialog]);

  return (
    <section
      id="habilidades"
      className="skills section-shell container"
      aria-labelledby="habilidades-title"
    >
      <div className="section-heading">
        <p>{content.eyebrow}</p>
        <h2 id="habilidades-title">{content.title}</h2>
      </div>

      <div className="skill-grid">
        {content.groups.map((group) => (
          <button
            className="skill-group"
            type="button"
            key={group.slug}
            aria-controls="skill-proof-dialog"
            aria-haspopup="dialog"
            aria-keyshortcuts="X"
            data-shortcut="x"
            data-sound="confirm"
            data-proof-trigger={group.slug}
            onClick={() => setSelectedGroup(group)}
          >
            <span className="skill-group-header">
              <span>
                <span className="skill-kicker">{content.cardEyebrow}</span>
                <span className="skill-title">{group.title}</span>
              </span>
              <span className="proof-count">
                {group.proofProjects.length}{' '}
                {group.proofProjects.length === 1
                  ? content.singularProject
                  : content.pluralProjects}
              </span>
            </span>
            <span className="skill-list" aria-label={`${content.skillListLabel} ${group.title}`}>
              {group.skills.map(({ name, icon }) => {
                const Icon = icons[icon];
                return (
                  <span className="skill-row" key={name}>
                    <span className="skill-icon" aria-hidden="true">
                      <Icon size={18} strokeWidth={1.7} />
                    </span>
                    <span>{name}</span>
                  </span>
                );
              })}
            </span>
          </button>
        ))}
      </div>

      <dialog
        id="skill-proof-dialog"
        className="skill-proof-dialog"
        aria-labelledby="skill-proof-title"
        aria-describedby="skill-proof-summary"
        ref={dialogRef}
      >
        {selectedGroup && (
          <article className="proof-panel">
            <header className="proof-header">
              <div>
                <p>{content.dialogEyebrow}</p>
                <h3 id="skill-proof-title">{selectedGroup.title}</h3>
                <span id="skill-proof-summary">{selectedGroup.summary}</span>
              </div>
              <DialogCloseButton label={content.closeLabel} onClick={closeDialog} />
            </header>
            <div className="proof-skills" aria-label={content.relatedSkillsLabel}>
              {selectedGroup.skills.map(({ name }) => (
                <span key={name}>{name}</span>
              ))}
            </div>
            <ul className="proof-list">
              {selectedGroup.proofProjects.map((project) => (
                <li key={`${selectedGroup.slug}-${project.title}`}>
                  <strong>{project.title}</strong>
                  <span>{project.category}</span>
                  <p>{project.evidence}</p>
                  <small>{project.stack.join(' + ')}</small>
                </li>
              ))}
            </ul>
            <footer className="proof-actions" aria-label={content.actionsLabel}>
              <a
                className="ps-control ps-control-cross"
                href="#projetos"
                aria-keyshortcuts="X"
                data-shortcut="x"
                data-sound="confirm"
                onClick={closeDialog}
              >
                <span className="ps-symbol" aria-hidden="true">
                  ×
                </span>
                <span>{content.projectsAction}</span>
              </a>
              <button
                className="ps-control ps-control-circle"
                type="button"
                aria-keyshortcuts="O Escape"
                data-shortcut="o"
                data-sound="back"
                onClick={closeDialog}
              >
                <span className="ps-symbol" aria-hidden="true">
                  ○
                </span>
                <span>{content.backAction}</span>
              </button>
            </footer>
          </article>
        )}
      </dialog>
    </section>
  );
}
