'use client'

import { getBluphimHomepage } from '@/shared/lib/api'
import { HomepageData } from '@/shared/types/homepage'
import useSWR from 'swr'
import { HomeNavbar } from './HomeNavbar'
import { MovieRow } from './MovieRow'
import { useHomeNavigation } from '../hooks/useHomeNavigation'

const fetcher = async () => {
  const data = await getBluphimHomepage().catch(() => null)
  return data
}

export function HomePage() {
  const { data: homepageData, isLoading: loadingMovies } = useSWR<HomepageData | null>(
    'homepage',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // Cache for 1 minute
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  )

  const { getFocusedMovieRef, isFocused } = useHomeNavigation({ homepageData: homepageData || null })

  if (loadingMovies) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <HomeNavbar />
      <div className="pb-16 pt-16">
        {homepageData &&
          homepageData.map((category, rowIndex) => (
            <MovieRow
              key={category.title}
              title={category.title}
              movies={category.data}
              rowIndex={rowIndex}
              getFocusedMovieRef={getFocusedMovieRef}
              isFocused={isFocused}
            />
          ))}
      </div>
    </div>
  )
}
