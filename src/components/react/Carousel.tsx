import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';

import './Carousel.css';

export type CarouselItemData = {
  title: string;
  description: string;
  id: number;
  icon: ReactNode;
  category?: string;
  year?: string;
  stack?: string[];
  href?: string;
};

type CarouselProps = {
  items: CarouselItemData[];
  baseWidth?: number;
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
  round?: boolean;
};

type CarouselItemProps = {
  item: CarouselItemData;
  index: number;
  itemWidth: number;
  round: boolean;
  trackItemOffset: number;
  x: ReturnType<typeof useMotionValue<number>>;
  transition: typeof SPRING_OPTIONS | { duration: number };
};

const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const CONTAINER_PADDING = 16;
const SPRING_OPTIONS = { type: 'spring' as const, stiffness: 300, damping: 30 };

function CarouselItem({
  item,
  index,
  itemWidth,
  round,
  trackItemOffset,
  x,
  transition,
}: CarouselItemProps) {
  const range = [
    -(index + 1) * trackItemOffset,
    -index * trackItemOffset,
    -(index - 1) * trackItemOffset,
  ];
  const rotateY = useTransform(x, range, [90, 0, -90], { clamp: false });

  return (
    <motion.article
      className={`carousel-item${round ? ' round' : ''}`}
      style={{
        width: itemWidth,
        height: round ? itemWidth : '100%',
        rotateY,
        ...(round && { borderRadius: '50%' }),
      }}
      transition={transition}
    >
      <header className={`carousel-item-header${round ? ' round' : ''}`}>
        <span className="carousel-icon-container" aria-hidden="true">
          {item.icon}
        </span>
        {(item.category || item.year) && (
          <span className="carousel-item-meta">
            {[item.category, item.year].filter(Boolean).join(' / ')}
          </span>
        )}
      </header>

      <div className="carousel-item-content">
        <h3 className="carousel-item-title">{item.title}</h3>
        <p className="carousel-item-description">{item.description}</p>
        {item.stack && <p className="carousel-item-stack">{item.stack.join(' + ')}</p>}
        {item.href && (
          <a
            className="carousel-item-link ps-control ps-control-cross"
            href={item.href}
            data-sound="confirm"
          >
            <span className="ps-symbol" aria-hidden="true">
              ×
            </span>
            <span>Abrir projeto</span>
          </a>
        )}
      </div>
    </motion.article>
  );
}

export default function Carousel({
  items,
  baseWidth = 560,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  loop = false,
  round = false,
}: CarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [carouselWidth, setCarouselWidth] = useState(baseWidth);
  const itemWidth = Math.max(carouselWidth - CONTAINER_PADDING * 2, 1);
  const trackItemOffset = itemWidth + GAP;
  const itemsForRender = useMemo(() => {
    if (!loop || items.length === 0) return items;
    return [items[items.length - 1]!, ...items, items[0]!];
  }, [items, loop]);

  const [position, setPosition] = useState(loop && items.length > 0 ? 1 : 0);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const updateWidth = () => setCarouselWidth(Math.min(baseWidth, container.clientWidth));
    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [baseWidth]);

  useEffect(() => {
    if (!autoplay || itemsForRender.length <= 1 || (pauseOnHover && isHovered)) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setPosition((previous) => Math.min(previous + 1, itemsForRender.length - 1));
    }, autoplayDelay);

    return () => window.clearInterval(timer);
  }, [autoplay, autoplayDelay, isHovered, pauseOnHover, itemsForRender.length]);

  const effectiveTransition = isJumping ? { duration: 0 } : SPRING_OPTIONS;
  const dragProps = loop
    ? {}
    : {
        dragConstraints: {
          left: -trackItemOffset * Math.max(itemsForRender.length - 1, 0),
          right: 0,
        },
      };

  const handleAnimationComplete = () => {
    if (!loop || itemsForRender.length <= 1) {
      setIsAnimating(false);
      return;
    }

    const lastCloneIndex = itemsForRender.length - 1;
    let target: number | undefined;

    if (position === lastCloneIndex) target = 1;
    if (position === 0) target = items.length;

    if (target !== undefined) {
      setIsJumping(true);
      setPosition(target);
      x.set(-target * trackItemOffset);
      requestAnimationFrame(() => {
        setIsJumping(false);
        setIsAnimating(false);
      });
      return;
    }

    setIsAnimating(false);
  };

  const activeIndex =
    items.length === 0
      ? 0
      : loop
        ? (position - 1 + items.length) % items.length
        : Math.min(position, items.length - 1);

  return (
    <div
      ref={containerRef}
      className={`carousel-container${round ? ' round' : ''}`}
      style={{
        width: `min(100%, ${baseWidth}px)`,
        ...(round && { height: `${carouselWidth}px`, borderRadius: '50%' }),
      }}
      onMouseEnter={() => pauseOnHover && setIsHovered(true)}
      onMouseLeave={() => pauseOnHover && setIsHovered(false)}
      role="region"
      aria-roledescription="carrossel"
      aria-label="Projetos em destaque"
    >
      <motion.div
        className="carousel-track"
        drag={isAnimating ? false : 'x'}
        {...dragProps}
        dragElastic={0.12}
        style={{
          width: itemWidth,
          gap: GAP,
          perspective: 1000,
          perspectiveOrigin: `${position * trackItemOffset + itemWidth / 2}px 50%`,
          x,
        }}
        onDragEnd={(_, info) => {
          const direction =
            info.offset.x < -DRAG_BUFFER || info.velocity.x < -VELOCITY_THRESHOLD
              ? 1
              : info.offset.x > DRAG_BUFFER || info.velocity.x > VELOCITY_THRESHOLD
                ? -1
                : 0;

          if (direction !== 0) {
            setPosition((previous) =>
              Math.max(0, Math.min(previous + direction, itemsForRender.length - 1)),
            );
          }
        }}
        animate={{ x: -(position * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationStart={() => setIsAnimating(true)}
        onAnimationComplete={handleAnimationComplete}
      >
        {itemsForRender.map((item, index) => (
          <CarouselItem
            key={`${item.id}-${index}`}
            item={item}
            index={index}
            itemWidth={itemWidth}
            round={round}
            trackItemOffset={trackItemOffset}
            x={x}
            transition={effectiveTransition}
          />
        ))}
      </motion.div>

      <div className={`carousel-indicators-container${round ? ' round' : ''}`}>
        <div className="carousel-indicators">
          {items.map((item, index) => (
            <motion.button
              type="button"
              key={item.id}
              className={`carousel-indicator ${activeIndex === index ? 'active' : 'inactive'}`}
              aria-label={`Ir para o projeto ${index + 1}: ${item.title}`}
              aria-current={activeIndex === index ? 'true' : undefined}
              animate={{ scale: activeIndex === index ? 1.2 : 1 }}
              onClick={() => setPosition(loop ? index + 1 : index)}
              transition={{ duration: 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
