import type { Metadata } from 'next'
import './globals.css'
import LayoutContent from '@/components/layout-content'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata: Metadata = {
  title: 'Dashboard App',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LayoutContent>{children}</LayoutContent>
        </ThemeProvider>
      </body>
    </html>
  )
}
