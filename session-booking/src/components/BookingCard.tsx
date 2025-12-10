'use client';

import clsx from 'clsx';
import Image from 'next/image';

import { useBooking } from '@/hooks/useBooking';
import { combineDateAndTime, getUnixTimestamp } from '@/utils/dateUtils';

import { DateSelector } from './DateSelector';
import { TimeSelector } from './TimeSelector';

/**
 * Main booking card component
 * Combines date and time selectors with a confirm button
 */
export function BookingCard() {
  const {
    selectedDate,
    selectedTime,
    handleDateSelect,
    handleTimeSelect,
    isValid,
  } = useBooking();

  const handleConfirm = () => {
    if (!isValid || !selectedDate || !selectedTime) return;

    const dateTime = combineDateAndTime(
      selectedDate,
      selectedTime.hours,
      selectedTime.minutes,
    );
    const timestamp = getUnixTimestamp(dateTime);

    // eslint-disable-next-line no-console
    console.log({ timestamp });
  };

  return (
    <div className="relative z-10 flex w-full min-h-[500px] md:min-h-[620px] flex-col justify-between bg-white px-5 py-8 -mt-6 rounded-t-[24px] md:mx-auto md:mt-0 md:max-w-[568px] md:rounded-2xl md:shadow-xl md:px-6 md:py-10 2xl:max-w-[750px] [@media(min-width:1920px)]:max-w-[890px]">
      <div>
        <div className="mb-8 flex items-start gap-4 sm:gap-6">
          <div className="hidden md:block h-[120px] w-[120px] shrink-0 overflow-hidden rounded-full">
            <Image
              src="/stylist.png"
              alt="Stylist"
              width={120}
              height={120}
              priority
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1 text-left">
            <h1 className="mb-2 font-kaisei text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">
              Book a Session
            </h1>
            <p className="text-[16px] text-gray-600 md:text-base">
              Choose a date and time that is convenient for you to e-meet your stylist
            </p>
          </div>
        </div>

        <div className="mb-6">
          <DateSelector
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onDateSelect={handleDateSelect}
          />
        </div>

        {selectedDate && (
          <div className="mb-6">
            <TimeSelector
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onTimeSelect={handleTimeSelect}
            />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleConfirm}
        disabled={!isValid}
        className={clsx(
          'w-full rounded-full py-4 text-base font-semibold transition-all',
          'disabled:cursor-not-allowed',
          isValid
            ? 'bg-black text-white hover:bg-gray-800'
            : 'bg-gray-200 text-gray-400',
        )}
      >
        Confirm
      </button>
    </div>
  );
}
