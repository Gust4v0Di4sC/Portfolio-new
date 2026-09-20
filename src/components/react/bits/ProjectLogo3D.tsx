import { useEffect, useRef, useState } from 'react';
import {
  ACESFilmicToneMapping,
  Box3,
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  MathUtils,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const ROTATION_SPEED = 0.85;

type ProjectLogo3DProps = {
  modelSrc: string;
  videoSrc: string;
  label: string;
};

export default function ProjectLogo3D({ modelSrc, videoSrc, label }: ProjectLogo3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [modelReady, setModelReady] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch {
      return undefined;
    }

    const scene = new Scene();
    const rotationRoot = new Group();
    const camera = new PerspectiveCamera(32, 1, 0.01, 100);
    let frameId = 0;
    let isVisible = true;
    let isDisposed = false;
    let model: Awaited<ReturnType<GLTFLoader['loadAsync']>>['scene'] | undefined;

    renderer.setClearColor(new Color(0x000000), 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    mount.appendChild(renderer.domElement);
    scene.add(rotationRoot);

    scene.add(new HemisphereLight(0xdffaff, 0x10162f, 2.4));
    const keyLight = new DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    const render = () => renderer.render(scene, camera);
    const resize = () => {
      const width = Math.max(mount.clientWidth, 1);
      const height = Math.max(mount.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      render();
    };

    const animate = (time: number) => {
      frameId = 0;
      if (isDisposed || !isVisible) return;

      if (model) rotationRoot.rotation.y = (time * 0.001 * ROTATION_SPEED) % (Math.PI * 2);
      render();
      frameId = window.requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry?.isIntersecting ?? false;
      if (isVisible && frameId === 0) {
        frameId = window.requestAnimationFrame(animate);
      } else if (!isVisible && frameId !== 0) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
    });
    visibilityObserver.observe(mount);

    const loader = new GLTFLoader();
    loader.load(
      modelSrc,
      (gltf) => {
        if (isDisposed) return;

        model = gltf.scene;
        const bounds = new Box3().setFromObject(model);
        const center = bounds.getCenter(new Vector3());
        const size = bounds.getSize(new Vector3());
        const maxDimension = Math.max(size.x, size.y, size.z, 0.01);
        const distance = maxDimension / (2 * Math.tan(MathUtils.degToRad(camera.fov / 2)));

        model.position.sub(center);
        rotationRoot.add(model);
        camera.position.set(0, 0, distance * 1.35);
        camera.near = Math.max(distance / 100, 0.001);
        camera.far = distance * 100;
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();

        render();
        setModelReady(true);
        if (frameId === 0) frameId = window.requestAnimationFrame(animate);
      },
      undefined,
      () => setModelReady(false),
    );

    return () => {
      isDisposed = true;
      if (frameId !== 0) window.cancelAnimationFrame(frameId);
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
      scene.traverse((object) => {
        if (!('geometry' in object)) return;
        const mesh = object as import('three').Mesh;
        mesh.geometry?.dispose();
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const material of materials) material?.dispose();
      });
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [modelSrc]);

  return (
    <div className="project-logo" role="img" aria-label={label}>
      <video
        className={`project-logo-fallback${modelReady ? ' is-hidden' : ''}`}
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
      />
      <div ref={mountRef} className="project-logo-canvas" aria-hidden="true" />
    </div>
  );
}
