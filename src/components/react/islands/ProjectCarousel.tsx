import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import infoshopModel from '../../../assets/images/infoshop-ps2-save-icon.glb?url';
import infoshopVideo from '../../../assets/images/infoshop-ps2-save-icon.webm?url';
import memoryCardImage from '../../../assets/images/memory-card-ps2-3d.webp?url';
import petcornerModel from '../../../assets/images/petcorner-ps2-save-icon.glb?url';
import petcornerVideo from '../../../assets/images/petcorner-ps2-save-icon.webm?url';
import pizzaPartyModel from '../../../assets/images/pizza-party-ps2-save-icon.glb?url';
import pizzaPartyVideo from '../../../assets/images/pizza-party-ps2-save-icon.webm?url';
import themeForgeModel from '../../../assets/images/theme-forge-ps2-save-icon.glb?url';
import themeForgeVideo from '../../../assets/images/theme-forge-ps2-save-icon.webm?url';
import type { ProjectContentItem, ProjectsContent, ProjectStatus } from '../../../content';
import DialogCloseButton from '../bits/DialogCloseButton';
import ProjectLogo3D from '../bits/ProjectLogo3D';
import ProjectPreviewMedia from '../bits/ProjectPreviewMedia';
import './ProjectCarousel.css';

type Project = ProjectContentItem;
type MemorySlot = ProjectStatus;

const logoAssets: Record<Project['logo'], { model: string; video: string }> = {
  infoshop: { model: infoshopModel, video: infoshopVideo },
  petcorner: { model: petcornerModel, video: petcornerVideo },
  pizzaParty: { model: pizzaPartyModel, video: pizzaPartyVideo },
  themeForge: { model: themeForgeModel, video: themeForgeVideo },
};

function ProjectLogo({ project, content }: { project: Project; content: ProjectsContent }) {
  return (
    <ProjectLogo3D
      modelSrc={logoAssets[project.logo].model}
      videoSrc={logoAssets[project.logo].video}
      label={`${content.projectIconLabel} ${project.title}`}
    />
  );
}

type ProjectCarouselProps = {
  content: ProjectsContent;
};

