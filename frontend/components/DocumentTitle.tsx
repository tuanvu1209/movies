'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

const TITLE_MAP: Record<string, string> = {
  '/': 'Trang chủ',
  '/login': 'Đăng nhập',
  '/register': 'Đăng ký',
}

function getPageTitle(pathname: string): string {
  if (TITLE_MAP[pathname]) return TITLE_MAP[pathname]
  if (pathname.startsWith('/watch')) return 'Xem phim'
  if (pathname.startsWith('/category')) return 'Danh mục'
  return 'Trang chủ'
}

export function DocumentTitle() {
  const pathname = usePathname()

  useEffect(() => {
    const page = getPageTitle(pathname || '/')
    document.title = `BinPhim - ${page}`
  }, [pathname])

  return null
}
