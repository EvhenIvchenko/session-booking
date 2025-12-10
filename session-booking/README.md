# Session Booking

A modern, responsive booking interface built with Next.js 15 and TypeScript. Features an intuitive date and time selection experience with smooth animations and drag-to-scroll functionality.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8)

## 🚀 Features

- **Responsive Design**: Optimized for mobile, tablet, and desktop (including 4K displays)
- **Date Selector**: Interactive calendar with 6-week rolling window
- **Time Selector**: Dynamic time slots with 15-minute intervals
- **Drag-to-Scroll**: Smooth horizontal scrolling with mouse drag support
- **Smart Validation**: Automatic disabling of past dates and times
- **Accessibility**: Full ARIA labels, and focus states
- **Type-Safe**: Built with TypeScript strict mode
- **CSS Variables**: Centralized color system for easy theming

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
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
│   ├── DateSelector.tsx     # Date picker component
│   ├── TimeSelector.tsx     # Time slot picker
│   ├── HeroSection.tsx      # Hero banner (mobile)
│   └── Icon.tsx             # SVG sprite component
├── hooks/
│   ├── useBooking.ts        # Booking state management
│   └── useOptimalScrollWidth.ts  # Responsive scroll width
├── types/
│   └── booking.ts           # TypeScript interfaces
└── utils/
    ├── dateUtils.ts         # Date manipulation helpers
    └── timeUtils.ts         # Time slot generation
```

## 🎨 Color System

All colors are defined as CSS variables in `globals.css`:

```css
--color-accent: #DE3A6B           /* Primary accent color */
--color-hero: #E28F11             /* Hero background */
--color-text-primary: #16171B     /* Main text */
--color-border: #E8EBF4           /* Default borders */
--color-selection: #F7F7FC        /* Selected state */
```

## 📱 Breakpoints

- **Mobile**: < 768px
- **Tablet/Desktop**: ≥ 768px (md:)
- **Large Desktop**: ≥ 1536px (2xl:)
- **4K**: ≥ 1920px ([@media(min-width:1920px)])

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

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb + TypeScript rules
- **Formatting**: Consistent indentation and import order
- **No console logs**: Clean production code (except intentional logging)

## ♿ Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus indicators on all focusable elements
- Screen reader friendly

## 📄 License

MIT

---

Built using Next.js and TypeScript
