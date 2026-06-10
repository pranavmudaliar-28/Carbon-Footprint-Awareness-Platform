import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';

import './globals.css';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Verda — Small steps. Lighter footprint.',
  description:
    'Understand, track, and reduce your carbon footprint with simple actions and personalized insights.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <head>
        {/* Apply saved theme before paint to avoid a flash (no-FOUC). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('verda-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        {/* Keyboard skip link — first focusable element (a11y). */}
        <a
          href="#main-content"
          className="sr-only-focusable focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-button focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-soft"
        >
          Skip to main content
        </a>
        <Providers>
          {children}
          <Toaster position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
