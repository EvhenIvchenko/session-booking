import { useMemo } from 'react';

import { isSameDay } from '@/utils/dateUtils';

/**
 * Hook to check if a date is today
 * @param date - Date to compare with today
 * @returns true if the date is today, false otherwise
 */
export const useIsToday = (date: Date | null): boolean => useMemo(() => {
  if (!date) return false;
  return isSameDay(date, new Date());
}, [date]);
