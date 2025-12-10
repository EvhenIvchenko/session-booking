import { format } from 'date-fns';

import type { TimeSlot } from '@/types/booking';

const DEFAULT_START_HOUR = 8;
const DEFAULT_END_HOUR = 20;
const DEFAULT_INTERVAL_MINUTES = 15;
const MIN_HOUR = 0;
const MAX_HOUR = 24;
const MINUTES_IN_HOUR = 60;

/**
 * Generates an array of time slots for booking
 * @param startHour - Starting hour (0-23), defaults to 8 AM
 * @param endHour - Ending hour (1-24), defaults to 8 PM
 * @param intervalMinutes - Interval between slots in minutes, defaults to 15
 * @returns Array of TimeSlot objects with hours, minutes, and formatted label
 * @throws Error if parameters are out of valid range
 */
export const generateTimeSlots = (
  startHour: number = DEFAULT_START_HOUR,
  endHour: number = DEFAULT_END_HOUR,
  intervalMinutes: number = DEFAULT_INTERVAL_MINUTES,
): TimeSlot[] => {
  if (startHour < MIN_HOUR || startHour >= MAX_HOUR) {
    throw new Error(`startHour must be between ${MIN_HOUR} and ${MAX_HOUR - 1}`);
  }
  if (endHour <= startHour || endHour > MAX_HOUR) {
    throw new Error(`endHour must be greater than startHour and max ${MAX_HOUR}`);
  }
  if (intervalMinutes <= 0 || intervalMinutes > MINUTES_IN_HOUR) {
    throw new Error(`intervalMinutes must be between 1 and ${MINUTES_IN_HOUR}`);
  }

  const slots: TimeSlot[] = [];
  const date = new Date();

  for (let hour = startHour; hour < endHour; hour += 1) {
    for (let minute = 0; minute < MINUTES_IN_HOUR; minute += intervalMinutes) {
      date.setHours(hour, minute, 0, 0);

      slots.push({
        hours: hour,
        minutes: minute,
        label: format(date, 'h:mm a'),
      });
    }
  }

  return slots;
};

/**
 * Checks if a time slot on a given date is in the past
 * @param selectedDate - The date to check
 * @param timeSlot - The time slot to validate
 * @returns true if the datetime is in the past, false otherwise
 */
export const isTimeSlotInPast = (
  selectedDate: Date,
  timeSlot: TimeSlot,
): boolean => {
  const now = new Date();
  const slotDateTime = new Date(selectedDate);
  slotDateTime.setHours(timeSlot.hours, timeSlot.minutes, 0, 0);

  return slotDateTime < now;
};

/**
 * Checks if a time slot matches the currently selected time
 * @param timeSlot - The time slot to check
 * @param selectedTime - The currently selected time slot (or null)
 * @returns true if the slots match, false otherwise
 */
export const isTimeSlotSelected = (
  timeSlot: TimeSlot,
  selectedTime: TimeSlot | null,
): boolean => {
  if (!selectedTime) return false;
  return (
    timeSlot.hours === selectedTime.hours
    && timeSlot.minutes === selectedTime.minutes
  );
};
