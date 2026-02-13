'use client'

import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { getCategory } from '@/shared/lib/api'
import type { CategoryPageResult } from '@/shared/types/category'
import { PageLoading } from '@/shared/components/PageLoading'
import { HomeNavbar } from '@/features/home/components/HomeNavbar'
import { MovieRow } from '@/features/home/components/MovieRow'
import { useHomeNavigation } from '@/features/home/hooks/useHomeNavigation'

export default function CategoryPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = typeof params.slug === 'string' ? params.slug : ''
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)

  const fetcher = async () => {
    if (!slug) return null
    const result = await getCategory(slug, page).catch(() => null)
    return result as CategoryPageResult | null
  }

  const { data: result, isLoading } = useSWR<CategoryPageResult | null>(
    slug ? `category-${slug}-${page}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
      errorRetryCount: 2,
    }
  )

  const categoryData = result?.data ?? []
  const pagination = result?.pagination

  const { getFocusedMovieRef, isFocused } = useHomeNavigation({
    homepageData: categoryData.length > 0 ? categoryData : null,
  })

  const buildPageUrl = (p: number) => (p === 1 ? `/category/${slug}` : `/category/${slug}?page=${p}`)

  if (!slug) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
        <p className="text-white/90 text-lg sm:text-xl">Invalid category</p>
      </div>
    )
  }

  if (isLoading) {
    return <PageLoading message="Đang tải danh mục..." />
  }

  return (
    <div className="min-h-screen bg-black">
      <HomeNavbar />
      <div className="pb-16 pt-8">
        {categoryData.length > 0 ? (
          categoryData.map((category, rowIndex) => (
            <MovieRow
              key={category.title}
              title={category.title}
              movies={category.data}
              rowIndex={rowIndex}
              isScroll={false}
              getFocusedMovieRef={getFocusedMovieRef}
              isFocused={isFocused}
            />
          ))
        ) : (
          <div className="flex items-center justify-center py-24">
            <p className="text-gray-400 text-lg">Chưa có nội dung cho danh mục này.</p>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <nav
            className="flex items-center justify-center gap-2 py-8 px-4"
            aria-label="Phân trang bài viết"
          >
            <div className="flex flex-wrap items-center justify-center gap-1">
              {pagination.prevPage != null ? (
                <Link
                  href={buildPageUrl(pagination.prevPage)}
                  className="px-3 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded transition"
                >
                  Trước
                </Link>
              ) : (
                <span className="px-3 py-2 text-sm text-gray-500 cursor-not-allowed">Trước</span>
              )}

              {pagination.currentPage > 2 && (
                <>
                  <Link
                    href={buildPageUrl(1)}
                    className="px-3 py-2 text-sm font-medium text-white hover:bg-white/20 rounded transition"
                  >
                    1
                  </Link>
                  {pagination.currentPage > 3 && <span className="px-2 text-gray-500">…</span>}
                </>
              )}

              {pagination.prevPage != null && pagination.prevPage >= 1 && (
                <Link
                  href={buildPageUrl(pagination.prevPage)}
                  className="px-3 py-2 text-sm font-medium text-white hover:bg-white/20 rounded transition"
                >
                  {pagination.prevPage}
                </Link>
              )}
              <span
                className="px-3 py-2 text-sm font-medium bg-red-600 text-white rounded"
                aria-current="page"
              >
                {pagination.currentPage}
              </span>
              {pagination.nextPage != null && pagination.nextPage <= pagination.totalPages && (
                <Link
                  href={buildPageUrl(pagination.nextPage)}
                  className="px-3 py-2 text-sm font-medium text-white hover:bg-white/20 rounded transition"
                >
                  {pagination.nextPage}
                </Link>
              )}

              {pagination.currentPage < pagination.totalPages - 1 && (
                <>
                  {pagination.currentPage < pagination.totalPages - 2 && (
                    <span className="px-2 text-gray-500">…</span>
                  )}
                  <Link
                    href={buildPageUrl(pagination.totalPages)}
                    className="px-3 py-2 text-sm font-medium text-white hover:bg-white/20 rounded transition"
                  >
                    {pagination.totalPages}
                  </Link>
                </>
              )}

              {pagination.nextPage != null ? (
                <Link
                  href={buildPageUrl(pagination.nextPage)}
                  className="px-3 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded transition"
                >
                  Tiếp theo
                </Link>
              ) : (
                <span className="px-3 py-2 text-sm text-gray-500 cursor-not-allowed">Tiếp theo</span>
              )}
            </div>
          </nav>
        )}
      </div>
    </div>
  )
}
