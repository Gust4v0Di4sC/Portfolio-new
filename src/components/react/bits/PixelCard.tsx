import { type CSSProperties, type ReactNode, useEffect, useRef } from 'react';

import './PixelCard.css';

type AnimationName = 'appear' | 'disappear';
type VariantName = 'default' | 'blue' | 'yellow' | 'pink';

type PixelCardProps = {
  variant?: VariantName;
  gap?: number;
  speed?: number;
  colors?: string;
  noFocus?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

type PixelCardStyle = CSSProperties & {
  '--pixel-card-active-color'?: string;
};

const variants = {
  default: {
    activeColor: '#09090b',
    gap: 5,
    speed: 35,
    colors: '#f8fafc,#f1f5f9,#cbd5e1',
    noFocus: false,
  },
  blue: {
    activeColor: '#082f49',
    gap: 9,
    speed: 34,
    colors: '#e0f2fe,#67e8f9,#22d3ee,#0284c7',
    noFocus: false,
  },
  yellow: {
    activeColor: '#422006',
    gap: 3,
    speed: 20,
    colors: '#fef08a,#fde047,#eab308',
    noFocus: false,
  },
  pink: {
    activeColor: '#4c0519',
    gap: 6,
    speed: 80,
    colors: '#fecdd3,#fda4af,#e11d48',
    noFocus: true,
  },
} satisfies Record<
  VariantName,
  { activeColor: string; gap: number; speed: number; colors: string; noFocus: boolean }
>;

class Pixel {
  private readonly context: CanvasRenderingContext2D;
  private readonly x: number;
  private readonly y: number;
  private readonly color: string;
  private readonly speed: number;
  private readonly sizeStep: number;
  private readonly minSize = 0.5;
  private readonly maxSizeInteger = 2;
  private readonly maxSize: number;
  private readonly delay: number;
  private readonly counterStep: number;
  private counter = 0;
  private size = 0;
  private isReverse = false;
  private isShimmer = false;
  isIdle = false;

  constructor(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    speed: number,
    delay: number,
  ) {
    this.context = context;
    this.x = x;
    this.y = y;
    this.color = color;
    this.speed = this.randomBetween(0.1, 0.9) * speed;
    this.sizeStep = Math.random() * 0.4;
    this.maxSize = this.randomBetween(this.minSize, this.maxSizeInteger);
    this.delay = delay;
    this.counterStep = Math.random() * 4 + (canvas.width + canvas.height) * 0.01;
  }

  private randomBetween(minimum: number, maximum: number) {
    return Math.random() * (maximum - minimum) + minimum;
  }

  private draw() {
    const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5;
    this.context.fillStyle = this.color;
    this.context.fillRect(this.x + centerOffset, this.y + centerOffset, this.size, this.size);
  }

  private shimmer() {
    if (this.size >= this.maxSize) {
      this.isReverse = true;
    } else if (this.size <= this.minSize) {
      this.isReverse = false;
    }

    this.size += this.isReverse ? -this.speed : this.speed;
  }

  appear() {
    this.isIdle = false;

    if (this.counter <= this.delay) {
      this.counter += this.counterStep;
      return;
    }

    if (this.size >= this.maxSize) {
      this.isShimmer = true;
    }

    if (this.isShimmer) {
      this.shimmer();
    } else {
      this.size += this.sizeStep;
    }

    this.draw();
  }

  disappear() {
    this.isShimmer = false;
    this.counter = 0;

    if (this.size <= 0) {
      this.size = 0;
      this.isIdle = true;
      return;
    }

    this.size -= 0.1;
    this.draw();
  }
}

function getEffectiveSpeed(value: number) {
  return Math.max(0, Math.min(value, 100)) * 0.001;
}

export default function PixelCard({
  variant = 'default',
  gap,
  speed,
  colors,
  noFocus,
  className = '',
  style,
  children,
}: PixelCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startAnimationRef = useRef<(name: AnimationName) => void>(() => undefined);
  const variantConfig = variants[variant];
  const finalGap = Math.max(2, gap ?? variantConfig.gap);
  const finalSpeed = speed ?? variantConfig.speed;
  const finalColors = colors ?? variantConfig.colors;
  const finalNoFocus = noFocus ?? variantConfig.noFocus;
  const cardStyle: PixelCardStyle = {
    '--pixel-card-active-color': variantConfig.activeColor,
    ...style,
  };

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;

    if (!container || !canvas) {
      return undefined;
    }

    const context = canvas.getContext('2d');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!context || reducedMotion) {
      return undefined;
    }

    let pixels: Pixel[] = [];
    let animationFrame = 0;
    let previousTime = performance.now();

    const initializePixels = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      const palette = finalColors.split(',').map((color) => color.trim());
      const effectiveSpeed = getEffectiveSpeed(finalSpeed);

      canvas.width = width;
      canvas.height = height;
      pixels = [];

      for (let x = 0; x < width; x += finalGap) {
        for (let y = 0; y < height; y += finalGap) {
          const color = palette[Math.floor(Math.random() * palette.length)] ?? '#67e8f9';
          const deltaX = x - width / 2;
          const deltaY = y - height / 2;
          const delay = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

          pixels.push(new Pixel(canvas, context, x, y, color, effectiveSpeed, delay));
        }
      }
    };

    const animate = (name: AnimationName, now: number) => {
      animationFrame = window.requestAnimationFrame((nextTime) => animate(name, nextTime));
      const elapsed = now - previousTime;
      const interval = 1000 / 60;

      if (elapsed < interval) {
        return;
      }

      previousTime = now - (elapsed % interval);
      context.clearRect(0, 0, canvas.width, canvas.height);
      let allIdle = true;

      pixels.forEach((pixel) => {
        pixel[name]();

        if (!pixel.isIdle) {
          allIdle = false;
        }
      });

      if (allIdle) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    };

    startAnimationRef.current = (name) => {
      window.cancelAnimationFrame(animationFrame);
      previousTime = performance.now();
      animationFrame = window.requestAnimationFrame((now) => animate(name, now));
    };

    initializePixels();
    const observer = new ResizeObserver(initializePixels);
    observer.observe(container);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(animationFrame);
      startAnimationRef.current = () => undefined;
    };
  }, [finalColors, finalGap, finalSpeed]);

  return (
    <div
      ref={containerRef}
      className={`pixel-card ${className}`.trim()}
      style={cardStyle}
      onMouseEnter={() => startAnimationRef.current('appear')}
      onMouseLeave={() => startAnimationRef.current('disappear')}
      onFocus={(event) => {
        if (!finalNoFocus && !event.currentTarget.contains(event.relatedTarget)) {
          startAnimationRef.current('appear');
        }
      }}
      onBlur={(event) => {
        if (!finalNoFocus && !event.currentTarget.contains(event.relatedTarget)) {
          startAnimationRef.current('disappear');
        }
      }}
      tabIndex={finalNoFocus ? -1 : 0}
    >
      <canvas className="pixel-canvas" ref={canvasRef} aria-hidden="true" />
      <div className="pixel-card-content">{children}</div>
    </div>
  );
}
