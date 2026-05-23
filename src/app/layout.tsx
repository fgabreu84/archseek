import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'ARCHSEEK — Discover Architecture Around the World',
  description: 'Explore incredible architectural works around the world with map pins, historical facts, and expert curation.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full overflow-hidden antialiased`}>
      <body className="h-full flex flex-col bg-white text-neutral-900 overflow-hidden">
        {children}
      </body>
    </html>
  )
}
