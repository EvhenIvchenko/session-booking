'use client';

import Image from 'next/image';

import { Icon } from './Icon';

/**
 * Hero section for mobile - orange background with stylist photo
 */
export function HeroSection() {
  return (
    <div className="relative h-[320px] w-full overflow-hidden bg-[var(--color-hero)] md:hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 100% 0%, rgba(170, 88, 13, 0.6) 0%, transparent 50%),
            radial-gradient(circle at 0% 100%, rgba(170, 88, 13, 0.6) 0%, transparent 50%)
          `,
        }}
      />

      <div
        className="absolute right-[-90px] bottom-[-60px] h-[301px] w-[301px] rounded-full"
        style={{
          background: 'var(--color-hero-decoration)',
          border: '4px solid var(--color-hero-border)',
        }}
      />

      <div className="relative h-full flex items-center px-5">
        <div className="flex flex-col gap-6 max-w-[259px] z-10">
          <div className="flex flex-col gap-1">
            <h1 className="font-poppins text-[27px] font-medium leading-normal text-white">
              Cool session
            </h1>
            <p className="font-poppins text-base font-normal leading-normal text-white/80">
              Additional type
            </p>
          </div>

          <div
            className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1"
            style={{
              background: 'rgba(255, 255, 255, 0.16)',
              backdropFilter: 'blur(6px)',
            }}
          >
            <Icon name="clock" className="h-4 w-4 text-white" width={16} height={16} />
            <span className="font-poppins text-[13px] font-normal leading-normal text-white">
              30 min
            </span>
          </div>
        </div>

        <div className="absolute right-0 top-[40px] h-[270px] w-[180px] overflow-hidden rounded-tl-[120px] z-10">
          <Image
            src="/stylist-mobile.png"
            alt="Stylist"
            width={180}
            height={270}
            priority
            className="h-full w-full object-cover object-top"
          />
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 h-[100px] w-full pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 100%)',
        }}
      />
    </div>
  );
}
