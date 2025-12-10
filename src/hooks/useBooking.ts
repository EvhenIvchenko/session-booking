import { addDays, startOfDay } from 'date-fns';
import { useState } from 'react';

import { generateTimeSlots, isTimeSlotInPast } from '@/utils/timeUtils';

import type { BookingState, TimeSlot } from '@/types/booking';

/**
 * Gets the default selected date (today or tomorrow if no slots available today)
 */
const getDefaultDate = (): Date => {
  const today = startOfDay(new Date());
  const timeSlots = generateTimeSlots();

  // Check if there are any available time slots for today
  const hasAvailableSlots = timeSlots.some((slot) => !isTimeSlotInPast(today, slot));

  // If no slots available today, select tomorrow
  return hasAvailableSlots ? today : addDays(today, 1);
};

/**
 * Custom hook to manage booking state
 * @returns Booking state and handlers
 */
export function useBooking() {
  const [state, setState] = useState<BookingState>({
    selectedDate: getDefaultDate(),
    selectedTime: null,
  });

  const handleDateSelect = (date: Date) => {
    setState((prev) => ({
      ...prev,
      selectedDate: date,
      selectedTime: null,
    }));
  };

  const handleTimeSelect = (time: TimeSlot) => {
    setState((prev) => ({
      ...prev,
      selectedTime: time,
    }));
  };

  const reset = () => {
    setState({
      selectedDate: null,
      selectedTime: null,
    });
  };

  const isValid = state.selectedDate !== null && state.selectedTime !== null;

  return {
    selectedDate: state.selectedDate,
    selectedTime: state.selectedTime,
    handleDateSelect,
    handleTimeSelect,
    reset,
    isValid,
  };
}
