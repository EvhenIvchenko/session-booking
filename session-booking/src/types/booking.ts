/**
 * Represents a bookable time slot
 */
export interface TimeSlot {
  /** Hour in 24-hour format (0-23) */
  hours: number;
  /** Minutes (0-59) */
  minutes: number;
  /** Formatted time label (e.g., "2:30 PM") */
  label: string;
}

/**
 * Represents a date item in the calendar
 */
export interface DateItem {
  /** The actual Date object */
  date: Date;
  /** Short day of week (e.g., "Mon") */
  dayOfWeek: string;
  /** Day of month (1-31) */
  dayOfMonth: number;
  /** Short month name (e.g., "Jan") */
  month: string;
  /** Whether this date is today */
  isToday: boolean;
  /** Whether this date is in the past */
  isPast: boolean;
}

/**
 * The state of the booking form
 */
export interface BookingState {
  /** Currently selected date, null if none selected */
  selectedDate: Date | null;
  /** Currently selected time slot, null if none selected */
  selectedTime: TimeSlot | null;
}
