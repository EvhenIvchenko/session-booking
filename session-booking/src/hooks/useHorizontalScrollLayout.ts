import {
  useState, useEffect, useRef, useCallback,
} from 'react';

// Responsive breakpoints
const BREAKPOINTS = {
  MD: 768, // Tablet and above
  XL: 1920, // Large desktop screens
} as const;

/**
 * Configuration for horizontal scroll layout
 */
export interface ScrollLayoutConfig {
  base: { width: number; height: number; gap: number };
  xl: { width: number; height: number; gap: number };
  reservedSpace: { md: number; base: number };
  overscan?: number;
  drag?: { threshold: number; multiplier: number };
  hintWidth?: { md: number; base: number };
}

/**
 * Calculates responsive dimensions and optimal container width
 * to fit exact number of items without partial visibility.
 */
export function useResponsiveLayout(
  wrapperRef: React.RefObject<HTMLDivElement | null>,
  config: ScrollLayoutConfig,
) {
  const [layout, setLayout] = useState({
    itemWidth: config.base.width,
    itemHeight: config.base.height,
    gap: config.base.gap,
    containerWidth: undefined as number | undefined,
  });

  useEffect(() => {
    const calculate = () => {
      if (!wrapperRef.current) return;

      const width = window.innerWidth;
      const isXL = width >= BREAKPOINTS.XL;
      const isMD = width >= BREAKPOINTS.MD;

      const current = isXL ? config.xl : config.base;

      // Determine hint width (usually 0 on desktop, >0 on mobile to show partial next item)
      const currentHint = isMD
        ? (config.hintWidth?.md || 0)
        : (config.hintWidth?.base || 0);

      // Calculate available space
      const totalWidth = wrapperRef.current.offsetWidth;
      const reserved = isMD ? config.reservedSpace.md : config.reservedSpace.base;

      // Subtract hint from available space to calculate how many FULL items fit
      const spaceForList = totalWidth - reserved - currentHint;

      // Calculate safe item count (including tolerance +1px for subpixel rounding)
      const maxItems = Math.floor((spaceForList + current.gap + 1) / (current.width + current.gap));
      const safeCount = Math.max(1, maxItems);

      // Add hint back to final container width to show partial next item
      const exactWidth = safeCount * current.width + (safeCount - 1) * current.gap + currentHint;

      setLayout({
        itemWidth: current.width,
        itemHeight: current.height,
        gap: current.gap,
        containerWidth: exactWidth,
      });
    };

    calculate();

    const observer = new ResizeObserver(calculate);
    if (wrapperRef.current) observer.observe(wrapperRef.current);
    window.addEventListener('resize', calculate);

    return () => {
      window.removeEventListener('resize', calculate);
      observer.disconnect();
    };
  }, [wrapperRef, config]);

  return layout;
}

/**
 * Handles mouse drag scrolling with optional scroll boundaries.
 *
 * @param containerRef - Reference to the scrollable container
 * @param options.getMinScroll - Optional function to get minimum allowed scroll position
 * @param options.dragConfig - Drag physics configuration (threshold and multiplier)
 */
export function useDragScroll(
  containerRef: React.RefObject<HTMLDivElement | null>,
  options: {
    getMinScroll?: () => number;
    dragConfig?: { threshold: number; multiplier: number };
  } = {},
) {
  const { getMinScroll, dragConfig = { threshold: 5, multiplier: 1.5 } } = options;

  const [isDragging, setIsDragging] = useState(false);
  const state = useRef({ isDown: false, startX: 0, scrollLeft: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    state.current.isDown = true;
    state.current.startX = e.pageX - containerRef.current.offsetLeft;
    state.current.scrollLeft = containerRef.current.scrollLeft;
  }, [containerRef]);

  const onMouseUp = useCallback(() => {
    state.current.isDown = false;
    setIsDragging(false);
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!state.current.isDown || !containerRef.current) return;

    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const distance = Math.abs(x - state.current.startX);
    const walk = (x - state.current.startX) * dragConfig.multiplier;

    if (!isDragging && distance > dragConfig.threshold) {
      setIsDragging(true);
    }

    if (isDragging || distance > dragConfig.threshold) {
      let targetScroll = state.current.scrollLeft - walk;

      // Apply minimum scroll constraint if provided
      if (getMinScroll) {
        targetScroll = Math.max(getMinScroll(), targetScroll);
      }

      const container = containerRef.current;
      container.scrollLeft = targetScroll;
    }
  }, [containerRef, isDragging, dragConfig, getMinScroll]);

  return {
    isDragging,
    events: {
      onMouseDown,
      onMouseUp,
      onMouseLeave: onMouseUp,
      onMouseMove,
    },
  };
}
