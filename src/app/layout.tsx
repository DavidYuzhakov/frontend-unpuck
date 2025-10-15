import { Providers } from '@/components/providers'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Unpacker Clone - Marketplace Platform',
  description: 'Современная платформа для продавцов и блогеров',
  keywords: 'marketplace, advertising, wildberries, telegram, referrals, mobile, twa',
  authors: [{ name: 'Unpacker Clone Team' }],
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Unpacker Clone',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        {/* Telegram WebApp Script */}
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Initialize Telegram WebApp with retry logic
              (function() {
                function initTWA() {
                  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
                    const tg = window.Telegram.WebApp;
                    console.log('🚀 Layout: Инициализируем TWA');
                    tg.ready();
                    tg.expand();
                    tg.enableClosingConfirmation();
                    console.log('✅ Layout: TWA инициализирован');
                  } else {
                    console.log('🔄 Layout: TWA не найден, повторяем через 100ms');
                    setTimeout(initTWA, 100);
                  }
                }
                
                // Запускаем инициализацию
                initTWA();
              })();
            `,
          }}
        />
      </head>
      <body 
        className={`${inter.variable} font-sans antialiased`} 
        suppressHydrationWarning
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
