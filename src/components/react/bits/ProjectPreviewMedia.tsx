import { useEffect, useRef } from 'react';

import './ProjectPreviewMedia.css';

export type ProjectPreviewSlug = 'infoshop' | 'pet-corner';

interface ProjectPreviewMediaProps {
  slug: ProjectPreviewSlug;
  title: string;
  label: string;
}

export default function ProjectPreviewMedia({ slug, title, label }: ProjectPreviewMediaProps) {
  const mediaPath = `/media/projects/${slug}`;
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const startPlayback = () => {
      void video.play().catch(() => undefined);
    };

    video.addEventListener('canplay', startPlayback);
    video.load();
    const animationFrame = window.requestAnimationFrame(startPlayback);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      video.removeEventListener('canplay', startPlayback);
      video.pause();
    };
  }, [slug]);

  return (
    <figure className="project-preview">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={`${mediaPath}-poster.webp`}
        aria-label={`${label} ${title}`}
      >
        <source src={`${mediaPath}-preview.webm`} type="video/webm" />
      </video>
    </figure>
  );
}
