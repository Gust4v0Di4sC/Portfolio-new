import { useEffect, useRef } from 'react';
import type { Group } from 'three';

type ThreeModule = typeof import('three');
type SplashBlock = {
  group: Group;
  targetY: number;
  delay: number;
  height: number;
  speed: number;
  sway: number;
};

const statusMessages = [
  'Inicializando interface...',
  'Sincronizando malha visual...',
  'Montando blocos de memoria...',
  'Calibrando camada interativa...',
  'Interface pronta.',
];

export default function SplashIntro() {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const fill = fillRef.current;
    const percent = percentRef.current;
    const status = statusRef.current;

    if (!root || !canvas || !fill || !percent || !status) {
      return undefined;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const introDelay = reducedMotion ? 250 : 1500;
    const animationDuration = reducedMotion ? 1800 : 11200;
    const totalDuration = introDelay + animationDuration;
    const fadeDuration = reducedMotion ? 260 : 900;
    const blocks: SplashBlock[] = [];
    let animationFrame = 0;
    let finishTimer = 0;
    let startTime = performance.now();
    let ended = false;
    let cleanupScene = () => undefined;

    document.documentElement.classList.add('splash-running');

    const finishSplash = () => {
      if (ended) {
        return;
      }

      ended = true;
      fill.style.width = '100%';
      percent.textContent = '100%';
      status.textContent = 'Interface pronta.';
      root.classList.add('is-leaving');

      window.setTimeout(() => {
        window.clearTimeout(finishTimer);
        window.cancelAnimationFrame(animationFrame);
        cleanupScene();
        root.remove();
        document.documentElement.classList.remove('splash-running');
      }, fadeDuration);
    };

    const setup = async () => {
      const THREE: ThreeModule = await import('three');

      if (ended) {
        return;
      }

      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x02060d, 1);
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x020b18, 0.023);

      const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 220);
      const target = new THREE.Vector3(0, 3, 0);

      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(190, 190, 18, 18),
        new THREE.MeshStandardMaterial({
          color: 0x020813,
          roughness: 0.74,
          metalness: 0.28,
        }),
      );
      ground.rotation.x = -Math.PI / 2;
      scene.add(ground);

      const grid = new THREE.GridHelper(138, 30, 0x005b86, 0x032943);
      grid.material.transparent = true;
      grid.material.opacity = 0.12;
      scene.add(grid);

      const starGeometry = new THREE.BufferGeometry();
      const starCount = 520;
      const starPositions = new Float32Array(starCount * 3);

      for (let index = 0; index < starCount; index += 1) {
        starPositions[index * 3] = (Math.random() - 0.5) * 150;
        starPositions[index * 3 + 1] = Math.random() * 38 + 8;
        starPositions[index * 3 + 2] = (Math.random() - 0.5) * 150;
      }

      starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      const stars = new THREE.Points(
        starGeometry,
        new THREE.PointsMaterial({
          color: 0x4defff,
          size: 0.12,
          transparent: true,
          opacity: 0.42,
          depthWrite: false,
        }),
      );
      scene.add(stars);

      const blockMaterials = [
        new THREE.MeshStandardMaterial({
          color: 0x061529,
          emissive: 0x001b32,
          emissiveIntensity: 0.5,
          roughness: 0.38,
          metalness: 0.55,
          transparent: true,
          opacity: 0.66,
        }),
        new THREE.MeshStandardMaterial({
          color: 0x0b2443,
          emissive: 0x00405f,
          emissiveIntensity: 0.82,
          roughness: 0.32,
          metalness: 0.62,
          transparent: true,
          opacity: 0.74,
        }),
      ];
      const edgeMaterials = [
        new THREE.LineBasicMaterial({ color: 0x007fb8, transparent: true, opacity: 0.56 }),
        new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.92 }),
      ];

      const createBlock = (
        x: number,
        z: number,
        width: number,
        depth: number,
        height: number,
        targetY: number,
        delay: number,
        order: number,
      ) => {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const lit = order % 4 === 0 || Math.random() > 0.74;
        const mesh = new THREE.Mesh(geometry, blockMaterials[lit ? 1 : 0]);
        const edges = new THREE.LineSegments(
          new THREE.EdgesGeometry(geometry),
          edgeMaterials[lit ? 1 : 0],
        );
        const group = new THREE.Group();

        group.add(mesh);
        group.add(edges);
        group.position.set(x, -18 - Math.random() * 14, z);
        group.scale.y = 0.025;
        group.visible = false;
        scene.add(group);

        blocks.push({
          group,
          targetY,
          delay,
          height,
          speed: 0.78 + Math.random() * 0.32,
          sway: Math.random() * Math.PI * 2,
        });
      };

      for (let tower = 0; tower < 52; tower += 1) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.sqrt(Math.random()) * 42;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const levels = 4 + Math.floor(Math.random() * 11);
        const width = 0.82 + Math.random() * 0.58;
        const depth = 0.82 + Math.random() * 0.58;
        const baseDelay = Math.random() * 2.7 + radius * 0.025;

        for (let level = 0; level < levels; level += 1) {
          const height = 0.8 + Math.random() * 0.55;
          createBlock(
            x + (Math.random() - 0.5) * 0.16,
            z + (Math.random() - 0.5) * 0.16,
            width,
            depth,
            height,
            height / 2 + level * 0.92,
            baseDelay + level * 0.16,
            level,
          );
        }
      }

      scene.add(new THREE.AmbientLight(0x051328, 1.22));

      const keyLight = new THREE.PointLight(0x00e5ff, 16, 86);
      const blueLight = new THREE.PointLight(0x2563eb, 10, 90);
      const rimLight = new THREE.PointLight(0x74f4ff, 9, 56);
      scene.add(keyLight, blueLight, rimLight);

      const resize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };

      const easeOut = (value: number) => 1 - Math.pow(1 - value, 3);

      const updateBlocks = (elapsed: number) => {
        blocks.forEach((block) => {
          const progress = THREE.MathUtils.clamp((elapsed - block.delay) * block.speed, 0, 1);

          if (progress <= 0) {
            return;
          }

          const eased = easeOut(progress);
          block.group.visible = true;
          block.group.position.y = THREE.MathUtils.lerp(-16 - block.height, block.targetY, eased);
          block.group.scale.y = THREE.MathUtils.lerp(0.035, 1, eased);
          block.group.rotation.y = Math.sin(elapsed * 0.45 + block.sway) * 0.018;
        });
      };

      const updateUi = (elapsed: number) => {
        const progress = THREE.MathUtils.clamp(elapsed / (animationDuration / 1000 - 0.7), 0, 1);
        const pct = Math.min(100, Math.floor(progress * 100));
        const messageIndex = Math.min(
          statusMessages.length - 1,
          Math.floor(progress * statusMessages.length),
        );

        fill.style.width = `${pct}%`;
        percent.textContent = `${pct}%`;
        status.textContent =
          statusMessages[messageIndex] ?? statusMessages[statusMessages.length - 1] ?? '';
      };

      const render = (now: number) => {
        if (ended) {
          return;
        }

        const elapsed = (now - startTime) / 1000;
        const sceneElapsed = Math.max(0, elapsed - introDelay / 1000);
        const cameraProgress = THREE.MathUtils.smoothstep(sceneElapsed / 9.4, 0, 1);

        updateBlocks(sceneElapsed);

        if (sceneElapsed > 0) {
          updateUi(sceneElapsed);
        }

        stars.rotation.y = sceneElapsed * 0.014;
        keyLight.position.set(
          Math.cos(sceneElapsed * 0.44) * 24,
          20 + Math.sin(sceneElapsed * 0.52) * 4,
          Math.sin(sceneElapsed * 0.44) * 26,
        );
        blueLight.position.set(
          Math.cos(sceneElapsed * 0.3 + 2.2) * 34,
          28,
          Math.sin(sceneElapsed * 0.3 + 2.2) * 32,
        );
        rimLight.position.set(
          Math.cos(sceneElapsed * 0.5 + 4.5) * 18,
          16,
          Math.sin(sceneElapsed * 0.5 + 4.5) * 18,
        );

        camera.position.set(
          Math.sin(sceneElapsed * 0.08) * 2.4,
          THREE.MathUtils.lerp(72, 34, cameraProgress),
          THREE.MathUtils.lerp(2, 34, cameraProgress),
        );
        target.set(
          Math.sin(sceneElapsed * 0.1) * 1.2,
          THREE.MathUtils.lerp(0, 5, cameraProgress),
          0,
        );
        camera.lookAt(target);

        renderer.render(scene, camera);
        animationFrame = requestAnimationFrame(render);
      };

      cleanupScene = () => {
        window.removeEventListener('resize', resize);
        renderer.dispose();
        starGeometry.dispose();
        ground.geometry.dispose();
        ground.material.dispose();
        grid.geometry.dispose();
        grid.material.dispose();
        blockMaterials.forEach((material) => material.dispose());
        edgeMaterials.forEach((material) => material.dispose());
        blocks.forEach((block) => {
          block.group.traverse((child) => {
            if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
              child.geometry.dispose();
            }
          });
        });
      };

      resize();
      window.addEventListener('resize', resize);
      animationFrame = requestAnimationFrame((now) => {
        startTime = now;
        render(now);
      });
      finishTimer = window.setTimeout(finishSplash, totalDuration);
    };

    void setup();

    return () => {
      ended = true;
      window.clearTimeout(finishTimer);
      window.cancelAnimationFrame(animationFrame);
      cleanupScene();
      document.documentElement.classList.remove('splash-running');
    };
  }, []);

  return (
    <section
      className="splash-intro"
      data-splash-intro
      aria-label="Intro de carregamento"
      ref={rootRef}
    >
      <canvas className="splash-canvas" data-splash-canvas aria-hidden="true" ref={canvasRef} />
      <div className="splash-scanlines" aria-hidden="true" />

      <div className="splash-ui">
        <p className="splash-brand">BOOT/UI</p>
        <h2>Inicializando</h2>
        <p className="splash-role">Carregando interface visual</p>
      </div>

      <div className="splash-progress" aria-live="polite">
        <div className="progress-row">
          <span>INICIALIZANDO</span>
          <span ref={percentRef}>0%</span>
        </div>
        <div className="progress-track">
          <span ref={fillRef} />
        </div>
        <p ref={statusRef}>Inicializando interface...</p>
      </div>

      <style>{`
        html.splash-running,
        html.splash-running body {
          overflow: hidden;
        }

        .splash-intro {
          position: fixed;
          inset: 0;
          z-index: 9000;
          overflow: hidden;
          color: var(--color-text);
          background:
            radial-gradient(circle at 50% 50%, rgb(0 229 255 / 0.13), transparent 28rem), #02060d;
          opacity: 1;
          transition:
            opacity 900ms ease,
            visibility 900ms ease;
        }

        .splash-intro.is-leaving {
          visibility: hidden;
          opacity: 0;
          pointer-events: none;
        }

        .splash-canvas {
          position: absolute;
          inset: 0;
          z-index: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .splash-scanlines {
          position: absolute;
          inset: 0;
          z-index: 1;
          background:
            repeating-linear-gradient(
              to bottom,
              transparent 0,
              transparent 3px,
              rgb(0 0 0 / 0.1) 3px,
              rgb(0 0 0 / 0.1) 4px
            ),
            linear-gradient(180deg, rgb(2 6 13 / 0.08), rgb(2 6 13 / 0.5));
          pointer-events: none;
        }

        .splash-ui {
          position: absolute;
          top: 50%;
          left: 50%;
          z-index: 2;
          display: grid;
          width: min(calc(100% - 2rem), 42rem);
          justify-items: center;
          gap: 0.45rem;
          text-align: center;
          transform: translate(-50%, -38%);
          pointer-events: none;
        }

        .splash-brand {
          color: var(--color-primary-intense);
          font-family: var(--font-display);
          font-size: clamp(0.9rem, 0.78rem + 0.55vw, 1.25rem);
          font-weight: 700;
          letter-spacing: 0.12em;
          text-shadow:
            0 0 0.8rem rgb(0 229 255 / 0.85),
            0 0 3rem rgb(37 99 235 / 0.42);
          animation: splash-reveal 1100ms ease 900ms both;
        }

        .splash-ui h2 {
          color: var(--color-text);
          font-family: var(--font-display);
          font-size: clamp(2.15rem, 1.1rem + 5vw, 5.4rem);
          letter-spacing: 0.08em;
          line-height: 1;
          text-shadow:
            0 0 1rem rgb(0 229 255 / 0.85),
            0 0 4rem rgb(37 99 235 / 0.54);
          animation: splash-title 1300ms ease 1350ms both;
        }

        .splash-role {
          color: rgb(156 176 195 / 0.82);
          font-family: var(--font-mono);
          font-size: clamp(0.78rem, 0.66rem + 0.5vw, 1rem);
          letter-spacing: 0.22em;
          text-transform: uppercase;
          animation: splash-reveal 1100ms ease 2000ms both;
        }

        .splash-progress {
          position: absolute;
          right: 50%;
          bottom: clamp(2.5rem, 9vw, 5.5rem);
          z-index: 2;
          display: grid;
          width: min(20rem, calc(100% - 3rem));
          gap: 0.45rem;
          color: rgb(156 176 195 / 0.72);
          font-family: var(--font-mono);
          font-size: 0.78rem;
          transform: translateX(50%);
        }

        .progress-row {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          letter-spacing: 0.12em;
        }

        .progress-track {
          position: relative;
          height: 2px;
          overflow: hidden;
          background: rgb(34 211 238 / 0.16);
        }

        .progress-track::before,
        .progress-track::after {
          position: absolute;
          top: -3px;
          width: 2px;
          height: 8px;
          background: rgb(0 229 255 / 0.58);
          content: '';
        }

        .progress-track::before {
          left: 0;
        }

        .progress-track::after {
          right: 0;
        }

        .progress-track span {
          display: block;
          width: 0;
          height: 100%;
          background: linear-gradient(90deg, var(--color-secondary), var(--color-primary-intense));
          box-shadow:
            0 0 0.7rem rgb(0 229 255 / 0.9),
            0 0 1.5rem rgb(37 99 235 / 0.45);
          transition: width 160ms linear;
        }

        .splash-progress p {
          min-height: 1.2rem;
          color: rgb(156 176 195 / 0.52);
          letter-spacing: 0.12em;
        }

        @keyframes splash-reveal {
          from {
            opacity: 0;
            transform: translateY(0.65rem);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes splash-title {
          from {
            opacity: 0;
            transform: scale(0.96);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @media (max-width: 42rem) {
          .splash-ui {
            transform: translate(-50%, -44%);
          }

          .splash-role {
            max-width: 24rem;
            letter-spacing: 0.12em;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .splash-intro,
          .splash-brand,
          .splash-ui h2,
          .splash-role {
            animation: none;
            transition-duration: 0.01ms;
          }
        }
      `}</style>
    </section>
  );
}
