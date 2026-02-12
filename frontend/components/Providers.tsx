'use client'

import { ConfigProvider } from 'antd'
import { AuthProvider } from '@/features/auth'
import { MovieModalProvider } from '@/shared'
import theme from '@/theme/antd-theme'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider theme={theme}>
      <AuthProvider>
        <MovieModalProvider>
          {children}
        </MovieModalProvider>
      </AuthProvider>
    </ConfigProvider>
  )
}
