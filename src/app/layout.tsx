import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';

import { PwaRegister } from '@/components/pwa-register';

import './globals.css';

const serif = Cormorant_Garamond({
  variable: '--font-display',
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700']
});

const sans = Manrope({
  variable: '--font-body',
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800']
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'MARI Beauty Salon',
    template: '%s | MARI Beauty Salon'
  },
  description:
    'Салон красоты MARI: услуги, специалисты, цены, онлайн-запись и личный кабинет.',
  manifest: '/manifest.webmanifest',
  applicationName: 'MARI Beauty Salon',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MARI'
  },
  openGraph: {
    title: 'MARI Beauty Salon',
    description:
      'Салон красоты MARI: услуги, специалисты, цены, онлайн-запись и личный кабинет.',
    url: siteUrl,
    siteName: 'MARI Beauty Salon',
    locale: 'ru_RU',
    type: 'website'
  },
  icons: {
    icon: '/app-icon.svg',
    shortcut: '/app-icon.svg',
    apple: '/app-icon.svg'
  }
};

export const viewport: Viewport = {
  themeColor: '#8c7054',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body suppressHydrationWarning className={`${sans.variable} ${serif.variable} font-sans antialiased`}>
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
