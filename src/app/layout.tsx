import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import '@/styles/globals.css'
import { TOKEN_SYMBOL } from '@/lib/constants'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: `Token Clicker Game`,
  description: `A fun clicking game where you earn ${TOKEN_SYMBOL} for hitting targets`,
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