import { useCallback, useRef, useEffect } from 'react';

import type { VirtualizerOptions } from '@tanstack/react-virtual';

/**
 * Easing function - makes animation feel natural
 * Slow at start, fast in middle, slow at end
 */
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

interface UseSnapScrollOptions {
  scrollDuration?: number;
}

/**
 * Hook for smooth scrolling with CSS snap + virtualization
 *
 * PROBLEM:
 * CSS snap constantly "pulls" scroll to nearest element.
 * When we animate scroll — snap interrupts the animation.
 *
 * SOLUTION:
 * 1. Disable snap
 * 2. Animate scroll manually (frame by frame)
 * 3. Re-enable snap
 */
export function useSnapScroll<T extends HTMLElement>(
  containerRef: React.RefObject<T | null>,
  options: UseSnapScrollOptions = {},
) {
  // Current animation ID — so new animation can stop the old one
  const currentAnimationId = useRef<number>(0);

  // Timer for restoring snap
  const snapRestoreTimer = useRef<NodeJS.Timeout | null>(null);

  const duration = options.scrollDuration ?? 800;

  // Cleanup timer on unmount
  useEffect(() => () => {
    if (snapRestoreTimer.current) clearTimeout(snapRestoreTimer.current);
  }, []);

  const scrollToFn: VirtualizerOptions<T, Element>['scrollToFn'] = useCallback(
    (targetOffset, isSmooth) => {
      const container = containerRef.current;
      if (!container) return;

      // Cancel previous snap restore timer
      if (snapRestoreTimer.current) {
        clearTimeout(snapRestoreTimer.current);
        snapRestoreTimer.current = null;
      }

      // --- INSTANT SCROLL (no animation) ---
      if (!isSmooth) {
        container.style.scrollSnapType = 'none';
        container.scrollLeft = targetOffset;

        // Re-enable snap in next frame
        requestAnimationFrame(() => {
          container.style.scrollSnapType = '';
        });
        return;
      }

      // --- SMOOTH SCROLL (with animation) ---

      const startOffset = container.scrollLeft;
      const distance = Math.abs(targetOffset - startOffset);

      // Short distance = faster animation
      const animationDuration = distance < 500 ? 200 : duration;

      // Store start time as animation ID
      const animationId = Date.now();
      currentAnimationId.current = animationId;

      // Disable snap so it doesn't interfere
      container.style.scrollSnapType = 'none';

      // Single frame of animation
      const animateFrame = () => {
        // If new animation started — stop this one
        if (currentAnimationId.current !== animationId) return;

        const elapsed = Date.now() - animationId;
        const progress = Math.min(elapsed / animationDuration, 1);

        // Calculate current position with easing
        const currentOffset = startOffset + (targetOffset - startOffset) * easeInOutCubic(progress);
        container.scrollLeft = currentOffset;

        if (progress < 1) {
          // Not finished — schedule next frame
          requestAnimationFrame(animateFrame);
        } else {
          // Animation complete — set exact position
          container.scrollLeft = targetOffset;

          // Re-enable snap after small delay
          snapRestoreTimer.current = setTimeout(() => {
            if (currentAnimationId.current === animationId) {
              container.style.scrollSnapType = '';
            }
          }, 100);
        }
      };

      // Start animation
      requestAnimationFrame(animateFrame);
    },
    [containerRef, duration],
  );

  return scrollToFn;
}
