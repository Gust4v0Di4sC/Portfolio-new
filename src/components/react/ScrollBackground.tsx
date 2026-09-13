import { useEffect, useRef } from 'react';

const fallbackConfig = { phase: 0, size: 1, brightness: 1 };
const configs = [
  fallbackConfig,
  { phase: 1.18, size: 0.82, brightness: 0.82 },
  { phase: 2.45, size: 1.15, brightness: 1.08 },
  { phase: 3.7, size: 0.68, brightness: 0.76 },
  { phase: 4.92, size: 0.9, brightness: 0.9 },
];

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
    let frameId = 0;
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
      const seconds = time / 1000;
      const motionFactor = reducedMotion.matches ? 0.28 : 1;
      const orbitSpeed = reducedMotion.matches ? 0.18 : 1.85;
      const scrollAngle = scrollProgress * Math.PI * 1.45;

      if (orbField) {
        const fieldY = scrollProgress * 42;
        const fieldScale = 1 + scrollProgress * 0.04;
        orbField.style.transform = `translate3d(0, ${fieldY}px, 0) scale(${fieldScale})`;
      }

      tracks.forEach((track, index) => {
        const config = configs[index] ?? fallbackConfig;
        const angle = config.phase + seconds * orbitSpeed * motionFactor + scrollAngle;
        const radiusX = Math.max(170, width * 0.38);
        const radiusY = Math.max(92, height * 0.18);
        const depth = (Math.sin(angle) + 1) / 2;
        const x = Math.cos(angle) * radiusX;
        const y = Math.sin(angle) * radiusY;
        const scale = config.size * (0.82 + depth * 0.5);
        const opacity = (0.48 + depth * 0.48) * config.brightness;

        track.style.transform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), 0) scale(${scale})`;
        track.style.opacity = `${opacity}`;
      });

      particles.forEach((particle, index) => {
        const drift = Math.sin(seconds * (0.25 + index * 0.025) + index) * 18;
        particle.style.transform = `translate3d(${drift}px, ${scrollProgress * (80 + index * 8)}px, 0)`;
      });

      frameId = window.requestAnimationFrame(render);
    };

    const start = () => {
      if (frameId === 0) {
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

      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };

    refresh();
    start();

    window.addEventListener('resize', refresh, { passive: true });
    window.addEventListener('scroll', refresh, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stop();
      window.removeEventListener('resize', refresh);
      window.removeEventListener('scroll', refresh);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <div className="scroll-background" data-scroll-background aria-hidden="true" ref={rootRef}>
      <div className="orb-field">
        <span className="orb-track orb-track-one">
          <span className="bios-orb orb-one" />
        </span>
        <span className="orb-track orb-track-two">
          <span className="bios-orb orb-two" />
        </span>
        <span className="orb-track orb-track-three">
          <span className="bios-orb orb-three" />
        </span>
        <span className="orb-track orb-track-four">
          <span className="bios-orb orb-four" />
        </span>
        <span className="orb-track orb-track-five">
          <span className="bios-orb orb-five" />
        </span>
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
          display: block;
          width: 100%;
          height: 100%;
          border-radius: 999px;
          background: radial-gradient(circle, #f1fbff 0 26%, #77ecff 34%, #00d8ff 62%, #0789d7 100%);
          box-shadow:
            0 0 0.8rem 0.18rem rgb(103 232 249 / 0.82),
            0 0 2.4rem 0.9rem rgb(0 166 255 / 0.34),
            0 0 4.5rem 1.7rem rgb(0 82 190 / 0.18);
          mix-blend-mode: screen;
          opacity: var(--orb-opacity, 0.82);
        }

        .orb-track-one {
          --orb-size: clamp(0.48rem, 0.95vw, 0.82rem);
        }

        .orb-track-two {
          --orb-size: clamp(0.34rem, 0.72vw, 0.62rem);
          --orb-opacity: 0.72;
        }

        .orb-track-three {
          --orb-size: clamp(0.58rem, 1.08vw, 0.95rem);
          --orb-opacity: 0.76;
        }

        .orb-track-four {
          --orb-size: clamp(0.28rem, 0.52vw, 0.5rem);
          --orb-opacity: 0.64;
        }

        .orb-track-five {
          --orb-size: clamp(0.4rem, 0.82vw, 0.72rem);
          --orb-opacity: 0.68;
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

          .orb-track-five {
            display: none;
          }

          .orb-track-one {
            --orb-size: clamp(0.44rem, 2.3vw, 0.68rem);
          }

          .orb-track-two {
            --orb-size: clamp(0.32rem, 1.8vw, 0.52rem);
          }

          .orb-track-three {
            --orb-size: clamp(0.52rem, 2.7vw, 0.78rem);
          }

          .orb-track-four {
            --orb-size: clamp(0.28rem, 1.5vw, 0.44rem);
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
