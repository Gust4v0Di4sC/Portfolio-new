import { useEffect, useRef } from 'react';
import { Camera, Geometry, Mesh, Program, Renderer } from 'ogl';

import './Particles.css';

type ParticlesProps = {
  particleCount?: number;
  particleSpread?: number;
  speed?: number;
  particleColors?: string[];
  moveParticlesOnHover?: boolean;
  particleHoverFactor?: number;
  alphaParticles?: boolean;
  particleBaseSize?: number;
  sizeRandomness?: number;
  cameraDistance?: number;
  disableRotation?: boolean;
  pixelRatio?: number;
  className?: string;
};

const defaultColors = ['#ffffff', '#ffffff', '#ffffff'];

const vertex = /* glsl */ `
  attribute vec3 position;
  attribute vec4 random;
  attribute vec3 color;

  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uSpread;
  uniform float uBaseSize;
  uniform float uSizeRandomness;

  varying vec4 vRandom;
  varying vec3 vColor;

  void main() {
    vRandom = random;
    vColor = color;

    vec3 pos = position * uSpread;
    pos.z *= 10.0;

    vec4 mPos = modelMatrix * vec4(pos, 1.0);
    float t = uTime;
    mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
    mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
    mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);

    vec4 mvPos = viewMatrix * mPos;
    gl_PointSize = uSizeRandomness == 0.0
      ? uBaseSize
      : (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const fragment = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uAlphaParticles;
  varying vec4 vRandom;
  varying vec3 vColor;

  void main() {
    vec2 uv = gl_PointCoord.xy;
    float distanceFromCenter = length(uv - vec2(0.5));

    if (uAlphaParticles < 0.5) {
      if (distanceFromCenter > 0.5) discard;
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), 1.0);
    } else {
      float circle = smoothstep(0.5, 0.34, distanceFromCenter) * 0.78;
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), circle);
    }
  }
`;

function hexToRgb(hexColor: string): [number, number, number] {
  let hex = hexColor.replace(/^#/, '');

  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((character) => character + character)
      .join('');
  }

  const value = Number.parseInt(hex.slice(0, 6), 16);

  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

export default function Particles({
  particleCount = 200,
  particleSpread = 10,
  speed = 0.1,
  particleColors = defaultColors,
  moveParticlesOnHover = false,
  particleHoverFactor = 1,
  alphaParticles = false,
  particleBaseSize = 100,
  sizeRandomness = 1,
  cameraDistance = 20,
  disableRotation = false,
  pixelRatio = 1,
  className = '',
}: ParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const paletteKey = particleColors.join(',');

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const renderer = new Renderer({
      dpr: Math.min(pixelRatio, 2),
      depth: false,
      alpha: true,
      antialias: true,
    });
    const gl = renderer.gl;
    const canvas = gl.canvas;
    const camera = new Camera(gl, { fov: 15 });
    const mouse = { x: 0, y: 0 };
    const palette = paletteKey.length > 0 ? paletteKey.split(',') : defaultColors;
    const positions = new Float32Array(particleCount * 3);
    const randoms = new Float32Array(particleCount * 4);
    const colors = new Float32Array(particleCount * 3);
    let animationFrame = 0;
    let previousTime = performance.now();
    let elapsed = 0;
    let isVisible = true;

    container.appendChild(canvas);
    gl.clearColor(0, 0, 0, 0);
    camera.position.set(0, 0, cameraDistance);

    for (let index = 0; index < particleCount; index += 1) {
      let x: number;
      let y: number;
      let z: number;
      let length: number;

      do {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        z = Math.random() * 2 - 1;
        length = x * x + y * y + z * z;
      } while (length > 1 || length === 0);

      const radius = Math.cbrt(Math.random());
      const color = hexToRgb(palette[Math.floor(Math.random() * palette.length)] ?? '#ffffff');
      positions.set([x * radius, y * radius, z * radius], index * 3);
      randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], index * 4);
      colors.set(color, index * 3);
    }

    const geometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      random: { size: 4, data: randoms },
      color: { size: 3, data: colors },
    });
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uSpread: { value: particleSpread },
        uBaseSize: { value: particleBaseSize * Math.min(pixelRatio, 2) },
        uSizeRandomness: { value: sizeRandomness },
        uAlphaParticles: { value: alphaParticles ? 1 : 0 },
      },
      transparent: true,
      depthTest: false,
    });
    const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program });

    const resize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      renderer.setSize(width, height);
      camera.perspective({ aspect: width / height });
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    };

    const update = (now: number) => {
      if (!isVisible || document.hidden) {
        animationFrame = 0;
        return;
      }

      const delta = Math.min(now - previousTime, 64);
      previousTime = now;
      elapsed += delta * speed * (reducedMotion ? 0.25 : 1);
      program.uniforms.uTime.value = elapsed * 0.001;

      particles.position.x = moveParticlesOnHover ? -mouse.x * particleHoverFactor : 0;
      particles.position.y = moveParticlesOnHover ? -mouse.y * particleHoverFactor : 0;

      if (!disableRotation) {
        particles.rotation.x = Math.sin(elapsed * 0.0002) * 0.1;
        particles.rotation.y = Math.cos(elapsed * 0.0005) * 0.15;
        particles.rotation.z += 0.01 * speed * (reducedMotion ? 0.25 : 1);
      }

      renderer.render({ scene: particles, camera });
      animationFrame = window.requestAnimationFrame(update);
    };

    const start = () => {
      if (animationFrame === 0 && isVisible && !document.hidden) {
        previousTime = performance.now();
        animationFrame = window.requestAnimationFrame(update);
      }
    };

    const stop = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };

    const resizeObserver = new ResizeObserver(resize);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry?.isIntersecting ?? false;
      if (isVisible) start();
      else stop();
    });
    const handleVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };

    resize();
    resizeObserver.observe(container);
    visibilityObserver.observe(container);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    if (moveParticlesOnHover) container.addEventListener('mousemove', handleMouseMove);
    start();

    return () => {
      stop();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (moveParticlesOnHover) container.removeEventListener('mousemove', handleMouseMove);
      geometry.remove();
      program.remove();
      canvas.remove();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [
    alphaParticles,
    cameraDistance,
    disableRotation,
    moveParticlesOnHover,
    paletteKey,
    particleBaseSize,
    particleCount,
    particleHoverFactor,
    particleSpread,
    pixelRatio,
    sizeRandomness,
    speed,
  ]);

  return (
    <div
      ref={containerRef}
      className={`particles-container ${className}`.trim()}
      aria-hidden="true"
    />
  );
}
