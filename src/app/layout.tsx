import React from 'react';
import Header from '@/widgets/Header/ui/Header';
import Footer from '@/widgets/Footer/ui/Footer';
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import CookieConsent from '@/widgets/CookieConsent/ui/CookieConsent';
import { Metadata } from 'next';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: 'PANDA WEAR - Магазин модной одежды в Барнауле',
    template: '%s - PANDA WEAR',
  },
  description: "Широкий выбор современной и модной одежды в Барнауле на Попова, 82 (ТЦ Малина). Вырази свой уникальный стиль с PANDA WEAR!",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): React.ReactElement {
  return (
    <html lang="ru" className='light'>
      <head>
        {/* Компонент YandexMetrika временно отключен */}
      </head>
      <body className={inter.className}>
        <Providers>
          <Header />
          {children}
          <CookieConsent />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}