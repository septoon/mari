import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';

import { YandexMetrika } from '@/components/analytics/yandex-metrika';
import { PwaRegister } from '@/components/pwa-register';
import { defaultMetaImage, siteConfig, siteImageUrl, siteSeoConfig, siteUrl } from '@/lib/site';

import './globals.css';

const serif = Cormorant_Garamond({
  variable: '--font-display',
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
});

const sans = Manrope({
  variable: '--font-body',
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800'],
});

const themeColor = '#245e63';
const yandexMetrikaId = Number(process.env.YANDEX_METRIKA_ID);

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteSeoConfig.home.title,
    template: '%s | МАРИ',
  },
  description: siteConfig.description,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  manifest: '/manifest.webmanifest',
  applicationName: 'МАРИ Салон Красоты',
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'МАРИ',
  },
  openGraph: {
    title: 'МАРИ Салон Красоты',
    description: siteConfig.description,
    url: siteUrl,
    siteName: 'МАРИ Салон Красоты',
    locale: 'ru_RU',
    type: 'website',
    images: [defaultMetaImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'МАРИ Салон Красоты',
    description: siteConfig.description,
    images: [siteImageUrl],
  },
  icons: {
    icon: [
      { url: '/app-icon.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/app-icon.png',
    apple: [{ url: '/app-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  themeColor,
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru-RU">
      <body
        suppressHydrationWarning
        className={`${sans.variable} ${serif.variable} font-sans antialiased`}>
        <YandexMetrika
          metrikaId={
            Number.isFinite(yandexMetrikaId) && yandexMetrikaId > 0 ? yandexMetrikaId : undefined
          }
        />
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
