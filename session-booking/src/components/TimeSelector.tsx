'use client';

import clsx from 'clsx';
import {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';

import { useOptimalScrollWidth } from '@/hooks/useOptimalScrollWidth';
import { generateTimeSlots, isTimeSlotInPast, isTimeSlotSelected } from '@/utils/timeUtils';

import { Icon } from './Icon';

import type { TimeSlot } from '@/types/booking';

interface TimeSelectorProps {
  selectedDate: Date | null;
  selectedTime: TimeSlot | null;
  onTimeSelect: (time: TimeSlot) => void;
}

/**
 * Horizontal scrollable time selector component
 * Displays time slots with 15-minute intervals in 12-hour format
 * Disables past time slots
 */
export function TimeSelector({ selectedDate, selectedTime, onTimeSelect }: TimeSelectorProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const optimalWidth = useOptimalScrollWidth({
    cellWidth: 88,
    gap: 8,
    containerPadding: 40,
    minHintWidth: 12,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftStart, setScrollLeftStart] = useState(0);

  const timeSlots = useMemo(() => generateTimeSlots(), []);

  const checkScrollPosition = useCallback(() => {
    if (!scrollContainerRef.current || !selectedDate) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;

    const today = new Date();
    const isToday = selectedDate.getDate() === today.getDate()
      && selectedDate.getMonth() === today.getMonth()
      && selectedDate.getFullYear() === today.getFullYear();

    setShowLeftArrow(!isToday && scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  }, [selectedDate]);

  useEffect(() => {
    checkScrollPosition();
  }, [selectedDate, checkScrollPosition]);

  useEffect(() => {
    if (!scrollContainerRef.current || !selectedDate) return;

    const firstAvailableIndex = timeSlots.findIndex(
      (slot) => !isTimeSlotInPast(selectedDate, slot),
    );

    if (firstAvailableIndex > 0) {
      const buttonWidth = 80 + 8;

      setTimeout(() => {
        const item = scrollContainerRef.current?.firstElementChild as HTMLElement;
        const realWidth = item ? item.offsetWidth + 8 : buttonWidth;

        scrollContainerRef.current?.scrollTo({
          left: firstAvailableIndex * realWidth,
          behavior: 'smooth',
        });
      }, 100);
    }
  }, [selectedDate, timeSlots]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const item = scrollContainerRef.current.firstElementChild as HTMLElement;
    const itemWidth = item ? item.offsetWidth + 8 : (80 + 8);
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

  // Minimum distance before dragging starts (prevents accidental drag on click)
  const DRAG_THRESHOLD = 5;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsMouseDown(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftStart(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !scrollContainerRef.current || !selectedDate) return;

    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const distance = Math.abs(x - startX);

    if (!isDragging && distance > DRAG_THRESHOLD) {
      setIsDragging(true);
    }

    if (isDragging) {
      e.preventDefault();
      // 1.5x multiplier makes dragging feel more responsive
      const walk = (x - startX) * 1.5;
      let newScrollLeft = scrollLeftStart - walk;

      const today = new Date();
      const isToday = selectedDate.getDate() === today.getDate()
        && selectedDate.getMonth() === today.getMonth()
        && selectedDate.getFullYear() === today.getFullYear();

      if (isToday) {
        const firstAvailableIndex = timeSlots.findIndex(
          (slot) => !isTimeSlotInPast(selectedDate, slot),
        );

        if (firstAvailableIndex > 0) {
          const item = scrollContainerRef.current.firstElementChild as HTMLElement;
          const itemWidth = item ? item.offsetWidth + 8 : (80 + 8);
          const minScrollLeft = firstAvailableIndex * itemWidth;
          newScrollLeft = Math.max(minScrollLeft, newScrollLeft);
        }
      }

      scrollContainerRef.current.scrollLeft = newScrollLeft;
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

  if (!selectedDate) {
    return null;
  }

  return (
    <div className="relative w-full">
      <div className="relative flex items-center justify-center gap-6 2xl:gap-7 [@media(min-width:1920px)]:gap-8">
        <button
          type="button"
          onClick={() => scroll('left')}
          disabled={!showLeftArrow}
          className="hidden shrink-0 transition-colors disabled:cursor-not-allowed md:block"
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
          ref={scrollContainerRef}
          role="presentation"
          onScroll={checkScrollPosition}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={optimalWidth ? { maxWidth: `${optimalWidth}px` } : undefined}
          className={clsx(
            'flex gap-2 [@media(min-width:1920px)]:gap-3 overflow-x-auto py-2 pl-1 md:pl-0 [scrollbar-width:none] md:flex-none md:w-[432px] 2xl:w-[608px] [@media(min-width:1920px)]:w-[744px] [&::-webkit-scrollbar]:hidden scroll-pr-6',
            !isDragging && 'snap-x snap-mandatory',
            isDragging && 'select-none',
          )}
        >
          {timeSlots.map((slot) => {
            const isPast = isTimeSlotInPast(selectedDate, slot);
            const isSelected = isTimeSlotSelected(slot, selectedTime);

            return (
              <button
                key={`${slot.hours}-${slot.minutes}`}
                type="button"
                onClick={() => onTimeSelect(slot)}
                onMouseDown={handleMouseDown}
                disabled={isPast}
                className={clsx(
                  'shrink-0 snap-start rounded-full px-4 py-3 text-[14px] md:text-sm md:w-[80px] md:px-2 [@media(min-width:1920px)]:w-24 [@media(min-width:1920px)]:py-4 [@media(min-width:1920px)]:text-base',
                  'focus:border-[var(--color-accent)]',
                  'disabled:cursor-not-allowed disabled:opacity-40',
                  !isPast && !isSelected && 'border border-[var(--color-border)] bg-white font-normal text-[var(--color-text-primary)] hover:bg-gray-50',
                  isSelected && 'border border-[var(--color-selection)] bg-[var(--color-selection)] font-medium text-[var(--color-accent)] hover:bg-[var(--color-selection-hover)] hover:border-[var(--color-selection-hover)]',
                  isPast && 'border border-[var(--color-border)] bg-white font-normal text-gray-400',
                  isDragging && 'cursor-grabbing',
                )}
                aria-label={`Select time ${slot.label}`}
              >
                {slot.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => scroll('right')}
          disabled={!showRightArrow}
          className="hidden shrink-0 transition-colors disabled:cursor-not-allowed md:block"
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
