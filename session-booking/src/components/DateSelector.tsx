'use client';

import clsx from 'clsx';
import {
  useEffect, useMemo, useRef, useState,
} from 'react';

import { useOptimalScrollWidth } from '@/hooks/useOptimalScrollWidth';
import { generateDateRange, isSameDay } from '@/utils/dateUtils';

import { Icon } from './Icon';

interface DateSelectorProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  scrollToSelectionSignal?: number;
}

/**
 * Horizontal scrollable date selector component
 * Displays 6 weeks of dates grouped by month
 */
export function DateSelector({ selectedDate, onDateSelect, scrollToSelectionSignal }: DateSelectorProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);
    const [currentMonth, setCurrentMonth] = useState<string>('');

    const optimalWidth = useOptimalScrollWidth({
      cellWidth: 64,
      gap: 8,
      containerPadding: 40,
      minHintWidth: 22,
    });

    const [isDragging, setIsDragging] = useState(false);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeftStart, setScrollLeftStart] = useState(0);

    const dates = useMemo(() => generateDateRange(), []);

    const checkScrollPosition = () => {
      if (!scrollContainerRef.current) return;

      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);

      const buttonWidth = 64 + 8;
      const firstVisibleIndex = Math.floor(scrollLeft / buttonWidth);
      const month = dates[firstVisibleIndex]?.month || dates[0].month;
      setCurrentMonth(month);
    };

    useEffect(() => {
      checkScrollPosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      if (!scrollContainerRef.current || !selectedDate || !scrollToSelectionSignal) return;

      const selectedIndex = dates.findIndex((d) => isSameDay(d.date, selectedDate));
      if (selectedIndex === -1) return;

      const item = scrollContainerRef.current.firstElementChild as HTMLElement;
      const itemWidth = item ? item.offsetWidth + 8 : (64 + 8);

      const { clientWidth } = scrollContainerRef.current;
      // Center selected item: position - half screen + half item
      const scrollPos = selectedIndex * itemWidth - (clientWidth / 2) + (itemWidth / 2);

      scrollContainerRef.current.scrollTo({
        left: Math.max(0, scrollPos),
        behavior: 'smooth',
      });
    }, [scrollToSelectionSignal, selectedDate, dates]);

    // Minimum distance before dragging starts (prevents accidental drag on click)
    const DRAG_THRESHOLD = 5;

    const handleMouseDown = (e: React.MouseEvent) => {
      if (!scrollContainerRef.current) return;
      setIsMouseDown(true);
      setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
      setScrollLeftStart(scrollContainerRef.current.scrollLeft);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isMouseDown || !scrollContainerRef.current) return;

      const x = e.pageX - scrollContainerRef.current.offsetLeft;
      const distance = Math.abs(x - startX);

      if (!isDragging && distance > DRAG_THRESHOLD) {
        setIsDragging(true);
      }

      if (isDragging) {
        e.preventDefault();
        // 1.5x multiplier makes dragging feel more responsive
        const walk = (x - startX) * 1.5;
        scrollContainerRef.current.scrollLeft = scrollLeftStart - walk;
      }
    };

    const handleMouseUp = () => {
      setIsMouseDown(false);
      setIsDragging(false);
    };

    const handleMouseLeave = () => {
      setIsMouseDown(false);
      setIsDragging(false);
    };

    const scroll = (direction: 'left' | 'right') => {
      if (!scrollContainerRef.current) return;

      const item = scrollContainerRef.current.firstElementChild as HTMLElement;
      const itemWidth = item ? item.offsetWidth + 8 : (64 + 8);

      const { clientWidth } = scrollContainerRef.current;

      const visibleItems = Math.floor(clientWidth / itemWidth);

      // Scroll N-1 items to keep context (at least 1 item)
      const itemsToScroll = Math.max(1, visibleItems - 1);
      const scrollAmount = itemsToScroll * itemWidth;

      const newScrollLeft = direction === 'left'
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    };

    return (
      <div className="relative w-full">
        <div className="relative flex items-center justify-center gap-6 2xl:gap-7 [@media(min-width:1920px)]:gap-8">
          <button
            type="button"
            onClick={() => scroll('left')}
            disabled={!showLeftArrow}
            className="hidden shrink-0 mt-6 transition-colors disabled:cursor-not-allowed md:block"
            aria-label="Scroll left"
          >
            <Icon
              name="arrow-left"
              width={9}
              height={17}
              fill={showLeftArrow ? 'var(--color-text-primary)' : 'var(--color-text-disabled)'}
            />
          </button>

          <div
            className="relative overflow-hidden md:flex-none md:w-[424px] 2xl:w-[568px] [@media(min-width:1920px)]:w-[724px]"
            style={optimalWidth ? { maxWidth: `${optimalWidth}px` } : undefined}
          >
            {currentMonth && (
            <div className="pointer-events-none absolute left-0 top-2 z-10 flex h-5 items-center bg-white pr-2">
              <span className="text-sm font-medium text-gray-500">
                {currentMonth}
              </span>
            </div>
            )}

            <div
              ref={scrollContainerRef}
              role="presentation"
              onScroll={checkScrollPosition}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              className={clsx(
                'flex w-full gap-2 [@media(min-width:1920px)]:gap-3 overflow-x-auto py-2 pl-1 md:pl-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-pr-6',
                !isDragging && 'snap-x snap-mandatory',
                isDragging && 'select-none',
              )}
            >
              {dates.map((dateItem, index) => {
                const isSelected = isSameDay(dateItem.date, selectedDate);
                const isFirstOfMonth = index === 0 || dates[index - 1]?.month !== dateItem.month;
                const showMonthLabel = isFirstOfMonth && dateItem.month !== currentMonth;

                return (
                  <div key={dateItem.date.toISOString()} className="flex shrink-0 snap-start flex-col gap-1">
                    <div className="h-5 flex items-center">
                      {showMonthLabel && (
                        <span className="text-sm font-medium text-gray-500">
                          {dateItem.month}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onDateSelect(dateItem.date)}
                      onMouseDown={handleMouseDown}
                      className={clsx(
                        'flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-lg [@media(min-width:1920px)]:h-20 [@media(min-width:1920px)]:w-20',
                        'focus:border-[var(--color-accent)]',
                        isSelected && 'border border-[var(--color-selection)] bg-[var(--color-selection)] text-[var(--color-accent)] hover:bg-[var(--color-selection-hover)] hover:border-[var(--color-selection-hover)]',
                        !isSelected && 'border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] hover:bg-gray-50',
                        isDragging && 'cursor-grabbing',
                      )}
                      aria-label={`Select ${dateItem.dayOfWeek}, ${dateItem.month} ${dateItem.dayOfMonth}`}
                    >
                      <span className={clsx('text-[16px] md:text-xs [@media(min-width:1920px)]:text-sm md:uppercase text-inherit', isSelected ? 'font-medium' : 'font-normal')}>{dateItem.dayOfWeek}</span>
                      <span className={clsx('text-[16px] md:text-lg [@media(min-width:1920px)]:text-xl text-inherit', isSelected ? 'font-medium' : 'font-normal')}>{dateItem.dayOfMonth}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => scroll('right')}
            disabled={!showRightArrow}
            className="hidden shrink-0 mt-6 transition-colors disabled:cursor-not-allowed md:block"
            aria-label="Scroll right"
          >
            <Icon
              name="arrow-right"
              width={9}
              height={17}
              fill={showRightArrow ? 'var(--color-text-primary)' : 'var(--color-text-disabled)'}
            />
          </button>
        </div>
      </div>
    );
}
