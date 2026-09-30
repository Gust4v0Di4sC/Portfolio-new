import * as THREE from './splashThreeRuntime';
import { orbitalLightConfigs } from '../visual/orbitalLights';

type InitMessage = {
  type: 'init';
  canvas: OffscreenCanvas;
  width: number;
  height: number;
  pixelRatio: number;
  reducedMotion: boolean;
  starCount: number;
  cubeCount: number;
  introDelay: number;
  motionFactor: number;
  sceneTimeOffset: number;
  frameInterval: number;
  antialias: boolean;
};

type ResizeMessage = { type: 'resize'; width: number; height: number; pixelRatio: number };
type ProgressMessage = { type: 'progress'; progress: number; backdropOpacity: number };
type ControlMessage = { type: 'pause' | 'resume' | 'dispose' };
type SplashWorkerMessage = InitMessage | ResizeMessage | ProgressMessage | ControlMessage;

type SplashBlock = {
  group: THREE.Group;
  targetY: number;
  height: number;
  speed: number;
  sway: number;
  originX: number;
  originZ: number;
  driftX: number;
  driftY: number;
  driftZ: number;
};

type WorkerScope = {
  onmessage: ((event: MessageEvent<SplashWorkerMessage>) => void) | null;
  close: () => void;
};

const workerScope = self as unknown as WorkerScope;

let cleanupScene = () => undefined;
let resizeScene = (_width: number, _height: number, _pixelRatio: number) => undefined;
let updateProgress = (_progress: number, _backdropOpacity: number) => undefined;
let pauseScene = () => undefined;
let resumeScene = () => undefined;

