import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Football Players',
  description: 'By Dijan & Tonito',
  generator: 'Dragonfly Manufacturies',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
