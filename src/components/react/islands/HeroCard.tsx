import { type CSSProperties, type PointerEvent, type ReactNode, useEffect, useRef } from 'react';

import PixelCard from '../bits/PixelCard';
import './HeroCard.css';

type HeroCardProps = {
  children: ReactNode;
  caption: string;
  figureAriaLabel: string;
};

type HeroCardStyle = CSSProperties & {
  '--hero-card-rotate-x'?: string;
  '--hero-card-rotate-y'?: string;
  '--hero-card-shine-x'?: string;
  '--hero-card-shine-y'?: string;
};

const restingStyle: HeroCardStyle = {
  '--hero-card-rotate-x': '0deg',
  '--hero-card-rotate-y': '0deg',
  '--hero-card-shine-x': '50%',
  '--hero-card-shine-y': '45%',
};

export default function HeroCard({ children, caption, figureAriaLabel }: HeroCardProps) {
  const figureRef = useRef<HTMLElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const floatingCard = floatRef.current;

    if (!floatingCard) {
      return undefined;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const amplitude = reducedMotion ? 3 : 15;
    const cycleDuration = reducedMotion ? 7000 : 3400;
    let animationFrame = 0;
    let startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const phase = (elapsed / cycleDuration) * Math.PI * 2;
      const verticalOffset = Math.sin(phase) * amplitude;
      const horizontalOffset = Math.sin(phase * 0.5) * (reducedMotion ? 0.5 : 2.5);
      const rotation = Math.sin(phase) * (reducedMotion ? 0.15 : 1.1);

      floatingCard.style.transform = `translate3d(${horizontalOffset}px, ${verticalOffset}px, 0) rotate(${rotation}deg)`;
      animationFrame = window.requestAnimationFrame(animate);
    };

    const handleVisibility = () => {
      window.cancelAnimationFrame(animationFrame);

      if (!document.hidden) {
        startTime = performance.now();
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    animationFrame = window.requestAnimationFrame(animate);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const updateTilt = (event: PointerEvent<HTMLElement>) => {
    const figure = figureRef.current;

    if (!figure || event.pointerType === 'touch') {
      return;
    }

    const rect = figure.getBoundingClientRect();
    const horizontal = (event.clientX - rect.left) / rect.width;
    const vertical = (event.clientY - rect.top) / rect.height;

    figure.style.setProperty('--hero-card-rotate-x', `${(0.5 - vertical) * 7}deg`);
    figure.style.setProperty('--hero-card-rotate-y', `${(horizontal - 0.5) * 9}deg`);
    figure.style.setProperty('--hero-card-shine-x', `${horizontal * 100}%`);
    figure.style.setProperty('--hero-card-shine-y', `${vertical * 100}%`);
  };

  const resetTilt = () => {
    const style = figureRef.current?.style;

    style?.setProperty('--hero-card-rotate-x', '0deg');
    style?.setProperty('--hero-card-rotate-y', '0deg');
    style?.setProperty('--hero-card-shine-x', '50%');
    style?.setProperty('--hero-card-shine-y', '45%');
  };

  return (
    <figure
      className="hero-card"
      aria-label={figureAriaLabel}
      ref={figureRef}
      style={restingStyle}
      onPointerMove={updateTilt}
      onPointerLeave={resetTilt}
    >
      <div className="hero-card-float" ref={floatRef} data-hero-card-float>
        <PixelCard
          variant="blue"
          gap={8}
          speed={42}
          colors="#dff9ff,#67e8f9,#00e5ff,#0ea5e9"
          className="hero-card-surface"
        >
          <div className="hero-card-media">
            {children}
            <span className="hero-card-glare" aria-hidden="true" />
          </div>
        </PixelCard>
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
