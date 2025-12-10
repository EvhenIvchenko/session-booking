import { useVirtualizer } from '@tanstack/react-virtual';
import clsx from 'clsx';
import {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';

import { useIsToday } from '@/hooks/useDateComparison';
import { useResponsiveLayout, useDragScroll } from '@/hooks/useHorizontalScrollLayout';
import { useSnapScroll } from '@/hooks/useSnapScroll'; // Import new hook
import { generateTimeSlots, isTimeSlotInPast, isTimeSlotSelected } from '@/utils/timeUtils';

import { Icon } from './Icon';

import type { TimeSlot } from '@/types/booking';

const TIME_CONFIG = {
  base: { width: 83, height: 47, gap: 8 },
  xl: { width: 88, height: 48, gap: 12 },
  reservedSpace: { md: 70, base: 16 },
  overscan: 10,
  drag: { threshold: 5, multiplier: 1.5 },
  hintWidth: { md: 0, base: 20 },
  scrollDuration: 1000,
  arrowScrollStep: 2,
};

interface TimeSelectorProps {
  selectedDate: Date | null;
  selectedTime: TimeSlot | null;
  onTimeSelect: (time: TimeSlot) => void;
}

/**
 * TimeSelector Component
 *
 * Implements a horizontal virtualized list of time slots.
 * Uses `useSnapScroll` to manage the interaction between "Scroll Snapping" and "Smooth Auto-Scroll".
 */
export function TimeSelector({ selectedDate, selectedTime, onTimeSelect }: TimeSelectorProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const timeSlots = useMemo(() => generateTimeSlots(), []);
  const [showArrows, setShowArrows] = useState({ left: false, right: true });
  const isToday = useIsToday(selectedDate);

  const {
    itemWidth, itemHeight, gap, containerWidth,
  } = useResponsiveLayout(wrapperRef, TIME_CONFIG);

  // Index of the first available slot (for today)
  // We want to prevent auto-scrolling to past times.
  const firstAvailableIndex = useMemo(() => {
    if (!isToday || !selectedDate) return 0;
    const index = timeSlots.findIndex((slot) => !isTimeSlotInPast(selectedDate, slot));
    return index > 0 ? index : 0;
  }, [isToday, selectedDate, timeSlots]);

  // Calculate the pixel offset for the start boundary
  const minScrollPosition = useMemo(
    () => firstAvailableIndex * (itemWidth + gap),
    [firstAvailableIndex, itemWidth, gap],
  );

  const { isDragging, events: dragEvents } = useDragScroll(scrollContainerRef, {
    getMinScroll: useCallback(() => minScrollPosition, [minScrollPosition]),
    dragConfig: TIME_CONFIG.drag,
  });

  // Use the extracted hook to handle complex scroll logic
  const scrollToFn = useSnapScroll(scrollContainerRef, {
    scrollDuration: TIME_CONFIG.scrollDuration,
  });

  const virtualizer = useVirtualizer({
    horizontal: true,
    count: timeSlots.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => itemWidth,
    overscan: TIME_CONFIG.overscan,
    gap,
    scrollToFn,
  });

  useEffect(() => {
    virtualizer.measure();
  }, [itemWidth, gap, virtualizer]);

  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || !selectedDate) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;

    setShowArrows({
      left: scrollLeft > minScrollPosition + 1,
      right: scrollLeft < scrollWidth - clientWidth - 1,
    });
  }, [selectedDate, minScrollPosition]);

  useEffect(() => {
    checkScrollPosition();
  }, [checkScrollPosition, containerWidth]);

  // Auto-scroll on date change
  useEffect(() => {
    if (!scrollContainerRef.current || !selectedDate || !containerWidth) return;
    if (virtualizer.getTotalSize() === 0) return;

    const targetIndex = isToday ? firstAvailableIndex : 0;

    virtualizer.scrollToIndex(targetIndex, { align: 'start', behavior: 'smooth' });
  }, [selectedDate, virtualizer, isToday, containerWidth, firstAvailableIndex]);

  // Arrow scroll - smooth animation
  const scrollByArrow = useCallback((direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const itemTotalWidth = itemWidth + gap;
    const currentIndex = Math.round(container.scrollLeft / itemTotalWidth);

    const targetIndex = direction === 'left'
      ? Math.max(firstAvailableIndex, currentIndex - TIME_CONFIG.arrowScrollStep)
      : Math.min(timeSlots.length - 1, currentIndex + TIME_CONFIG.arrowScrollStep);

    // behavior: 'smooth' uses our custom easeInOutCubic animation
    virtualizer.scrollToIndex(targetIndex, { align: 'start', behavior: 'smooth' });
  }, [itemWidth, gap, firstAvailableIndex, timeSlots.length, virtualizer]);

  if (!selectedDate) return null;

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative flex items-center justify-center md:justify-between">

        <button
          type="button"
          onClick={() => scrollByArrow('left')}
          disabled={!showArrows.left}
          className="hidden shrink-0 transition-opacity disabled:opacity-30 md:block p-2"
          aria-label="Scroll left"
        >
          <Icon
            name="arrow-left"
            width={9}
            height={17}
            fill={showArrows.left ? 'var(--color-text-primary)' : 'var(--color-text-disabled)'}
          />
        </button>

        <div
          className="relative overflow-hidden transition-[width]"
          style={{
            width: containerWidth ? `${containerWidth}px` : '100%',
            maxWidth: '100%',
          }}
        >
          <div
            ref={scrollContainerRef}
            role="presentation"
            onScroll={checkScrollPosition}
            {...dragEvents}
            className={clsx(
              'flex w-full overflow-x-auto py-2 pl-1 md:pl-0',
              'scrollbar-hide scroll-pr-6',
              !isDragging && 'snap-x snap-mandatory',
              isDragging && 'select-none cursor-grabbing',
            )}
            style={{ scrollbarWidth: 'none' }}
          >
            <div
              style={{
                width: `${virtualizer.getTotalSize()}px`,
                height: `${itemHeight}px`,
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const slot = timeSlots[virtualItem.index];
                const isPast = isTimeSlotInPast(selectedDate, slot);
                const isSelected = isTimeSlotSelected(slot, selectedTime);

                return (
                  <button
                    key={`${slot.hours}-${slot.minutes}`}
                    type="button"
                    onClick={() => onTimeSelect(slot)}
                    disabled={isPast}
                    className={clsx(
                      'absolute top-0 left-0 shrink-0 snap-start rounded-full px-4 py-3 whitespace-nowrap transition-colors border',
                      'flex items-center justify-center',
                      'text-sm xl:text-base',
                      'focus:outline-none active:border-[var(--color-accent)] focus:border-[var(--color-accent)]',
                      'disabled:cursor-not-allowed disabled:opacity-40 disabled:border-[var(--color-border)] disabled:bg-white disabled:text-gray-400',
                      !isPast && !isSelected && 'border-[var(--color-border)] bg-white font-normal text-[var(--color-text-primary)] hover:bg-gray-50',
                      isSelected && 'border-[var(--color-selection)] bg-[var(--color-selection)] font-medium text-[var(--color-accent)]',
                      isDragging && 'pointer-events-none',
                    )}
                    style={{
                      transform: `translateX(${virtualItem.start}px)`,
                      width: `${virtualItem.size}px`,
                      height: `${itemHeight}px`,
                    }}
                    aria-label={`Select time ${slot.label}`}
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => scrollByArrow('right')}
          disabled={!showArrows.right}
          className="hidden shrink-0 transition-opacity disabled:opacity-30 md:block p-2"
          aria-label="Scroll right"
        >
          <Icon
            name="arrow-right"
            width={9}
            height={17}
            fill={showArrows.right ? 'var(--color-text-primary)' : 'var(--color-text-disabled)'}
          />
        </button>
      </div>
    </div>
  );
}
