import type { Metadata } from 'next'
import './globals.css'
import LayoutContent from '@/components/layout-content'

export const metadata: Metadata = {
  title: 'Dashboard App',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  )
}
