import { BookingCard } from '@/components/BookingCard';
import { HeroSection } from '@/components/HeroSection';

export default function Home() {
  return (
    <>
      {/* Desktop version */}
      <main
        className="hidden md:block min-h-screen"
        style={{
          background: `
            radial-gradient(circle at 100% 0%, #AA580D 0%, transparent 50%),
            radial-gradient(circle at 0% 100%, #AA580D 0%, transparent 50%),
            #E28F11
          `,
        }}
      >
        {/* Header - Desktop only */}
        <header className="px-[135px] py-5 pb-[27px] backdrop-blur-[34px] bg-black/20 border-b border-white/40">
          <h2 className="text-[22px] font-semibold text-white">
            6037 Venture Partnership
          </h2>
        </header>

        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4 sm:p-6 md:p-8">
          <BookingCard />
        </div>
      </main>

      {/* Mobile version */}
      <main className="md:hidden min-h-screen bg-white">
        <HeroSection />
        <BookingCard />
      </main>
    </>
  );
}
