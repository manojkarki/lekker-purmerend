import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Lekker Purmerend - Huisgemaakte lekkernijen',
  description: 'Verse huisgemaakte taarten, koekjes en snacks uit Purmerend. Bestel online voor bezorging of ophalen.',
  keywords: 'taarten, koekjes, bakkerij, Purmerend, huisgemaakt, bezorging',
  authors: [{ name: 'Lekker Purmerend' }],
  creator: 'Lekker Purmerend',
  publisher: 'Lekker Purmerend',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#2563eb',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    title: 'Lekker Purmerend - Huisgemaakte lekkernijen',
    description: 'Verse huisgemaakte taarten, koekjes en snacks uit Purmerend. Bestel online voor bezorging of ophalen.',
    siteName: 'Lekker Purmerend',
    url: process.env.SITE_URL || 'http://localhost:3000',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lekker Purmerend - Huisgemaakte lekkernijen',
    description: 'Verse huisgemaakte taarten, koekjes en snacks uit Purmerend',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <div className="min-h-full">
          {children}
        </div>
      </body>
    </html>
  )
}