import { useEffect, useRef, useState } from 'react';

import { loadThree } from '../../../scripts/three/splashScene';
import { getSystemConfigurationMotion } from '../../../scripts/three/systemConfigurationScene';
import { getGraphicsQuality, shouldRenderFrame } from '../../../scripts/visual/graphicsQuality';

type SystemConfigurationSceneProps = {
  selectedIndex: number;
  viewerMode: boolean;
};

type SceneState = 'loading' | 'true' | 'fallback';

const cubeLayouts = [
  { x: -6.8, y: 3.2, z: 0.4, phase: 0.2 },
  { x: -7.5, y: 0.45, z: 1.2, phase: 1.7 },
  { x: -6.2, y: -2.1, z: -0.2, phase: 3.1 },
  { x: -3.9, y: -3.8, z: 1.1, phase: 4.6 },
  { x: -1.1, y: -4.1, z: 0.5, phase: 5.4 },
] as const;

const rayCount = 12;

export default function SystemConfigurationScene({
  selectedIndex,
  viewerMode,
}: SystemConfigurationSceneProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectedIndexRef = useRef(selectedIndex);
  const viewerModeRef = useRef(viewerMode);
  const [sceneState, setSceneState] = useState<SceneState>('loading');

  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  useEffect(() => {
    viewerModeRef.current = viewerMode;
  }, [viewerMode]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const quality = getGraphicsQuality(reducedMotion);
    const { cubeFloatAmplitude, maxPixelRatio, motionFactor } =
      getSystemConfigurationMotion(reducedMotion);
    let disposed = false;
    let frameId = 0;
    let cleanupScene = () => undefined;

    const setup = async () => {
      try {
        const THREE = await loadThree();
        if (disposed) return;

        const renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: quality.antialias,
          powerPreference: 'high-performance',
        });
        renderer.setPixelRatio(
          Math.min(window.devicePixelRatio, maxPixelRatio, quality.pixelRatioCap),
        );
        renderer.setClearColor(0x120d25, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x171029, 0.034);
        const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 80);
        camera.position.set(0, 0, 20);

        scene.add(new THREE.AmbientLight(0x304f91, 1.9));
        const cyanLight = new THREE.PointLight(0x42ddff, 22, 34, 1.7);
        cyanLight.position.set(-2, 1, 5);
        scene.add(cyanLight);
        const violetLight = new THREE.PointLight(0x9f7cff, 12, 28, 1.8);
        violetLight.position.set(-8, -2, 4);
        scene.add(violetLight);

        const glowCanvas = document.createElement('canvas');
        glowCanvas.width = 128;
        glowCanvas.height = 128;
        const glowContext = glowCanvas.getContext('2d');
        if (glowContext) {
          const gradient = glowContext.createRadialGradient(64, 64, 0, 64, 64, 64);
          gradient.addColorStop(0, 'rgba(255,255,255,1)');
          gradient.addColorStop(0.16, 'rgba(191,244,255,.96)');
          gradient.addColorStop(0.42, 'rgba(48,174,255,.38)');
          gradient.addColorStop(1, 'rgba(32,91,255,0)');
          glowContext.fillStyle = gradient;
          glowContext.fillRect(0, 0, 128, 128);
        }
        const glowTexture = new THREE.CanvasTexture(glowCanvas);

        const radialGroup = new THREE.Group();
        radialGroup.position.set(-1.15, 0.25, -1.4);
        scene.add(radialGroup);

        const rayGeometry = new THREE.BoxGeometry(0.62, 4.9, 0.58);
        const rayMaterial = new THREE.MeshPhysicalMaterial({
          color: 0x164787,
          emissive: 0x0b2e68,
          emissiveIntensity: 0.72,
          roughness: 0.16,
          metalness: 0.24,
          transparent: true,
          opacity: 0.42,
          transmission: 0.28,
          depthWrite: false,
        });
        const rays = Array.from({ length: rayCount }, (_, index) => {
          const angle = (index / rayCount) * Math.PI * 2;
          const ray = new THREE.Mesh(rayGeometry, rayMaterial);
          const radius = 4.25;
          ray.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
          ray.rotation.z = angle - Math.PI / 2;
          ray.rotation.x = Math.sin(index * 1.7) * 0.12;
          radialGroup.add(ray);
          return ray;
        });

        const coreGeometry = new THREE.SphereGeometry(1.45, 18, 12);
        const coreMaterial = new THREE.MeshStandardMaterial({
          color: 0x071b4d,
          emissive: 0x1456d4,
          emissiveIntensity: 0.72,
          wireframe: true,
          transparent: true,
          opacity: 0.58,
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        radialGroup.add(core);

        const coreGlowMaterial = new THREE.SpriteMaterial({
          map: glowTexture,
          color: 0x45dfff,
          transparent: true,
          opacity: 0.7,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const coreGlow = new THREE.Sprite(coreGlowMaterial);
        coreGlow.scale.set(5.4, 5.4, 1);
        radialGroup.add(coreGlow);

        const nodeMaterials = Array.from(
          { length: 4 },
          (_, index) =>
            new THREE.SpriteMaterial({
              map: glowTexture,
              color: index === 0 ? 0xffffff : 0x76dfff,
              transparent: true,
              opacity: 0.94,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
            }),
        );
        const nodes = nodeMaterials.map((material) => {
          const node = new THREE.Sprite(material);
          node.scale.set(0.62, 0.62, 1);
          radialGroup.add(node);
          return node;
        });

        const cubeGeometry = new THREE.BoxGeometry(2.25, 1.55, 1.75);
        const cubes = cubeLayouts.map((layout, index) => {
          const material = new THREE.MeshPhysicalMaterial({
            color: 0x172047,
            emissive: 0x10265b,
            emissiveIntensity: 0.5,
            roughness: 0.08,
            metalness: 0.16,
            transparent: true,
            opacity: 0.2,
            transmission: 0.62,
            thickness: 0.75,
            depthWrite: false,
          });
          const edgeMaterial = new THREE.LineBasicMaterial({
            color: 0x9a8fc4,
            transparent: true,
            opacity: 0.32,
          });
          const mesh = new THREE.Mesh(cubeGeometry, material);
          const edges = new THREE.LineSegments(new THREE.EdgesGeometry(cubeGeometry), edgeMaterial);
          const group = new THREE.Group();
          group.add(mesh, edges);
          group.position.set(layout.x, layout.y, layout.z);
          group.rotation.set(0.24 + index * 0.16, 0.35 + index * 0.28, index * -0.14);
          scene.add(group);
          return { group, material, edgeMaterial, layout, visibility: 1, selection: 0 };
        });

        const resize = () => {
          const width = Math.max(root.clientWidth, 1);
          const height = Math.max(root.clientHeight, 1);
          compact = width <= 736;
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.position.z = compact ? 24 : 20;
          radialGroup.position.x = compact ? 0 : -1.15;
          radialGroup.position.y = compact ? 1.7 : 0.25;
          radialGroup.scale.setScalar(compact ? 0.76 : 1);
          camera.updateProjectionMatrix();
        };

        const resizeObserver = new ResizeObserver(resize);
        let compact = root.clientWidth <= 736;
        resizeObserver.observe(root);
        resize();

        let startTime = performance.now();
        let previousTime = startTime;
        let previousRenderTime = 0;
        const render = (now: number) => {
          if (disposed) return;
          if (!shouldRenderFrame(now, previousRenderTime, quality.frameInterval)) {
            frameId = window.requestAnimationFrame(render);
            return;
          }
          previousRenderTime = now;
          const delta = Math.min((now - previousTime) / 1000, 0.05);
          previousTime = now;
          const elapsed = ((now - startTime) / 1000) * motionFactor;
          const viewer = viewerModeRef.current;
          const selected = selectedIndexRef.current;

          radialGroup.rotation.z = elapsed * 0.115;
          radialGroup.rotation.x = Math.sin(elapsed * 0.18) * 0.08;
          core.rotation.y = elapsed * 0.44;
          core.rotation.x = elapsed * 0.27;
          coreGlow.material.opacity = 0.58 + Math.sin(elapsed * 1.4) * 0.1;
          coreGlow.scale.setScalar(5.2 + Math.sin(elapsed * 1.1) * 0.35);

          rays.forEach((ray, index) => {
            const pulse = 0.9 + Math.sin(elapsed * 0.72 + index * 0.72) * 0.13;
            ray.scale.y += (pulse - ray.scale.y) * Math.min(1, delta * 2.8);
          });

          nodes.forEach((node, index) => {
            const angle = elapsed * (0.54 + index * 0.07) + index * 1.63;
            const radiusX = 1.65 + index * 0.22;
            const radiusY = 1.1 + index * 0.13;
            node.position.set(Math.cos(angle) * radiusX, Math.sin(angle * 1.28) * radiusY, 1.1);
            node.scale.setScalar(0.5 + Math.sin(elapsed * 1.8 + index) * 0.1);
          });

          cubes.forEach((cube, index) => {
            const selectedTarget = !viewer && selected === index ? 1 : 0;
            const visibleTarget = viewer ? 0 : 1;
            cube.selection += (selectedTarget - cube.selection) * Math.min(1, delta * 7);
            cube.visibility += (visibleTarget - cube.visibility) * Math.min(1, delta * 5);

            const floatY = Math.sin(elapsed * 0.74 + cube.layout.phase) * cubeFloatAmplitude;
            const compactX = [-2.85, 2.9, -3, 3.05][index] ?? cube.layout.x;
            const compactY = [4.35, 3.25, 1.35, 0.25][index] ?? cube.layout.y;
            cube.group.position.x = compact ? compactX : cube.layout.x;
            cube.group.position.y = (compact ? compactY : cube.layout.y) + floatY;
            cube.group.rotation.x += delta * motionFactor * (0.14 + index * 0.012);
            cube.group.rotation.y += delta * motionFactor * (0.22 + index * 0.016);
            cube.group.scale.setScalar(cube.visibility * (1 + cube.selection * 0.18));
            cube.group.visible = cube.visibility > 0.01;
            cube.material.opacity = cube.visibility * (0.17 + cube.selection * 0.38);
            cube.material.emissiveIntensity = 0.42 + cube.selection * 1.4;
            cube.material.color.setHex(cube.selection > 0.5 ? 0x168fbc : 0x171d43);
            cube.material.emissive.setHex(cube.selection > 0.5 ? 0x1cbce8 : 0x10265b);
            cube.edgeMaterial.opacity = cube.visibility * (0.28 + cube.selection * 0.65);
            cube.edgeMaterial.color.setHex(cube.selection > 0.5 ? 0xbdf7ff : 0x9487bb);
          });

          renderer.render(scene, camera);
          frameId = window.requestAnimationFrame(render);
        };

        const start = () => {
          if (frameId !== 0 || disposed) return;
          startTime = performance.now();
          previousTime = startTime;
          frameId = window.requestAnimationFrame(render);
        };
        const stop = () => {
          if (frameId === 0) return;
          window.cancelAnimationFrame(frameId);
          frameId = 0;
        };
        const handleVisibility = () => {
          if (document.hidden) stop();
          else start();
        };
        document.addEventListener('visibilitychange', handleVisibility);

        cleanupScene = () => {
          stop();
          resizeObserver.disconnect();
          document.removeEventListener('visibilitychange', handleVisibility);
          cubes.forEach(({ material, edgeMaterial, group }) => {
            material.dispose();
            edgeMaterial.dispose();
            group.traverse((child) => {
              if (child instanceof THREE.LineSegments) child.geometry.dispose();
            });
          });
          cubeGeometry.dispose();
          rayGeometry.dispose();
          rayMaterial.dispose();
          coreGeometry.dispose();
          coreMaterial.dispose();
          coreGlowMaterial.dispose();
          nodeMaterials.forEach((material) => material.dispose());
          glowTexture.dispose();
          renderer.dispose();
        };

        setSceneState('true');
        start();
      } catch {
        if (!disposed) setSceneState('fallback');
      }
    };

    void setup();
    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      cleanupScene();
    };
  }, []);

  return (
    <div
      className="system-scene"
      data-system-scene
      data-scene-ready={sceneState}
      data-selected-index={selectedIndex}
      data-viewer-mode={viewerMode ? 'true' : 'false'}
      data-cube-count={cubeLayouts.length}
      aria-hidden="true"
      ref={rootRef}
    >
      <canvas className="system-scene-canvas" ref={canvasRef} />
      <div className="system-scene-fallback">
        <div className="fallback-radial">
          {Array.from({ length: rayCount }, (_, index) => (
            <span key={index} style={{ '--ray-index': index } as React.CSSProperties} />
          ))}
          <i />
        </div>
        <div className="fallback-cubes">
          {cubeLayouts.map((_, index) => (
            <span className={selectedIndex === index ? 'is-selected' : ''} key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
