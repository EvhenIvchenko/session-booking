import {
  addMonths,
  eachDayOfInterval,
  format,
  isToday,
  startOfDay,
} from 'date-fns';

import type { DateItem } from '@/types/booking';

const DEFAULT_MONTHS_AHEAD = 3;
const MIN_MONTHS = 1;
const MAX_MONTHS = 12;

/**
 * Generates a range of dates for the booking calendar
 * @param monthsAhead - Number of months to generate ahead, defaults to 3
 * @returns Array of DateItem objects with formatted date information
 * @throws Error if monthsAhead is out of valid range (1-12)
 */
export const generateDateRange = (monthsAhead: number = DEFAULT_MONTHS_AHEAD): DateItem[] => {
  if (monthsAhead < MIN_MONTHS || monthsAhead > MAX_MONTHS) {
    throw new Error(`monthsAhead must be between ${MIN_MONTHS} and ${MAX_MONTHS}`);
  }

  const today = startOfDay(new Date());
  const endDate = addMonths(today, monthsAhead);

  const dates = eachDayOfInterval({ start: today, end: endDate });

  return dates.map((date) => ({
    date,
    dayOfWeek: format(date, 'EEE'),
    dayOfMonth: parseInt(format(date, 'd'), 10),
    month: format(date, 'MMM'),
    isToday: isToday(date),
    isPast: false,
  }));
};

/**
 * Compares two dates to check if they are the same day
 * @param date1 - First date to compare
 * @param date2 - Second date to compare
 * @returns true if dates are the same day, false otherwise
 */
export const isSameDay = (date1: Date | null, date2: Date | null): boolean => {
  if (!date1 || !date2) return false;
  return (
    date1.getFullYear() === date2.getFullYear()
    && date1.getMonth() === date2.getMonth()
    && date1.getDate() === date2.getDate()
  );
};

/**
 * Combines a date with specific time (hours and minutes)
 * @param date - The base date
 * @param hours - Hour (0-23)
 * @param minutes - Minutes (0-59)
 * @returns New Date object with combined date and time
 */
export const combineDateAndTime = (
  date: Date,
  hours: number,
  minutes: number,
): Date => {
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
};

/**
 * Converts a Date object to Unix timestamp (seconds since epoch)
 * @param date - The date to convert
 * @returns Unix timestamp in seconds
 */
export const getUnixTimestamp = (date: Date): number => Math.floor(date.getTime() / 1000);
