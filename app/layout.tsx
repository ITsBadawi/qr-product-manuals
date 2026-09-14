import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    template: '%s | QR Manual Hub',
    default: 'QR Manual Hub - Permanent Product Manual System',
  },
  description:
    'Production-ready permanent QR code instruction manual management for warehouses, retailers, and manufacturers.',
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0b0f19',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#0b0f19] text-slate-100 selection:bg-indigo-500 selection:text-white">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
