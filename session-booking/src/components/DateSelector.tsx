'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import clsx from 'clsx';
import {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';

import { useResponsiveLayout, useDragScroll } from '@/hooks/useHorizontalScrollLayout';
import { generateDateRange, isSameDay } from '@/utils/dateUtils';

import { Icon } from './Icon';

import type { TimeSlot } from '@/types/booking';

interface DateSelectorProps {
  selectedDate: Date | null;
  selectedTime: TimeSlot | null;
  onDateSelect: (date: Date) => void;
}

// Configuration specific to dates
const DATE_CONFIG = {
  base: { width: 64, height: 64, gap: 8 },
  xl: { width: 72, height: 72, gap: 12 },
  reservedSpace: { md: 70, base: 16 },
  overscan: 5,
  drag: { threshold: 5, multiplier: 1.5 },
  hintWidth: { md: 0, base: 20 },
};

const HEADER_HEIGHT = 24;

/**
 * Horizontal date selector with virtualization and drag-to-scroll
 * Displays dates for the next 3 months with sticky month headers
 * @param selectedDate - Currently selected date
 * @param selectedTime - Currently selected time (triggers scroll back to selected date)
 * @param onDateSelect - Callback when date is selected
 */
export function DateSelector({ selectedDate, selectedTime, onDateSelect }: DateSelectorProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const dates = useMemo(() => generateDateRange(), []);
  const [currentMonth, setCurrentMonth] = useState<string>('');
  const [showArrows, setShowArrows] = useState({ left: false, right: true });

  // Use shared hooks with date-specific config
  const {
    itemWidth, itemHeight, gap, containerWidth,
  } = useResponsiveLayout(wrapperRef, DATE_CONFIG);
  const { isDragging, events: dragEvents } = useDragScroll(scrollContainerRef, {
    dragConfig: DATE_CONFIG.drag,
  });

  const virtualizer = useVirtualizer({
    horizontal: true,
    count: dates.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => itemWidth,
    overscan: DATE_CONFIG.overscan,
    gap,
  });

  // Force re-measure when layout changes
  useEffect(() => {
    virtualizer.measure();
  }, [itemWidth, gap, virtualizer]);

  // Update scroll position, arrows visibility, and current month
  const checkScrollPosition = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;

    setShowArrows({
      left: scrollLeft > 0,
      right: scrollLeft < scrollWidth - clientWidth - 1,
    });

    const virtualItems = virtualizer.getVirtualItems();

    // Find first visible item (item end > scroll position)
    const firstVisibleItem = virtualItems.find((item) => {
      const itemEnd = item.start + item.size;
      return itemEnd > scrollLeft;
    });

    if (firstVisibleItem) {
      const dateItem = dates[firstVisibleItem.index];
      if (dateItem) {
        setCurrentMonth((prev) => (prev !== dateItem.month ? dateItem.month : prev));
      }
    }
  }, [dates, virtualizer]);

  // Attach scroll listener
  useEffect(() => {
    checkScrollPosition();
  }, [containerWidth, checkScrollPosition, virtualizer]);

  // Scroll back to selected date when time is chosen
  useEffect(() => {
    if (!selectedDate || !selectedTime) return;

    const selectedIndex = dates.findIndex(({ date }) => isSameDay(date, selectedDate));
    if (selectedIndex >= 0) {
      requestAnimationFrame(() => {
        virtualizer.scrollToIndex(selectedIndex, { align: 'center', behavior: 'smooth' });
      });
    }
  }, [selectedTime, selectedDate, dates, virtualizer]);

  // Scroll Button Handler
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const { clientWidth } = scrollContainerRef.current;
    const itemTotalWidth = itemWidth + gap;
    const itemsToScroll = Math.max(1, Math.floor(clientWidth / itemTotalWidth) - 1);

    const [firstVisible] = virtualizer.getVirtualItems();
    if (!firstVisible) return;

    const targetIndex = direction === 'left'
      ? Math.max(0, firstVisible.index - itemsToScroll)
      : Math.min(dates.length - 1, firstVisible.index + itemsToScroll);

    virtualizer.scrollToIndex(targetIndex, { align: 'start', behavior: 'smooth' });
  };

  const totalContainerHeight = HEADER_HEIGHT + itemHeight;

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative flex items-center justify-center md:justify-between">

        {/* Left Navigation */}
        <button
          type="button"
          onClick={() => scroll('left')}
          disabled={!showArrows.left}
          className="hidden shrink-0 mt-6 p-2 transition-opacity disabled:opacity-30 md:block"
          aria-label="Scroll left"
        >
          <Icon
            name="arrow-left"
            width={9}
            height={17}
            fill={showArrows.left ? 'var(--color-text-primary)' : 'var(--color-text-disabled)'}
          />
        </button>

        {/* Main List Container */}
        <div
          className="relative overflow-hidden transition-[width]"
          style={{
            width: containerWidth ? `${containerWidth}px` : '100%',
            maxWidth: '100%',
          }}
        >
          {/* Sticky Month Label */}
          {currentMonth && (
            <div className="pointer-events-none absolute left-0 top-2 z-10 flex h-5 items-center bg-white pr-2">
              <span className="text-sm font-medium text-gray-500">{currentMonth}</span>
            </div>
          )}

          {/* Scrollable Viewport */}
          <div
            ref={scrollContainerRef}
            role="presentation"
            onScroll={checkScrollPosition}
            {...dragEvents}
            className={clsx(
              'flex w-full overflow-x-auto py-2 pl-1 md:pl-0',
              'scrollbar-hide scroll-pr-6', // Ensure utility classes exist for hiding scrollbar
              !isDragging && 'snap-x snap-mandatory',
              isDragging && 'select-none cursor-grabbing',
            )}
            style={{ scrollbarWidth: 'none' }} // Fallback for Firefox
          >
            <div
              style={{
                width: `${virtualizer.getTotalSize()}px`,
                height: `${totalContainerHeight}px`,
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const dateItem = dates[virtualItem.index];
                const isSelected = isSameDay(dateItem.date, selectedDate);
                const isFirstOfMonth = virtualItem.index === 0
                  || dates[virtualItem.index - 1]?.month !== dateItem.month;

                return (
                  <div
                    key={dateItem.date.toISOString()}
                    className="absolute top-0 left-0 flex flex-col gap-1 snap-start"
                    style={{
                      transform: `translateX(${virtualItem.start}px)`,
                      width: `${virtualItem.size}px`,
                    }}
                  >
                    {/* Month Label Placeholder (prevents layout shift) */}
                    <div className="h-5 flex items-center">
                      {isFirstOfMonth && dateItem.month !== currentMonth && (
                        <span className="text-sm font-medium text-gray-500">{dateItem.month}</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onDateSelect(dateItem.date)}
                      style={{ height: `${itemHeight}px` }}
                      className={clsx(
                        'flex w-full flex-col items-center justify-center gap-1 rounded-lg border transition-colors',
                        'focus:outline-none active:border-[var(--color-accent)] focus:border-[var(--color-accent)]',
                        isSelected
                          ? 'border-[var(--color-selection)] bg-[var(--color-selection)] text-[var(--color-accent)]'
                          : 'border-[var(--color-border)] bg-white text-[var(--color-text-primary)] hover:bg-gray-50',
                        isDragging && 'pointer-events-none', // Prevent clicking while dragging
                      )}
                    >
                      <span className={clsx(
                        'text-[16px] md:text-xs text-inherit',
                        isSelected ? 'font-medium' : 'font-normal',
                        'xl:text-sm xl:uppercase', // 1920px+ styles
                      )}
                      >
                        {dateItem.dayOfWeek}
                      </span>
                      <span className={clsx(
                        'text-[16px] md:text-lg text-inherit',
                        isSelected ? 'font-medium' : 'font-normal',
                        'xl:text-xl', // 1920px+ styles
                      )}
                      >
                        {dateItem.dayOfMonth}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Navigation */}
        <button
          type="button"
          onClick={() => scroll('right')}
          disabled={!showArrows.right}
          className="hidden shrink-0 mt-6 p-2 transition-opacity disabled:opacity-30 md:block"
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
