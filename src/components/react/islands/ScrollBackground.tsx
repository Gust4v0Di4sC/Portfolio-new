import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';

import { orbitalLightConfigs } from '../../../scripts/visual/orbitalLights';
import { getGraphicsQuality, shouldRenderFrame } from '../../../scripts/visual/graphicsQuality';

export default function ScrollBackground() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const background = rootRef.current;

    if (!background) {
      return undefined;
    }

    const orbField = background.querySelector<HTMLElement>('.orb-field');
    const tracks = Array.from(background.querySelectorAll<HTMLElement>('.orb-track'));
    const particles = Array.from(background.querySelectorAll<HTMLElement>('.particle'));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const quality = getGraphicsQuality(reducedMotion.matches);
    let frameId = 0;
    let previousRenderTime = 0;
    let isVisible = false;
    let isGameActive = false;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let scrollProgress = 0;

    const refresh = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress = scrollable > 0 ? window.scrollY / scrollable : 0;
    };

    const render = (time: number) => {
      if (!isVisible || document.hidden || isGameActive) {
        frameId = 0;
        return;
      }

      if (!shouldRenderFrame(time, previousRenderTime, quality.frameInterval)) {
        frameId = window.requestAnimationFrame(render);
        return;
      }
      previousRenderTime = time;
      const seconds = time / 1000;
      const motionFactor = reducedMotion.matches ? 0.28 : 1;
      const orbitSpeed = reducedMotion.matches ? 0.28 : 1;
      const scrollAngle = scrollProgress * Math.PI * 1.45;

      if (orbField) {
        const fieldY = scrollProgress * 42;
        const fieldScale = 1 + scrollProgress * 0.04;
        orbField.style.transform = `translate3d(0, ${fieldY}px, 0) scale(${fieldScale})`;
      }

      tracks.forEach((track, index) => {
        const config = orbitalLightConfigs[index] ?? orbitalLightConfigs[0]!;
        const angle =
          config.phase + seconds * config.speed * orbitSpeed * motionFactor + scrollAngle;
        const radiusX = Math.max(120, width * config.radiusX);
        const radiusY = Math.max(72, height * config.radiusY);
        const depth = (Math.sin(angle) + 1) / 2;
        const x = Math.cos(angle) * radiusX;
        const y = Math.sin(angle) * radiusY;
        const scale = config.size * (0.82 + depth * 0.5);
        const opacity = (0.48 + depth * 0.48) * config.brightness;

        track.style.transform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), 0) scale(${scale})`;
        track.style.opacity = `${opacity}`;
        track.style.setProperty('--trail-angle', `${angle + Math.PI / 2}rad`);
      });

      particles.forEach((particle, index) => {
        const drift = Math.sin(seconds * (0.25 + index * 0.025) + index) * 18;
        particle.style.transform = `translate3d(${drift}px, ${scrollProgress * (80 + index * 8)}px, 0)`;
      });

      frameId = window.requestAnimationFrame(render);
    };

    const start = () => {
      if (frameId === 0 && isVisible && !document.hidden && !isGameActive) {
        frameId = window.requestAnimationFrame(render);
      }
    };

    const stop = () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
    };

    const handleVisibility = () => {
      background.style.setProperty(
        '--background-play-state',
        document.hidden ? 'paused' : 'running',
      );

      if (document.hidden || !isVisible) {
        stop();
      } else {
        start();
      }
    };
    const handleGameActivity = (event: Event) => {
      isGameActive = (event as CustomEvent<{ active?: boolean }>).detail.active === true;
      if (isGameActive) stop();
      else start();
    };

    refresh();

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry?.isIntersecting ?? false;
      if (isVisible) start();
      else stop();
    });
    visibilityObserver.observe(background);

    window.addEventListener('resize', refresh, { passive: true });
    window.addEventListener('scroll', refresh, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('portfolio:game-activity', handleGameActivity);

    return () => {
      stop();
      visibilityObserver.disconnect();
      window.removeEventListener('resize', refresh);
      window.removeEventListener('scroll', refresh);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('portfolio:game-activity', handleGameActivity);
    };
  }, []);

  return (
    <div className="scroll-background" data-scroll-background aria-hidden="true" ref={rootRef}>
      <div className="orb-field">
        {orbitalLightConfigs.map((config) => (
          <span
            className="orb-track"
            key={config.id}
            style={{ '--orb-color': config.color } as CSSProperties}
          >
            <span className="bios-orb" />
          </span>
        ))}
      </div>

      <span className="particle p1" />
      <span className="particle p2" />
      <span className="particle p3" />
      <span className="particle p4" />
      <span className="particle p5" />
      <span className="particle p6" />
      <span className="particle p7" />
      <span className="particle p8" />

      <style>{`
        .scroll-background {
          --background-play-state: running;
          position: fixed;
          inset: 0;
          z-index: 0;
          contain: paint;
          overflow: hidden;
          opacity: var(--splash-page-background-opacity, 1);
          pointer-events: none;
        }

        .scroll-background::before {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 50% 38%, rgb(34 211 238 / 0.1), transparent 22rem),
            radial-gradient(circle at 58% 44%, rgb(37 99 235 / 0.08), transparent 30rem);
          content: '';
        }

        .scroll-background::after {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(rgb(255 255 255 / 0.025) 1px, transparent 1px),
            radial-gradient(circle at center, transparent 0 52%, rgb(0 0 0 / 0.38) 100%);
          background-size:
            100% 4px,
            100% 100%;
          opacity: 0.4;
          content: '';
        }

        .orb-field {
          position: absolute;
          inset: 0;
          opacity: 1;
        }

        .orb-track {
          --orb-size: clamp(0.42rem, 0.9vw, 0.8rem);
          position: absolute;
          display: block;
          width: var(--orb-size);
          aspect-ratio: 1;
          top: 50%;
          left: 50%;
          margin-top: calc(var(--orb-size) * -0.5);
          margin-left: calc(var(--orb-size) * -0.5);
          transform: translate3d(-50%, -50%, 0);
          will-change: transform;
        }

        .bios-orb {
          position: relative;
          display: block;
          width: 100%;
          height: 100%;
          border-radius: 999px;
          background: radial-gradient(circle, #fff 0 16%, var(--orb-color) 38%, transparent 72%);
          box-shadow:
            0 0 0.8rem 0.18rem color-mix(in srgb, var(--orb-color) 82%, transparent),
            0 0 2.4rem 0.9rem color-mix(in srgb, var(--orb-color) 34%, transparent),
            0 0 4.5rem 1.7rem color-mix(in srgb, var(--orb-color) 16%, transparent);
          mix-blend-mode: screen;
          opacity: var(--orb-opacity, 0.82);
        }

        .bios-orb::after {
          position: absolute;
          top: 50%;
          left: 50%;
          width: clamp(4rem, 9vw, 8rem);
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--orb-color));
          box-shadow: 0 0 0.55rem color-mix(in srgb, var(--orb-color) 54%, transparent);
          content: '';
          opacity: 0.48;
          transform: translate(-100%, -50%) rotate(var(--trail-angle, 0rad));
          transform-origin: 100% 50%;
        }

        .particle {
          position: absolute;
          width: var(--particle-size, 0.45rem);
          aspect-ratio: 1;
          border-radius: 999px;
          background: var(--color-primary-intense);
          box-shadow:
            0 0 0.55rem rgb(0 229 255 / 0.78),
            0 0 2rem rgb(34 211 238 / 0.36);
          opacity: var(--particle-opacity, 0.76);
        }

        .p1 { --particle-size: 0.32rem; top: 16%; left: 8%; }
        .p2 { --particle-size: 0.55rem; top: 38%; left: 16%; }
        .p3 { --particle-size: 0.4rem; top: 21%; left: 39%; }
        .p4 { --particle-size: 0.62rem; top: 30%; left: 58%; }
        .p5 { --particle-size: 0.36rem; top: 14%; left: 73%; }
        .p6 { --particle-size: 0.5rem; top: 52%; left: 82%; }
        .p7 { --particle-size: 0.75rem; --particle-opacity: 0.58; top: 64%; left: 46%; }
        .p8 { --particle-size: 0.34rem; top: 78%; left: 68%; }

        @media (max-width: 42rem) {
          .orb-field {
            opacity: 0.68;
          }

          .orb-track {
            --orb-size: clamp(0.4rem, 2.2vw, 0.7rem);
          }

          .p2,
          .p6,
          .p8 {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .scroll-background::after {
            background: radial-gradient(circle at center, transparent 0 48%, rgb(0 0 0 / 0.42) 100%);
          }
        }
      `}</style>
    </div>
  );
}
