import { useEffect, useRef } from 'react';

import type { SplashContent } from '../../../content';
import { getSplashMotion, loadThree } from '../../../scripts/three/splashScene';
import type { SplashBlock } from '../../../scripts/three/splashScene';
import { orbitalLightConfigs } from '../../../scripts/visual/orbitalLights';
import { getGraphicsQuality, shouldRenderFrame } from '../../../scripts/visual/graphicsQuality';

type SplashIntroProps = {
  content: SplashContent;
};

export default function SplashIntro({ content }: SplashIntroProps) {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;

    if (!root || !canvas) {
      return undefined;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const motion = getSplashMotion(reducedMotion);
    const quality = getGraphicsQuality(reducedMotion);
    const { introDelay, motionFactor, sceneTimeOffset, starCount, cubeCount } = motion;
    const maxPixelRatio = Math.min(motion.maxPixelRatio, quality.pixelRatioCap);
    const blocks: SplashBlock[] = [];
    let animationFrame = 0;
    let startTime = performance.now();
    let previousFrameTime = startTime;
    let previousRenderTime = 0;
    let disposed = false;
    let entranceComplete = false;
    let entranceListenersAttached = false;
    let targetProgress = 0;
    let transitionProgress = 0;
    let touchStartY = 0;
    let cleanupScene = () => undefined;
    let startRendering = () => undefined;
    let stopRendering = () => undefined;
    let addEntranceListeners = () => undefined;
    let removeEntranceListeners = () => undefined;

    const setInterfaceActive = (active: boolean) => {
      const main = document.querySelector<HTMLElement>('main');

      if (active) {
        root.classList.remove('is-complete');
        root.removeAttribute('aria-hidden');
        document.documentElement.classList.add('splash-active');
        main?.setAttribute('inert', '');
        main?.setAttribute('aria-hidden', 'true');
        return;
      }

      root.classList.add('is-complete');
      root.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('splash-active');
      document.documentElement.style.removeProperty('--splash-interface-opacity');
      document.documentElement.style.removeProperty('--splash-interface-shift');
      document.documentElement.style.removeProperty('--splash-page-background-opacity');
      main?.removeAttribute('inert');
      main?.removeAttribute('aria-hidden');
    };

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setInterfaceActive(true);
    document.documentElement.style.setProperty('--splash-interface-opacity', '0');
    document.documentElement.style.setProperty('--splash-interface-shift', '8vh');
    document.documentElement.style.setProperty('--splash-page-background-opacity', '0');

    const setTargetProgress = (nextProgress: number) => {
      targetProgress = Math.min(1, Math.max(0, nextProgress));
    };

    const completeEntrance = () => {
      if (entranceComplete || disposed) return;
      entranceComplete = true;
      targetProgress = 1;
      transitionProgress = 1;
      stopRendering();
      removeEntranceListeners();
      setInterfaceActive(false);
      document
        .querySelector<HTMLElement>('[data-portfolio-menu] button[aria-current="true"]')
        ?.focus({ preventScroll: true });
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      setTargetProgress(targetProgress + event.deltaY / 900);
    };
    const handleTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? 0;
    };
    const handleTouchEnd = (event: TouchEvent) => {
      const touchEndY = event.changedTouches[0]?.clientY ?? touchStartY;
      setTargetProgress(targetProgress + (touchStartY - touchEndY) / 520);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Enter'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'Enter') {
        setTargetProgress(1);
        return;
      }
      const direction = ['ArrowUp', 'PageUp'].includes(event.key) ? -1 : 1;
      setTargetProgress(targetProgress + direction * 0.28);
    };
    const handleEnterClick = () => setTargetProgress(1);
    const enterButton = root.querySelector<HTMLButtonElement>('[data-splash-enter]');

    addEntranceListeners = () => {
      if (entranceListenersAttached) return;
      entranceListenersAttached = true;
      window.addEventListener('wheel', handleWheel, { passive: false });
      window.addEventListener('touchstart', handleTouchStart, { passive: true });
      window.addEventListener('touchend', handleTouchEnd, { passive: true });
      window.addEventListener('keydown', handleKeyDown);
      enterButton?.addEventListener('click', handleEnterClick);
    };

    removeEntranceListeners = () => {
      if (!entranceListenersAttached) return;
      entranceListenersAttached = false;
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
      enterButton?.removeEventListener('click', handleEnterClick);
    };

    const handleIntroRewind = (event: Event) => {
      if (!entranceComplete || disposed) return;
      const rewindEvent = event as CustomEvent<{ deltaY?: number }>;
      const deltaY = Math.min(-40, rewindEvent.detail?.deltaY ?? -140);

      entranceComplete = false;
      setTargetProgress(1 + deltaY / 900);
      setInterfaceActive(true);
      addEntranceListeners();
      enterButton?.focus({ preventScroll: true });
      startRendering();
    };

    window.addEventListener('portfolio:intro-rewind', handleIntroRewind);
    addEntranceListeners();

    const smoothstep = (value: number, minimum: number, maximum: number) => {
      const normalized = Math.min(1, Math.max(0, (value - minimum) / (maximum - minimum)));
      return normalized * normalized * (3 - 2 * normalized);
    };
    const updateTransitionStyles = (progress: number) => {
      const scrollProgress = smoothstep(progress, 0, 1);
      const interfaceOpacity = smoothstep(progress, 0.25, 0.72);
      const backdropOpacity = 1 - interfaceOpacity;
      const canvasOpacity = 1 - smoothstep(progress, 0.78, 1);
      const uiOpacity = 1 - smoothstep(progress, 0.12, 0.68);
      const hintOpacity = 1 - smoothstep(progress, 0, 0.15);
      const pageBackgroundOpacity = smoothstep(progress, 0.58, 0.96);

      root.style.setProperty('--splash-backdrop-opacity', backdropOpacity.toFixed(3));
      root.style.setProperty('--splash-canvas-opacity', canvasOpacity.toFixed(3));
      root.style.setProperty('--splash-ui-opacity', uiOpacity.toFixed(3));
      root.style.setProperty('--splash-hint-opacity', hintOpacity.toFixed(3));
      root.style.setProperty('--splash-ui-scale', (1 + scrollProgress * 0.14).toFixed(3));
      root.style.setProperty('--splash-ui-travel', `${(scrollProgress * 24).toFixed(2)}%`);
      root.dataset.transitionProgress = progress.toFixed(3);
      document.documentElement.style.setProperty(
        '--splash-interface-opacity',
        interfaceOpacity.toFixed(3),
      );
      document.documentElement.style.setProperty(
        '--splash-interface-shift',
        `${((1 - interfaceOpacity) * 8).toFixed(2)}vh`,
      );
      document.documentElement.style.setProperty(
        '--splash-page-background-opacity',
        pageBackgroundOpacity.toFixed(3),
      );
      return scrollProgress;
    };

    const setup = async () => {
      const THREE = await loadThree();
      const yieldToMain = () => new Promise<void>((resolve) => window.setTimeout(resolve, 0));

      if (disposed) {
        return;
      }

      await yieldToMain();

      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
      renderer.setClearColor(0x02060d, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x030713, 0.018);

      const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 180);
      const target = new THREE.Vector3(0, 2, 0);

      const starGeometry = new THREE.BufferGeometry();
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
          size: 0.08,
          transparent: true,
          opacity: 0.24,
          depthWrite: false,
        }),
      );
      scene.add(stars);

      const glowCanvas = document.createElement('canvas');
      glowCanvas.width = 128;
      glowCanvas.height = 128;
      const glowContext = glowCanvas.getContext('2d');

      if (glowContext) {
        const gradient = glowContext.createRadialGradient(64, 64, 0, 64, 64, 64);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.12, 'rgba(255,255,255,.96)');
        gradient.addColorStop(0.34, 'rgba(255,255,255,.42)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        glowContext.fillStyle = gradient;
        glowContext.fillRect(0, 0, 128, 128);
      }

      const glowTexture = new THREE.CanvasTexture(glowCanvas);
      const cloudLayouts = [
        [-10, 5, -5, 33, 17, 0.1],
        [8, 4, -8, 29, 14, 0.08],
        [-2, 2, 5, 27, 13, 0.11],
        [14, 7, 2, 22, 11, 0.06],
        [-15, 9, 4, 20, 10, 0.055],
        [2, 10, -13, 24, 12, 0.065],
      ] as const;
      const clouds = cloudLayouts.map(([x, y, z, width, height, opacity], index) => {
        const material = new THREE.SpriteMaterial({
          map: glowTexture,
          color: index % 2 === 0 ? 0x123a9c : 0x244fe2,
          transparent: true,
          opacity,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const sprite = new THREE.Sprite(material);
        sprite.position.set(x, y, z);
        sprite.scale.set(width, height, 1);
        scene.add(sprite);
        return { sprite, material, x, y, phase: index * 1.17, opacity };
      });

      await yieldToMain();

      const blockMaterials = [
        new THREE.MeshStandardMaterial({
          color: 0x070912,
          emissive: 0x07112a,
          emissiveIntensity: 0.38,
          roughness: 0.22,
          metalness: 0.72,
          transparent: true,
          opacity: 0.32,
        }),
        new THREE.MeshStandardMaterial({
          color: 0x0b0d19,
          emissive: 0x101a3e,
          emissiveIntensity: 0.52,
          roughness: 0.18,
          metalness: 0.78,
          transparent: true,
          opacity: 0.42,
        }),
      ];
      const edgeMaterials = [
        new THREE.LineBasicMaterial({ color: 0x40527f, transparent: true, opacity: 0.34 }),
        new THREE.LineBasicMaterial({ color: 0x8298d9, transparent: true, opacity: 0.5 }),
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
        group.position.set(x, targetY, z);
        group.rotation.set(Math.random() * 0.5, Math.random() * 0.8, Math.random() * 0.4);
        group.visible = true;
        scene.add(group);

        const radius = Math.hypot(x, z) || 1;
        const spread = 10 + Math.random() * 22;

        blocks.push({
          group,
          targetY,
          delay,
          height,
          speed: 1.55 + Math.random() * 0.55,
          sway: Math.random() * Math.PI * 2,
          originX: x,
          originZ: z,
          driftX: (x / radius) * spread + (Math.random() - 0.5) * 5,
          driftY: (Math.random() - 0.35) * 24,
          driftZ: (z / radius) * spread + (Math.random() - 0.5) * 5,
        });
      };

      const cubeLayouts = [
        { x: -20, y: 11, z: -8, width: 8, height: 6, depth: 8 },
        { x: 20, y: 10, z: -10, width: 7, height: 8, depth: 7 },
        { x: -18, y: 2, z: 10, width: 7, height: 7, depth: 6 },
        { x: 18, y: 1, z: 9, width: 6, height: 5, depth: 7 },
        { x: -8, y: 14, z: -16, width: 5, height: 4, depth: 5 },
        { x: 9, y: 13, z: -18, width: 4, height: 5, depth: 4 },
        { x: -10, y: -1, z: 17, width: 4, height: 4, depth: 5 },
        { x: 11, y: 4, z: 15, width: 4, height: 4, depth: 4 },
      ];

      cubeLayouts.slice(0, cubeCount).forEach((cube, index) => {
        createBlock(cube.x, cube.z, cube.width, cube.depth, cube.height, cube.y, 0, index);
      });

      await yieldToMain();

      scene.add(new THREE.AmbientLight(0x071127, 0.82));

      const centerLight = new THREE.PointLight(0x255cff, 7, 62);
      centerLight.position.set(0, 7, 2);
      scene.add(centerLight);

      const trailLength = reducedMotion ? 18 : 42;
      const orbiters = orbitalLightConfigs.map((config) => {
        const spriteMaterial = new THREE.SpriteMaterial({
          map: glowTexture,
          color: config.hex,
          transparent: true,
          opacity: 0.94 * config.brightness,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.setScalar(1.65 * config.size);

        const light = new THREE.PointLight(config.hex, 18 * config.brightness, 42, 1.7);
        const positions = new Float32Array(trailLength * 3);
        const geometry = new THREE.BufferGeometry();
        const positionAttribute = new THREE.BufferAttribute(positions, 3);
        geometry.setAttribute('position', positionAttribute);
        const trailMaterial = new THREE.LineBasicMaterial({
          color: config.hex,
          transparent: true,
          opacity: 0.42 * config.brightness,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const trail = new THREE.Line(geometry, trailMaterial);
        scene.add(trail, sprite, light);
        return {
          config,
          sprite,
          spriteMaterial,
          light,
          positions,
          positionAttribute,
          geometry,
          trailMaterial,
        };
      });

      await yieldToMain();

      const resize = () => {
        const width = root.clientWidth;
        const height = root.clientHeight;

        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };

      const updateBlocks = (elapsed: number, scrollProgress: number) => {
        blocks.forEach((block) => {
          const floatY = Math.sin(elapsed * 0.34 + block.sway) * 0.72;
          block.group.position.set(
            block.originX +
              Math.cos(elapsed * 0.12 + block.sway) * 0.42 +
              block.driftX * scrollProgress,
            block.targetY + floatY + block.driftY * scrollProgress,
            block.originZ +
              Math.sin(elapsed * 0.11 + block.sway) * 0.5 +
              block.driftZ * scrollProgress,
          );
          block.group.scale.setScalar(1 + scrollProgress * 0.3);
          block.group.rotation.set(
            elapsed * (0.035 + block.speed * 0.008) + Math.sin(block.sway) * scrollProgress * 0.7,
            elapsed * (0.052 + block.speed * 0.01) + scrollProgress * block.sway * 0.22,
            elapsed * 0.024 + Math.cos(block.sway) * scrollProgress * 0.55,
          );
        });
      };

      const render = (now: number) => {
        if (disposed || entranceComplete) {
          animationFrame = 0;
          return;
        }

        if (!shouldRenderFrame(now, previousRenderTime, quality.frameInterval)) {
          animationFrame = window.requestAnimationFrame(render);
          return;
        }
        previousRenderTime = now;

        const deltaSeconds = Math.min((now - previousFrameTime) / 1000, 0.05);
        previousFrameTime = now;
        const smoothing = 1 - Math.exp(-deltaSeconds * (reducedMotion ? 14 : 9));
        transitionProgress = THREE.MathUtils.lerp(transitionProgress, targetProgress, smoothing);
        if (Math.abs(targetProgress - transitionProgress) < 0.0005) {
          transitionProgress = targetProgress;
        }

        const scrollProgress = updateTransitionStyles(transitionProgress);
        const backdropOpacity = Number(root.style.getPropertyValue('--splash-backdrop-opacity'));

        const elapsed = (now - startTime) / 1000;
        const motionElapsed = Math.max(0, elapsed - introDelay / 1000);
        const sceneElapsed = sceneTimeOffset + motionElapsed * motionFactor;

        updateBlocks(sceneElapsed, scrollProgress);

        stars.rotation.y = sceneElapsed * 0.014 * motionFactor + scrollProgress * 0.42;
        stars.position.y = -scrollProgress * 9;
        stars.scale.setScalar(1 + scrollProgress * 0.38);

        clouds.forEach((cloud) => {
          cloud.sprite.position.x = cloud.x + Math.sin(sceneElapsed * 0.09 + cloud.phase) * 1.6;
          cloud.sprite.position.y = cloud.y + Math.cos(sceneElapsed * 0.08 + cloud.phase) * 0.8;
          cloud.material.opacity =
            cloud.opacity *
            backdropOpacity *
            (0.82 + Math.sin(sceneElapsed * 0.22 + cloud.phase) * 0.18);
        });

        const orbitTime = now / 1000;
        orbiters.forEach(
          ({ config, sprite, light, positions, positionAttribute, trailMaterial }) => {
            const radiusX = 10 + config.radiusX * 34;
            const radiusZ = 8 + config.radiusY * 42;
            const motionScale = reducedMotion ? 0.28 : 1;

            for (let index = 0; index < trailLength; index += 1) {
              const trailOffset = index * 0.035 * Math.sign(config.speed || 1);
              const angle = config.phase + orbitTime * config.speed * motionScale - trailOffset;
              const fade = 1 - index / trailLength;
              positions[index * 3] = Math.cos(angle) * radiusX * (0.92 + fade * 0.08);
              positions[index * 3 + 1] = 4 + Math.sin(angle * 1.55 + config.phase) * 3.4;
              positions[index * 3 + 2] = Math.sin(angle) * radiusZ;
            }

            positionAttribute.needsUpdate = true;
            sprite.position.set(positions[0]!, positions[1]!, positions[2]!);
            light.position.copy(sprite.position);
            sprite.scale.setScalar(
              config.size * (1.45 + Math.sin(orbitTime * 2 + config.phase) * 0.16),
            );
            trailMaterial.opacity = 0.42 * config.brightness * backdropOpacity;
          },
        );

        camera.position.set(
          Math.sin(sceneElapsed * 0.08) * 1.6 + Math.sin(scrollProgress * Math.PI) * 4,
          THREE.MathUtils.lerp(17, 9, scrollProgress),
          THREE.MathUtils.lerp(39, 8, scrollProgress),
        );
        camera.fov = THREE.MathUtils.lerp(52, 70, scrollProgress);
        camera.updateProjectionMatrix();
        target.set(
          Math.sin(sceneElapsed * 0.1) * 0.9 + scrollProgress * 2,
          THREE.MathUtils.lerp(4, 2.5, scrollProgress),
          0,
        );
        camera.lookAt(target);

        renderer.render(scene, camera);

        if (targetProgress >= 1 && transitionProgress >= 0.999) {
          completeEntrance();
          return;
        }

        animationFrame = requestAnimationFrame(render);
      };

      stopRendering = () => {
        if (animationFrame === 0) return;
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      };

      startRendering = () => {
        if (animationFrame !== 0 || disposed || entranceComplete || document.hidden) return;
        previousFrameTime = performance.now();
        animationFrame = window.requestAnimationFrame(render);
      };

      const handleVisibility = () => {
        if (document.hidden) stopRendering();
        else startRendering();
      };

      let sceneCleaned = false;
      cleanupScene = () => {
        if (sceneCleaned) return;
        sceneCleaned = true;
        stopRendering();
        window.removeEventListener('resize', resize);
        document.removeEventListener('visibilitychange', handleVisibility);
        renderer.dispose();
        starGeometry.dispose();
        blockMaterials.forEach((material) => material.dispose());
        edgeMaterials.forEach((material) => material.dispose());
        glowTexture.dispose();
        clouds.forEach(({ material }) => material.dispose());
        orbiters.forEach(({ spriteMaterial, geometry, trailMaterial }) => {
          spriteMaterial.dispose();
          geometry.dispose();
          trailMaterial.dispose();
        });
        blocks.forEach((block) => {
          block.group.traverse((child) => {
            if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
              child.geometry.dispose();
            }
          });
        });
      };

      resize();
      void renderer.compileAsync(scene, camera).catch(() => undefined);
      await yieldToMain();
      window.addEventListener('resize', resize);
      document.addEventListener('visibilitychange', handleVisibility);
      startTime = performance.now();
      startRendering();
    };

    void setup();

    return () => {
      disposed = true;
      stopRendering();
      cleanupScene();
      removeEntranceListeners();
      window.removeEventListener('portfolio:intro-rewind', handleIntroRewind);
      setInterfaceActive(false);
    };
  }, []);

  return (
    <section
      className="splash-intro"
      data-splash-intro
      aria-label={content.ariaLabel}
      ref={rootRef}
    >
      <div className="splash-backdrop" aria-hidden="true" />
      <canvas className="splash-canvas" data-splash-canvas aria-hidden="true" ref={canvasRef} />
      <div className="splash-scanlines" aria-hidden="true" />

      <div className="splash-ui">
        <h2>{content.title}</h2>
        <p className="splash-portfolio">{content.subtitle}</p>
        <p className="splash-invitation">{content.invitation}</p>
      </div>

      <button className="splash-scroll-hint" type="button" data-splash-enter>
        <span>{content.scrollHint}</span>
        <span className="splash-scroll-line" />
      </button>

      <style>{`
        html.splash-active,
        html.splash-active body {
          overflow: hidden;
        }

        .site-header,
        main,
        body > footer {
          opacity: var(--splash-interface-opacity, 1);
        }

        main {
          transform: translateY(var(--splash-interface-shift, 0));
          will-change: opacity, transform;
        }

        .splash-intro {
          --splash-backdrop-opacity: 1;
          --splash-canvas-opacity: 1;
          --splash-ui-opacity: 1;
          --splash-hint-opacity: 1;
          --splash-ui-scale: 1;
          --splash-ui-travel: 0%;

          position: fixed;
          inset: 0;
          z-index: 9000;
          min-height: 100vh;
          min-height: 100svh;
          overflow: hidden;
          color: var(--color-text);
        }

        .splash-intro.is-complete {
          display: none;
        }

        .splash-backdrop {
          position: absolute;
          inset: 0;
          z-index: 0;
          background:
            radial-gradient(circle at 50% 50%, rgb(0 229 255 / 0.13), transparent 28rem), #02060d;
          opacity: var(--splash-backdrop-opacity);
          pointer-events: none;
          will-change: opacity;
        }

        .splash-canvas {
          position: absolute;
          inset: 0;
          z-index: 0;
          width: 100%;
          height: 100%;
          opacity: var(--splash-canvas-opacity);
          pointer-events: none;
          will-change: opacity;
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
          opacity: var(--splash-backdrop-opacity);
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
          opacity: var(--splash-ui-opacity);
          transform: translate(-50%, calc(-38% - var(--splash-ui-travel)))
            scale(var(--splash-ui-scale));
          pointer-events: none;
          will-change: opacity, transform;
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

        .splash-portfolio {
          color: var(--color-primary-intense);
          font-family: var(--font-display);
          font-size: clamp(0.95rem, 0.8rem + 0.7vw, 1.4rem);
          font-weight: 700;
          letter-spacing: 0.18em;
          text-shadow:
            0 0 0.8rem rgb(0 229 255 / 0.75),
            0 0 2.5rem rgb(37 99 235 / 0.38);
          text-transform: uppercase;
          animation: splash-reveal 1100ms ease 2000ms both;
        }

        .splash-invitation {
          max-width: 30rem;
          margin-top: 0.5rem;
          color: rgb(223 249 255 / 0.72);
          font-family: var(--font-body);
          font-size: clamp(0.78rem, 0.68rem + 0.45vw, 1rem);
          letter-spacing: 0.06em;
          line-height: 1.5;
          text-shadow: 0 0 1rem rgb(0 229 255 / 0.28);
          animation: splash-reveal 1100ms ease 2250ms both;
        }

        .splash-scroll-hint {
          position: absolute;
          bottom: clamp(1.5rem, 5vh, 3.5rem);
          left: 50%;
          z-index: 2;
          display: grid;
          justify-items: center;
          gap: 0.7rem;
          color: var(--color-text-muted);
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          border: 0;
          background: transparent;
          cursor: pointer;
          opacity: var(--splash-hint-opacity);
          text-transform: uppercase;
          transform: translateX(-50%);
          will-change: opacity;
        }

        .splash-scroll-hint:focus-visible {
          border-radius: 0.25rem;
        }

        .splash-scroll-line {
          width: 1px;
          height: clamp(2rem, 6vh, 3.5rem);
          background: linear-gradient(180deg, var(--color-primary-intense), transparent);
          box-shadow: 0 0 0.75rem rgb(0 229 255 / 0.7);
          animation: splash-scroll-pulse 1600ms ease-in-out infinite;
          transform-origin: top;
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

        @keyframes splash-scroll-pulse {
          0%,
          100% {
            opacity: 0.35;
            transform: scaleY(0.45);
          }

          50% {
            opacity: 1;
            transform: scaleY(1);
          }
        }

        @media (max-width: 42rem) {
          .splash-ui {
            transform: translate(-50%, calc(-44% - var(--splash-ui-travel)))
              scale(var(--splash-ui-scale));
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .splash-intro,
          .splash-ui h2,
          .splash-portfolio,
          .splash-invitation,
          .splash-scroll-line {
            animation: none;
            transition-duration: 0.01ms;
          }
        }
      `}</style>
    </section>
  );
}
