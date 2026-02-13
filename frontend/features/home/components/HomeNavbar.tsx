'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Dropdown, Input } from 'antd'
import type { MenuProps } from 'antd'
import { DownOutlined, SearchOutlined } from '@ant-design/icons'
import { useAuth } from '@/features/auth'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { getNav, getSearch } from '@/shared/lib/api'
import type { NavItem } from '@/shared/types/nav'
import type { SearchResult } from '@/shared/types/search'

const NAV_FETCHER = async () => {
  const data = await getNav().catch(() => [])
  return data as NavItem[]
}

const SEARCH_DEBOUNCE_MS = 300

/** Lấy slug từ url (vd: https://bluphim.me/phim-bo/ -> phim-bo) */
function getSlugFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname.replace(/^\/|\/$/g, '')
    return path || ''
  } catch {
    return ''
  }
}

function isHomeUrl(url: string): boolean {
  const slug = getSlugFromUrl(url)
  return !slug || slug === ''
}

export function HomeNavbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  useEffect(() => {
    if (!searchQuery.trim()) {
      setDebouncedQuery('')
      return
    }
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [searchQuery])

  const searchKey = useMemo(
    () => (debouncedQuery.length >= 2 ? `search-${debouncedQuery}` : null),
    [debouncedQuery]
  )

  const { data: searchSuggestions = [], isValidating: searchLoading } = useSWR<SearchResult[]>(
    searchKey,
    () => getSearch(debouncedQuery),
    { revalidateOnFocus: false, dedupingInterval: 5000, keepPreviousData: true }
  )

  const showSuggest = searchQuery.trim().length >= 2

  const { data: navItems = [] } = useSWR<NavItem[]>('nav', NAV_FETCHER, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  })

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <nav className="w-full z-50 transition-all duration-300 bg-black border-b border-white/10">
      {/* Hàng trên: Logo + Search + User */}
      <div className="flex items-center justify-between gap-4 px-4 sm:px-8 py-3">
        <Link href="/" className="relative h-16 w-16 flex-shrink-0 block">
          <Image src="/logo.png" alt="Logo" fill className="object-cover" />
        </Link>

        <div className="relative flex-1 max-w-xl">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm"
            allowClear
            suffix={<SearchOutlined className="text-white/50" />}
            className="[&_.ant-input]:bg-white/10 [&_.ant-input]:border-white/20 [&_.ant-input]:text-white [&_.ant-input]:placeholder:text-gray-400 [&_.ant-input:hover]:border-white/30 [&_.ant-input-focused]:border-white/40 [&_.ant-input]:rounded-full [&_.ant-input-clear-icon]:text-white/70 [&_.ant-input-clear-icon:hover]:text-white [&_.ant-input-suffix]:ml-2"
          />
          {showSuggest && (
            <div className="absolute left-0 right-0 top-full mt-1 max-h-80 overflow-y-auto bg-black border border-white/20 rounded-lg shadow-xl z-[100]">
              {searchLoading ? (
                <div className="px-4 py-3 text-sm text-gray-400">Đang tìm...</div>
              ) : searchSuggestions.length > 0 ? (
                <ul className="py-2">
                  {searchSuggestions.map((item) => (
                    <li key={item.url}>
                      <Link
                        href={`/watch/${item.url}`}
                        onClick={() => setSearchQuery('')}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 transition text-left"
                      >
                        {item.thumbnail ? (
                          <div className="w-10 h-14 relative flex-shrink-0 rounded overflow-hidden bg-gray-800">
                            <Image
                              src={item.thumbnail}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-14 flex-shrink-0 rounded bg-gray-800" />
                        )}
                        <span className="text-white text-sm truncate flex-1">{item.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-3 text-sm text-gray-400">Không tìm thấy</div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {user ? (
            <div className="relative group">
              <button className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-purple-600 flex items-center justify-center text-white font-semibold">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <svg
                  className="w-4 h-4 text-white hidden sm:block"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div className="absolute right-0 top-full mt-2 w-48 bg-black/95 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-2">
                  <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
                    {user?.name || user?.email}
                  </div>
                  <Link
                    href="/"
                    className="block px-4 py-2 text-sm text-white hover:bg-gray-800 transition"
                  >
                    Account
                  </Link>
                  <Link
                    href="/"
                    className="block px-4 py-2 text-sm text-white hover:bg-gray-800 transition"
                  >
                    Help Center
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-800 transition"
                  >
                    Sign out of Netflix
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm font-medium"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Hàng dưới: Nav */}
      <div className="border-t border-white/10">
        <div className="flex flex-wrap items-center justify-center gap-6 px-4 sm:px-8 py-3">
          {navItems.map((item) => {
            if (item.children?.length) {
              const menuItems: MenuProps['items'] = item.children
                .map((child) => {
                  const slug = getSlugFromUrl(child.url)
                  if (!slug) return null
                  return {
                    key: slug,
                    label: <Link href={`/category/${slug}`}>{child.title}</Link>,
                  }
                })
                .filter(Boolean) as MenuProps['items']
              return (
                <Dropdown
                  key={item.title}
                  menu={{ items: menuItems }}
                  trigger={['hover']}
                  placement="bottom"
                  overlayClassName="nav-dropdown-overlay"
                  dropdownRender={(menuNode) => (
                    <div className="nav-dropdown-wrap min-w-[180px] rounded-lg shadow-xl border border-white/10 overflow-hidden bg-[#1a1a1a]">
                      <div className="px-3 py-2 border-b border-white/10 text-xs font-semibold text-white/70 uppercase tracking-wide">
                        {item.title}
                      </div>
                      {menuNode}
                    </div>
                  )}
                >
                  <button className="text-sm font-semibold text-white uppercase tracking-wide hover:text-gray-300 transition flex items-center gap-1 py-1">
                    {item.title}
                    <DownOutlined className="text-[10px]" />
                  </button>
                </Dropdown>
              )
            }
            if (isHomeUrl(item.url)) {
              return (
                <Link
                  key={item.title}
                  href="/"
                  className="text-sm font-semibold text-white uppercase tracking-wide hover:text-gray-300 transition"
                >
                  {item.title}
                </Link>
              )
            }
            const slug = getSlugFromUrl(item.url)
            if (!slug) return null
            return (
              <Link
                key={item.title}
                href={`/category/${slug}`}
                className="text-sm font-semibold text-white uppercase tracking-wide hover:text-gray-300 transition"
              >
                {item.title}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
