import React from "react"
import Providers from "./provider"

import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { MarketProvider } from '@/contexts/market-context'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'



const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Private Markets | Aleo',
  description: 'Privacy-first prediction markets built on Aleo blockchain',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {


  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <Providers>
        <MarketProvider>
          {children}
          <Toaster />
        </MarketProvider>
        <Analytics />
        </Providers>
      </body>
    </html>
  )
}
