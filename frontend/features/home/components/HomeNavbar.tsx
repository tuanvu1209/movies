'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/features/auth'
import { useRouter } from 'next/navigation'

export function HomeNavbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')


  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 bg-black`}
    >
      <div className="flex items-center justify-between px-4 sm:px-8 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="relative h-6 w-20 sm:h-8 sm:w-28 flex-shrink-0">
            <span className="text-red-600 text-3xl font-bold">BinPhim</span>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-white hover:text-gray-300 transition">
              Home
            </Link>
            <Link href="/" className="text-sm font-medium text-gray-300 hover:text-white transition">
              TV Shows
            </Link>
            <Link href="/" className="text-sm font-medium text-gray-300 hover:text-white transition">
              Movies
            </Link>
            <Link href="/" className="text-sm font-medium text-gray-300 hover:text-white transition">
              New & Popular
            </Link>
            <Link href="/" className="text-sm font-medium text-gray-300 hover:text-white transition">
              My List
            </Link>
            <Link href="/" className="text-sm font-medium text-gray-300 hover:text-white transition">
              Browse by Languages
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            {showSearch ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Titles, people, genres"
                  className="bg-black/80 border border-white/30 px-4 py-1.5 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:border-white/60 transition w-64"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setShowSearch(false)
                    setSearchQuery('')
                  }}
                  className="text-white hover:text-gray-300 transition"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="text-white hover:text-gray-300 transition"
                aria-label="Search"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            )}
          </div>

          <button
            className="text-white hover:text-gray-300 transition hidden sm:block"
            aria-label="Notifications"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>

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
    </nav>
  )
}