function mountScene(message: InitMessage) {
  const {
    canvas,
    width,
    height,
    pixelRatio,
    reducedMotion,
    starCount,
    cubeCount,
    introDelay,
    motionFactor,
    sceneTimeOffset,
    frameInterval,
    antialias,
  } = message;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x02060d, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x030713, 0.018);
  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 180);
  const target = new THREE.Vector3(0, 2, 0);
  const blocks: SplashBlock[] = [];
  let transitionProgress = 0;
  let backdropOpacity = 1;
  let renderTimer: ReturnType<typeof setTimeout> | undefined;
  let paused = false;
  let disposed = false;
  let startTime = performance.now();

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

  const glowCanvas = new OffscreenCanvas(128, 128);
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
  const clouds = cloudLayouts.map(([x, y, z, cloudWidth, cloudHeight, opacity], index) => {
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
    sprite.scale.set(cloudWidth, cloudHeight, 1);
    scene.add(sprite);
    return { sprite, material, x, y, phase: index * 1.17, opacity };
  });

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
    blockWidth: number,
    depth: number,
    blockHeight: number,
    targetY: number,
    order: number,
  ) => {
    const geometry = new THREE.BoxGeometry(blockWidth, blockHeight, depth);
    const lit = order % 4 === 0 || Math.random() > 0.74;
    const mesh = new THREE.Mesh(geometry, blockMaterials[lit ? 1 : 0]);
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry),
      edgeMaterials[lit ? 1 : 0],
    );
    const group = new THREE.Group();
    group.add(mesh, edges);
    group.position.set(x, targetY, z);
    group.rotation.set(Math.random() * 0.5, Math.random() * 0.8, Math.random() * 0.4);
    scene.add(group);
    const radius = Math.hypot(x, z) || 1;
    const spread = 10 + Math.random() * 22;
    blocks.push({
      group,
      targetY,
      height: blockHeight,
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
    createBlock(cube.x, cube.z, cube.width, cube.depth, cube.height, cube.y, index);
  });

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

  resizeScene = (nextWidth, nextHeight, nextPixelRatio) => {
    renderer.setPixelRatio(nextPixelRatio);
    renderer.setSize(Math.max(1, nextWidth), Math.max(1, nextHeight), false);
    camera.aspect = Math.max(1, nextWidth) / Math.max(1, nextHeight);
    camera.updateProjectionMatrix();
  };
  updateProgress = (progress, nextBackdropOpacity) => {
    transitionProgress = progress;
    backdropOpacity = nextBackdropOpacity;
  };

  const updateBlocks = (elapsed: number) => {
    blocks.forEach((block) => {
      const floatY = Math.sin(elapsed * 0.34 + block.sway) * 0.72;
      block.group.position.set(
        block.originX +
          Math.cos(elapsed * 0.12 + block.sway) * 0.42 +
          block.driftX * transitionProgress,
        block.targetY + floatY + block.driftY * transitionProgress,
        block.originZ +
          Math.sin(elapsed * 0.11 + block.sway) * 0.5 +
          block.driftZ * transitionProgress,
      );
      block.group.scale.setScalar(1 + transitionProgress * 0.3);
      block.group.rotation.set(
        elapsed * (0.035 + block.speed * 0.008) + Math.sin(block.sway) * transitionProgress * 0.7,
        elapsed * (0.052 + block.speed * 0.01) + transitionProgress * block.sway * 0.22,
        elapsed * 0.024 + Math.cos(block.sway) * transitionProgress * 0.55,
      );
    });
  };

  const render = () => {
    renderTimer = undefined;
    if (disposed || paused) return;
    const now = performance.now();
    const motionElapsed = Math.max(0, (now - startTime - introDelay) / 1000);
    const sceneElapsed = sceneTimeOffset + motionElapsed * motionFactor;
    updateBlocks(sceneElapsed);
    stars.rotation.y = sceneElapsed * 0.014 * motionFactor + transitionProgress * 0.42;
    stars.position.y = -transitionProgress * 9;
    stars.scale.setScalar(1 + transitionProgress * 0.38);
    clouds.forEach((cloud) => {
      cloud.sprite.position.x = cloud.x + Math.sin(sceneElapsed * 0.09 + cloud.phase) * 1.6;
      cloud.sprite.position.y = cloud.y + Math.cos(sceneElapsed * 0.08 + cloud.phase) * 0.8;
      cloud.material.opacity =
        cloud.opacity *
        backdropOpacity *
        (0.82 + Math.sin(sceneElapsed * 0.22 + cloud.phase) * 0.18);
    });
    const orbitTime = now / 1000;
    orbiters.forEach(({ config, sprite, light, positions, positionAttribute, trailMaterial }) => {
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
      sprite.scale.setScalar(config.size * (1.45 + Math.sin(orbitTime * 2 + config.phase) * 0.16));
      trailMaterial.opacity = 0.42 * config.brightness * backdropOpacity;
    });
    camera.position.set(
      Math.sin(sceneElapsed * 0.08) * 1.6 + Math.sin(transitionProgress * Math.PI) * 4,
      THREE.MathUtils.lerp(17, 9, transitionProgress),
      THREE.MathUtils.lerp(39, 8, transitionProgress),
    );
    camera.fov = THREE.MathUtils.lerp(52, 70, transitionProgress);
    camera.updateProjectionMatrix();
    target.set(
      Math.sin(sceneElapsed * 0.1) * 0.9 + transitionProgress * 2,
      THREE.MathUtils.lerp(4, 2.5, transitionProgress),
      0,
    );
    camera.lookAt(target);
    renderer.render(scene, camera);
    renderTimer = setTimeout(render, frameInterval || 1000 / 60);
  };

  pauseScene = () => {
    paused = true;
    if (renderTimer !== undefined) clearTimeout(renderTimer);
    renderTimer = undefined;
  };
  resumeScene = () => {
    if (disposed || !paused) return;
    paused = false;
    startTime =
      performance.now() - Math.max(0, sceneTimeOffset / Math.max(motionFactor, 0.01)) * 1000;
    render();
  };
  cleanupScene = () => {
    if (disposed) return;
    disposed = true;
    pauseScene();
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
        if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments)
          child.geometry.dispose();
      });
    });
  };

  resizeScene(width, height, pixelRatio);
  void renderer.compileAsync(scene, camera).catch(() => undefined);
  render();
}

workerScope.onmessage = ({ data }) => {
  if (data.type === 'init') mountScene(data);
  else if (data.type === 'resize') resizeScene(data.width, data.height, data.pixelRatio);
  else if (data.type === 'progress') updateProgress(data.progress, data.backdropOpacity);
  else if (data.type === 'pause') pauseScene();
  else if (data.type === 'resume') resumeScene();
  else if (data.type === 'dispose') {
    cleanupScene();
    workerScope.close();
  }
};