export default function ProjectCarousel({ content }: ProjectCarouselProps) {
  const [activeMemory, setActiveMemory] = useState<MemorySlot | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const galleryHeadingRef = useRef<HTMLHeadingElement>(null);

  const visibleProjects = useMemo(
    () => content.items.filter((project) => project.status === activeMemory),
    [activeMemory, content.items],
  );

  const closeDialog = useCallback(() => {
    dialogRef.current?.close();
    setSelectedProject(null);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selectedProject && !dialog.open) dialog.showModal();
    if (!selectedProject && dialog.open) dialog.close();
  }, [selectedProject]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    const handleClose = () => setSelectedProject(null);
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
    const resetProjectBrowser = () => {
      dialogRef.current?.close();
      setSelectedProject(null);
      setActiveMemory(null);
    };

    window.addEventListener('portfolio:projects-open', resetProjectBrowser);
    return () => window.removeEventListener('portfolio:projects-open', resetProjectBrowser);
  }, []);

  const openMemory = (slot: MemorySlot) => {
    setActiveMemory(slot);
    window.requestAnimationFrame(() => galleryHeadingRef.current?.focus());
  };

  return (
    <div className="project-browser">
      {activeMemory === null ? (
        <div className="memory-select" aria-labelledby="memory-select-title">
          <div className="memory-select-copy">
            <h3 id="memory-select-title">{content.memorySelect.title}</h3>
            <span>{content.memorySelect.hint}</span>
          </div>

          <div className="memory-slots">
            {content.memoryCards.map((memory) => (
              <button
                className={`memory-slot memory-slot-${memory.status}`}
                type="button"
                key={memory.status}
                data-memory-slot={memory.status}
                data-sound="confirm"
                onClick={() => openMemory(memory.status)}
              >
                <img
                  className="memory-card-art"
                  src={memoryCardImage}
                  alt=""
                  width="500"
                  height="528"
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                />
                <span className="memory-slot-copy">
                  <strong>{memory.title}</strong>
                  <small>{memory.subtitle}</small>
                  <em>{memory.countLabel}</em>
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <section className="save-gallery" aria-labelledby="save-gallery-title">
          <header className="save-gallery-header">
            <div>
              <p>{content.gallery.eyebrow}</p>
              <h3 id="save-gallery-title" ref={galleryHeadingRef} tabIndex={-1}>
                {
                  content.memoryCards.find((memory) => memory.status === activeMemory)
                    ?.title
                }
              </h3>
            </div>
            <button
              className="ps-control ps-control-circle"
              type="button"
              data-sound="back"
              onClick={() => setActiveMemory(null)}
            >
              <span className="ps-symbol" aria-hidden="true">
                ○
              </span>
              <span>{content.gallery.backLabel}</span>
            </button>
          </header>

          <div className="save-grid" role="list" aria-label={content.gallery.ariaLabel}>
            {visibleProjects.map((project) => (
              <article className="save-item" role="listitem" key={project.id}>
                <span className="save-weight">{project.weight}</span>
                <span className="save-identity">
                  <strong>{project.title}</strong>
                  <time dateTime={project.date}>{project.dateLabel}</time>
                </span>
                <button
                  className="save-icon"
                  type="button"
                  aria-label={`${content.gallery.openLabel}: ${project.title}`}
                  aria-haspopup="dialog"
                  aria-controls="project-preview-dialog"
                  aria-keyshortcuts="X"
                  data-project-trigger={project.id}
                  data-shortcut="x"
                  data-sound="confirm"
                  onClick={() => setSelectedProject(project)}
                >
                  <ProjectLogo project={project} content={content} />
                </button>
              </article>
            ))}
          </div>

          <p className="save-gallery-hint">
            <span className="ps-symbol" aria-hidden="true">
              ×
            </span>
            {content.gallery.openLabel}
          </p>
        </section>
      )}

      <dialog
        id="project-preview-dialog"
        className="project-preview-dialog"
        aria-labelledby="project-preview-title"
        aria-describedby="project-preview-description"
        ref={dialogRef}
      >
        {selectedProject && (
          <article className="project-preview-panel">
            <header className="project-preview-header">
              <div className="project-preview-media">
                <ProjectLogo project={selectedProject} content={content} />
              </div>
              <div className="project-preview-heading">
                <p>{content.dialog.eyebrow}</p>
                <h3 id="project-preview-title">{selectedProject.title}</h3>
                <span>
                  {selectedProject.category} / {selectedProject.dateLabel}
                </span>
              </div>
              <DialogCloseButton label={content.dialog.closeLabel} onClick={closeDialog} />
            </header>

            {selectedProject.previewSlug && (
              <section
                className="project-preview-section"
                aria-labelledby="project-preview-video-title"
              >
                <h4 id="project-preview-video-title">{content.dialog.videoLabel}</h4>
                <ProjectPreviewMedia
                  slug={selectedProject.previewSlug}
                  title={selectedProject.title}
                  label={content.dialog.animatedPreviewLabel}
                />
              </section>
            )}

            <div className="project-preview-details">
              <p className="project-preview-status">
                <span>{content.dialog.statusLabel}</span>
                <strong>{content.statusLabels[selectedProject.status]}</strong>
              </p>
              <p id="project-preview-description">{selectedProject.description}</p>
              <div>
                <span>{content.dialog.stackLabel}</span>
                <ul>
                  {selectedProject.stack.map((technology) => (
                    <li key={technology}>{technology}</li>
                  ))}
                </ul>
              </div>
            </div>

            <footer className="project-preview-actions">
              {selectedProject.projectUrl && (
                <a
                  className="ps-control ps-control-cross"
                  href={selectedProject.projectUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-keyshortcuts="X"
                  data-shortcut="x"
                  data-sound="confirm"
                >
                  <span className="ps-symbol" aria-hidden="true">
                    ×
                  </span>
                  <span>{content.dialog.projectAction}</span>
                </a>
              )}
              {selectedProject.repositoryUrl && (
                <a
                  className="ps-control ps-control-square"
                  href={selectedProject.repositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-keyshortcuts="Z"
                  data-shortcut="z"
                  data-sound="confirm"
                >
                  <span className="ps-symbol" aria-hidden="true">
                    □
                  </span>
                  <span>{content.dialog.repositoryAction}</span>
                </a>
              )}
              {selectedProject.status === 'construction' && (
                <span className="project-preview-unavailable">
                  {content.dialog.linksUnavailable}
                </span>
              )}
            </footer>
          </article>
        )}
      </dialog>
    </div>
  );
}
