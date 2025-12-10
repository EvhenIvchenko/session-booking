# Session Booking

A modern, responsive booking interface built with Next.js 15 and TypeScript. Features an intuitive date and time selection experience with virtualized scrolling, drag-to-scroll functionality, and smart date/time management.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8)

## 🚀 Features

- **Responsive Design**: Optimized for mobile, tablet, desktop, and 4K displays
- **Date Selector**: Interactive calendar with 3-month rolling window and sticky month headers
- **Time Selector**: Dynamic 15-minute interval slots with auto-scroll to available times
- **Virtualized Scrolling**: High-performance rendering with [@tanstack/react-virtual](https://tanstack.com/virtual)
- **Drag-to-Scroll**: Smooth horizontal scrolling with mouse drag physics
- **Smart Validation**: Automatic disabling of past dates/times with scroll constraints
- **Accessibility**: Full ARIA labels, keyboard navigation, and focus states
- **Type-Safe**: Built with TypeScript strict mode
- **Composition Pattern**: Reusable hooks following React best practices
- **CSS Variables**: Centralized color system for easy theming

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Virtualization**: [@tanstack/react-virtual](https://tanstack.com/virtual)
- **Date Handling**: [date-fns](https://date-fns.org/)
- **Code Quality**: ESLint (Airbnb config) + TypeScript ESLint
- **Fonts**: Custom Google Fonts (Poppins, Kaisei Tokumin)

## 📦 Getting Started

### Prerequisites

- Node.js 20.18+
- npm or yarn### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/session-booking.git
cd session-booking

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗️ Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles & CSS variables
│   ├── layout.tsx           # Root layout with fonts
│   └── page.tsx             # Main page component
├── components/
│   ├── BookingCard.tsx      # Main booking container
│   ├── DateSelector.tsx     # Virtualized date picker with sticky headers
│   ├── TimeSelector.tsx     # Virtualized time slot picker with constraints
│   ├── HeroSection.tsx      # Hero banner (mobile)
│   └── Icon.tsx             # SVG sprite component
├── hooks/
│   ├── useBooking.ts        # Booking state management
│   ├── useHorizontalScrollLayout.ts  # Shared scroll layout logic
│   └── useDateComparison.ts # Date comparison utilities
├── types/
│   └── booking.ts           # Shared TypeScript interfaces
└── utils/
    ├── dateUtils.ts         # Date manipulation (3-month range)
    └── timeUtils.ts         # Time slot generation (15-min intervals)
```

## 🎯 Architecture Highlights

### Composition over Inheritance

Custom hooks (`useHorizontalScrollLayout`, `useDragScroll`) are shared between `DateSelector` and `TimeSelector`, eliminating code duplication while maintaining component flexibility.

### Performance Optimization

- **Virtualization**: Only renders visible items using `@tanstack/react-virtual`
- **Memoization**: Heavy calculations cached with `useMemo`
- **Optimized Re-renders**: Callbacks wrapped in `useCallback`
- **ResizeObserver**: Dynamic layout adjustments without polling

## 🎨 Color System

All colors are defined as CSS variables in `globals.css`:

```css
--color-accent: #DE3A6B           /* Primary accent color */
--color-hero: #E28F11             /* Hero background */
--color-text-primary: #16171B     /* Main text */
--color-border: #E8EBF4           /* Default borders */
--color-selection: #F7F7FC        /* Selected state */
```

## 📱 Responsive Breakpoints

- **Mobile**: < 768px (Full-width layout, compact spacing, 20px hint)
- **Tablet/Desktop**: ≥ 768px (Arrow navigation, optimal spacing)
- **4K/XL**: ≥ 1920px (Larger items, wider gaps)

Each breakpoint adjusts:

- Item dimensions (width/height)
- Gap spacing between items
- Reserved space for navigation arrows
- Hint width (20px partial next item on mobile for scroll affordance)
- Exact container width for pixel-perfect alignment

## 🧪 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/session-booking)

### Manual Deployment

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Configure build settings:
   - **Framework**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
4. Deploy!

## 📝 Code Quality

- **TypeScript**: Strict mode enabled with full type coverage
- **ESLint**: Airbnb + TypeScript rules enforced
- **Architecture**: Composition pattern with shared hooks (DRY principle)
- **Documentation**: JSDoc comments on all public APIs
- **Accessibility**: WCAG 2.1 AA compliant

## 🎨 Key Components

### DateSelector

- 3-month rolling window with virtualized rendering
- Sticky month headers that update on scroll
- Drag-to-scroll with snap points
- Auto-scrolls back to selected date when time is chosen

### TimeSelector

- 15-minute interval slots (8:00 AM - 9:45 PM)
- Auto-scrolls to first available time for current date
- Prevents scrolling into past times (today only)
- Drag constraint boundaries

## 🎯 UX Behavior & Edge Cases

### Smart Auto-Scroll

**Date Selection Flow:**

1. User selects a date → TimeSelector auto-scrolls to first available time (today) or beginning (future dates)
2. User scrolls DateSelector away from selected date
3. User selects a time → DateSelector auto-scrolls back to selected date (centered, smooth animation)

**Why:** Ensures users always see their selected date after choosing a time, preventing confusion from scrolled-away selections.

### Past Time Handling (Today)

- **Scroll Constraint**: Cannot scroll to past time slots on current date
- **Left Arrow**: Disabled when viewing today's date
- **Auto-Position**: Opens at first available future time slot
- **Future Dates**: No restrictions, full scroll access

### Mobile Scroll Affordance

- **20px Hint**: Partial next item visible on mobile (<768px) to indicate scrollability
- **Desktop**: No hint, arrow buttons provide clear navigation affordance

### Date Range

- **Default Selection**: Tomorrow if no slots available today, otherwise today
- **Range**: 3-month rolling window from current date
- **Update**: Month header updates dynamically based on scroll position

## ♿ Accessibility

- ARIA labels on all interactive elements
- Focus indicators on all focusable elements

## ⚠️ Security Notes

**Dev Dependencies Vulnerabilities**: 3 high severity vulnerabilities exist in development dependencies:

- `glob` vulnerability via `@next/eslint-plugin-next@14.2.15` (bundled with `eslint-config-next`)
- **Impact**: CLI command injection (development tools only, not runtime)
- **Production**: Not affected - ESLint is excluded from production builds
- **Why not fixed**: `eslint-config-airbnb@19` requires ESLint 8, but fixing the vulnerability requires `eslint-config-next@16` which needs ESLint 9. Migrating to ESLint 9 would require dropping Airbnb config or waiting for their ESLint 9 support.

This is acknowledged and accepted for the current scope. Production deployment on Vercel is not affected.

## 📄 License

MIT

---

Built using Next.js and TypeScript
