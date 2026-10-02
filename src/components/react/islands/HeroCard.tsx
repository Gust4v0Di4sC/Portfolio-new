import {
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

import type { HeroContent } from '../../../content';
import PixelCard from '../bits/PixelCard';
import BlackHoleGameModal from './BlackHoleGameModal';
import './HeroCard.css';

type HeroCardProps = {
  children: ReactNode;
  figureAriaLabel: string;
  gameContent: HeroContent['game'];
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

export default function HeroCard({ children, figureAriaLabel, gameContent }: HeroCardProps) {
  const figureRef = useRef<HTMLElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isGameOpen, setIsGameOpen] = useState(false);

  useEffect(() => {
    const floatingCard = floatRef.current;

    if (!floatingCard) {
      return undefined;
    }

    if (isGameOpen) {
      floatingCard.style.transform = 'none';
      return undefined;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const amplitude = reducedMotion ? 3 : 15;
    const cycleDuration = reducedMotion ? 7000 : 3400;
    let animationFrame = 0;
    let startTime = performance.now();
    let isVisible = false;

    const animate = (now: number) => {
      if (!isVisible || document.hidden) {
        animationFrame = 0;
        return;
      }
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

      if (!document.hidden && isVisible) {
        startTime = performance.now();
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    const updateVisibility = (visible: boolean) => {
      isVisible = visible;
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      if (isVisible && !document.hidden) {
        startTime = performance.now();
        animationFrame = window.requestAnimationFrame(animate);
      }
    };
    const visibilityObserver =
      'IntersectionObserver' in window
        ? new IntersectionObserver(([entry]) => updateVisibility(entry?.isIntersecting ?? false))
        : undefined;
    if (visibilityObserver) visibilityObserver.observe(floatingCard);
    else updateVisibility(true);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      visibilityObserver?.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isGameOpen]);

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
          noFocus
          active={!isGameOpen}
          className="hero-card-surface"
        >
          <button
            className="hero-card-trigger"
            type="button"
            aria-label={gameContent.triggerLabel}
            aria-haspopup="dialog"
            aria-controls="black-hole-game-dialog"
            data-sound="confirm"
            ref={triggerRef}
            onClick={() => setIsGameOpen(true)}
          >
            <span className="hero-card-media">
              {children}
              <span className="hero-card-glare" aria-hidden="true" />
            </span>
          </button>
        </PixelCard>
      </div>
      <BlackHoleGameModal
        content={gameContent}
        isOpen={isGameOpen}
        onRequestClose={() => {
          setIsGameOpen(false);
          window.requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true }));
        }}
      />
    </figure>
  );
}
