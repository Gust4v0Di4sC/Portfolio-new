export type GraphicsQuality = {
  antialias: boolean;
  densityFactor: number;
  frameInterval: number;
  pixelRatioCap: number;
};

type NavigatorWithDeviceMemory = Navigator & { deviceMemory?: number };

export function getGraphicsQuality(reducedMotion = false): GraphicsQuality {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { antialias: true, densityFactor: 1, frameInterval: 0, pixelRatioCap: 2 };
  }

  const cores = navigator.hardwareConcurrency || 8;
  const memory = (navigator as NavigatorWithDeviceMemory).deviceMemory ?? 8;
  const compactViewport = Math.min(window.innerWidth, window.innerHeight) <= 480;
  const constrained = cores <= 4 || memory <= 4 || compactViewport;
  const balanced = cores <= 8 || memory <= 8 || window.devicePixelRatio > 2;

  if (reducedMotion) {
    return { antialias: false, densityFactor: 0.55, frameInterval: 1000 / 30, pixelRatioCap: 1 };
  }

  if (constrained) {
    return { antialias: false, densityFactor: 0.65, frameInterval: 1000 / 24, pixelRatioCap: 1 };
  }

  if (balanced) {
    return { antialias: true, densityFactor: 0.88, frameInterval: 0, pixelRatioCap: 1.5 };
  }

  return { antialias: true, densityFactor: 1, frameInterval: 0, pixelRatioCap: 2 };
}

export function shouldRenderFrame(now: number, previousRender: number, frameInterval: number) {
  return frameInterval === 0 || now - previousRender >= frameInterval;
}
