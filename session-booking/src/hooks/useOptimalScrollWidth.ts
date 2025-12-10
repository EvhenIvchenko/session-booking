'use client';

import { useEffect, useState } from 'react';

interface UseOptimalScrollWidthParams {
  cellWidth: number;
  gap: number;
  containerPadding: number;
  minHintWidth: number;
}

/**
 * Calculates optimal scroll container width
 * Shows maximum number of full cells + hint of next cell
 */
export function useOptimalScrollWidth({
  cellWidth,
  gap,
  containerPadding,
  minHintWidth,
}: UseOptimalScrollWidthParams) {
  const [optimalWidth, setOptimalWidth] = useState<number | null>(null);

  useEffect(() => {
    const calculateWidth = () => {
      const availableWidth = window.innerWidth - containerPadding;
      const cellWithGap = cellWidth + gap;
      const fullCellsCount = Math.floor((availableWidth - minHintWidth) / cellWithGap);
      const optimal = (fullCellsCount * cellWithGap) - gap + minHintWidth;

      setOptimalWidth(optimal);
    };

    calculateWidth();

    let timeoutId: NodeJS.Timeout;
    const debouncedCalculate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(calculateWidth, 150);
    };

    window.addEventListener('resize', debouncedCalculate);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedCalculate);
    };
  }, [cellWidth, gap, containerPadding, minHintWidth]);

  return optimalWidth;
}
