'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import clsx from 'clsx';
import {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';

import { useIsToday } from '@/hooks/useDateComparison';
import { useResponsiveLayout, useDragScroll } from '@/hooks/useHorizontalScrollLayout';
import { generateTimeSlots, isTimeSlotInPast, isTimeSlotSelected } from '@/utils/timeUtils';

import { Icon } from './Icon';

import type { TimeSlot } from '@/types/booking';

// Configuration specific to time slots
const TIME_CONFIG = {
  base: { width: 83, height: 47, gap: 8 },
  xl: { width: 88, height: 48, gap: 12 },
  reservedSpace: { md: 70, base: 16 },
  overscan: 5,
  drag: { threshold: 5, multiplier: 1.5 },
  hintWidth: { md: 0, base: 20 },
};

interface TimeSelectorProps {
  selectedDate: Date | null;
  selectedTime: TimeSlot | null;
  onTimeSelect: (time: TimeSlot) => void;
}

/**
 * Horizontal time slot selector with virtualization and drag-to-scroll
 * Auto-scrolls to first available time for today, prevents scrolling into past times
 * @param selectedDate - Currently selected date
 * @param selectedTime - Currently selected time slot
 * @param onTimeSelect - Callback when time slot is selected
 */
export function TimeSelector({ selectedDate, selectedTime, onTimeSelect }: TimeSelectorProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const timeSlots = useMemo(() => generateTimeSlots(), []);
  const [showArrows, setShowArrows] = useState({ left: false, right: true });
  const isToday = useIsToday(selectedDate);

  // Use shared hooks with time-specific config
  const {
    itemWidth, itemHeight, gap, containerWidth,
  } = useResponsiveLayout(wrapperRef, TIME_CONFIG);

  // Prevent scrolling into past times for today
  const getMinScrollBoundary = useCallback(() => {
    if (!selectedDate || !scrollContainerRef.current) return 0;

    if (isToday) {
      const firstIndex = timeSlots.findIndex((slot) => !isTimeSlotInPast(selectedDate, slot));
      if (firstIndex > 0) {
        return firstIndex * (itemWidth + gap);
      }
    }
    return 0;
  }, [selectedDate, timeSlots, itemWidth, gap, isToday]);

  const { isDragging, events: dragEvents } = useDragScroll(scrollContainerRef, {
    getMinScroll: getMinScrollBoundary,
    dragConfig: TIME_CONFIG.drag,
  });

  const virtualizer = useVirtualizer({
    horizontal: true,
    count: timeSlots.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => itemWidth,
    overscan: TIME_CONFIG.overscan,
    gap,
  });

  // Force re-measure on layout change
  useEffect(() => {
    virtualizer.measure();
  }, [itemWidth, gap, virtualizer]);

  // Scroll Position & Arrows Logic
  const checkScrollPosition = useCallback(() => {
    if (!scrollContainerRef.current || !selectedDate) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;

    setShowArrows({
      left: !isToday && scrollLeft > 0,
      right: scrollLeft < scrollWidth - clientWidth - 1,
    });
  }, [isToday, selectedDate]);

  // Sync scroll check
  useEffect(() => {
    checkScrollPosition();
  }, [selectedDate, checkScrollPosition, containerWidth, virtualizer]);

  // Auto-scroll to first available slot on date change
  useEffect(() => {
    if (!scrollContainerRef.current || !selectedDate) return;

    // For today's date, always scroll to first available time
    if (isToday) {
      const firstAvailableIndex = timeSlots.findIndex(
        (slot) => !isTimeSlotInPast(selectedDate, slot),
      );

      if (firstAvailableIndex >= 0) {
        // Use requestAnimationFrame to ensure virtualizer is ready
        requestAnimationFrame(() => {
          virtualizer.scrollToIndex(firstAvailableIndex, { align: 'start', behavior: 'auto' });
        });
      }
    } else {
      // For future dates, scroll to start
      requestAnimationFrame(() => {
        virtualizer.scrollToIndex(0, { align: 'start', behavior: 'auto' });
      });
    }
  }, [selectedDate, timeSlots, virtualizer, isToday]);

  // Button Scroll Handler
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const { clientWidth } = scrollContainerRef.current;
    const itemTotalWidth = itemWidth + gap;
    const itemsToScroll = Math.max(1, Math.floor(clientWidth / itemTotalWidth) - 1);

    const [firstVisible] = virtualizer.getVirtualItems();
    if (!firstVisible) return;

    const targetIndex = direction === 'left'
      ? Math.max(0, firstVisible.index - itemsToScroll)
      : Math.min(timeSlots.length - 1, firstVisible.index + itemsToScroll);

    virtualizer.scrollToIndex(targetIndex, { align: 'start', behavior: 'smooth' });
  };

  if (!selectedDate) return null;

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative flex items-center justify-center md:justify-between">

        {/* Left Arrow */}
        <button
          type="button"
          onClick={() => scroll('left')}
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

        {/* Scrollable Area */}
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
                      // Base button styles with border
                      'absolute top-0 left-0 shrink-0 snap-start rounded-full px-4 py-3 whitespace-nowrap transition-colors border',
                      'flex items-center justify-center',
                      'text-sm xl:text-base',
                      'focus:outline-none active:border-[var(--color-accent)] focus:border-[var(--color-accent)]',

                      // DISABLED State
                      'disabled:cursor-not-allowed disabled:opacity-40 disabled:border-[var(--color-border)] disabled:bg-white disabled:text-gray-400',

                      // DEFAULT State
                      !isPast && !isSelected && 'border-[var(--color-border)] bg-white font-normal text-[var(--color-text-primary)] hover:bg-gray-50',

                      // SELECTED State
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

        {/* Right Arrow */}
        <button
          type="button"
          onClick={() => scroll('right')}
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
