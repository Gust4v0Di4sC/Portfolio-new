import { useCallback, useEffect, useRef, useState } from 'react';

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
import DialogCloseButton from '../bits/DialogCloseButton';
import ProjectLogo3D from '../bits/ProjectLogo3D';
import ProjectPreviewMedia from '../bits/ProjectPreviewMedia';
import './ProjectCarousel.css';

type Project = (typeof projectsContent.items)[number];

const logoAssets: Record<Project['logo'], { model: string; video: string }> = {
  infoshop: { model: infoshopModel, video: infoshopVideo },
  petcorner: { model: petcornerModel, video: petcornerVideo },
  pizzaParty: { model: pizzaPartyModel, video: pizzaPartyVideo },
  themeForge: { model: themeForgeModel, video: themeForgeVideo },
};

function ProjectLogo({ project }: { project: Project }) {
  return (
    <ProjectLogo3D
      modelSrc={logoAssets[project.logo].model}
      videoSrc={logoAssets[project.logo].video}
      label={`Logo animada do projeto ${project.title}`}
    />
  );
}

const projects: CarouselItemData[] = projectsContent.items.map((project) => ({
  ...project,
  stack: [...project.stack],
  status: projectsContent.statusLabels[project.status],
  icon: <ProjectLogo project={project} />,
}));

export default function ProjectCarousel() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
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

  const openProject = (item: CarouselItemData) => {
    setSelectedProject(projectsContent.items.find((project) => project.id === item.id) ?? null);
  };

  return (
    <>
      <Carousel
        items={projects}
        labels={projectsContent.carousel}
        baseWidth={620}
        autoplay={!selectedProject}
        autoplayDelay={4500}
        pauseOnHover
        loop
        onOpenItem={openProject}
      />

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
                <ProjectLogo project={selectedProject} />
              </div>
              <div className="project-preview-heading">
                <p>{projectsContent.dialog.eyebrow}</p>
                <h3 id="project-preview-title">{selectedProject.title}</h3>
                <span>
                  {selectedProject.category} / {selectedProject.year}
                </span>
              </div>
              <DialogCloseButton label={projectsContent.dialog.closeLabel} onClick={closeDialog} />
            </header>

            {selectedProject.previewSlug && (
              <section
                className="project-preview-section"
                aria-labelledby="project-preview-video-title"
              >
                <h4 id="project-preview-video-title">{projectsContent.dialog.videoLabel}</h4>
                <ProjectPreviewMedia
                  slug={selectedProject.previewSlug}
                  title={selectedProject.title}
                />
              </section>
            )}

            <div className="project-preview-details">
              <p className="project-preview-status">
                <span>{projectsContent.dialog.statusLabel}</span>
                <strong>{projectsContent.statusLabels[selectedProject.status]}</strong>
              </p>
              <p id="project-preview-description">{selectedProject.description}</p>
              <div>
                <span>{projectsContent.dialog.stackLabel}</span>
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
                  <span>{projectsContent.dialog.projectAction}</span>
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
                  <span>{projectsContent.dialog.repositoryAction}</span>
                </a>
              )}

              {selectedProject.status === 'construction' && (
                <span className="project-preview-unavailable">
                  {projectsContent.dialog.linksUnavailable}
                </span>
              )}
            </footer>
          </article>
        )}
      </dialog>
    </>
  );
}
