import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: `Vibe Shooter`,
  description: `A fun shooting game where you earn USDC for hitting targets`,
  openGraph: {
    title: `Vibe Shooter`,
    description: `A fun shooting game where you earn USDC for hitting targets`,
    url: '/',
    siteName: 'Vibe Shooter',
    type: 'website',
    images: [
      { url: '/screenshot.png', width: 1200, height: 630, alt: 'Vibe Shooter — earn USDC for hitting targets' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Vibe Shooter`,
    description: `A fun shooting game where you earn USDC for hitting targets`,
    images: ['/screenshot.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
} 