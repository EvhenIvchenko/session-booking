import {
  addWeeks,
  eachDayOfInterval,
  format,
  isToday,
  startOfDay,
} from 'date-fns';

import type { DateItem } from '@/types/booking';

const DEFAULT_WEEKS_AHEAD = 6;
const MIN_WEEKS = 1;
const MAX_WEEKS = 52;

/**
 * Generates a range of dates for the booking calendar
 * @param weeksAhead - Number of weeks to generate ahead, defaults to 6
 * @returns Array of DateItem objects with formatted date information
 * @throws Error if weeksAhead is out of valid range (1-52)
 */
export const generateDateRange = (weeksAhead: number = DEFAULT_WEEKS_AHEAD): DateItem[] => {
  if (weeksAhead < MIN_WEEKS || weeksAhead > MAX_WEEKS) {
    throw new Error(`weeksAhead must be between ${MIN_WEEKS} and ${MAX_WEEKS}`);
  }

  const today = startOfDay(new Date());
  const endDate = addWeeks(today, weeksAhead);

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
