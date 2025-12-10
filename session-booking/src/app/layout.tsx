import localFont from 'next/font/local';

import type { Metadata } from 'next';

import './globals.css';

const poppins = localFont({
  src: [
    {
      path: '../../public/fonts/Poppins-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Poppins-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Poppins-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Poppins-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-poppins',
  display: 'swap',
});

const kaiseiTokumin = localFont({
  src: [
    {
      path: '../../public/fonts/KaiseiTokumin-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-kaisei',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Book a Session | 6037 Venture Partnership',
  description: 'Schedule your styling session with our professional stylists',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${kaiseiTokumin.variable}`}
    >
      <body className="font-poppins antialiased">
        {children}
      </body>
    </html>
  );
}
