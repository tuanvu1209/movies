import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import 'antd/dist/reset.css'
import './globals.css'
import { Providers } from '@/components/Providers'
import { DocumentTitle } from '@/components/DocumentTitle'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BinPhim - Trang chủ',
  description: 'Xem phim online siêu nét',
  icons: { icon: '/logo.png' },
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
          <DocumentTitle />
          {children}
        </Providers>
      </body>
    </html>
  )
}
