'use client'

import { useRef, useMemo, useCallback, memo } from 'react'
import Image from 'next/image'
import { Movie } from '@/shared/types/movie'
import { HomepageMovie } from '@/shared/types/homepage'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { useRouter } from 'next/navigation'

type MovieRowItem = Movie | HomepageMovie

interface MovieRowProps {
  title: string
  movies: MovieRowItem[]
  rowIndex: number
  /** true = horizontal scroll (homepage), false = grid layout (category) */
  isScroll?: boolean
  getFocusedMovieRef?: (rowIndex: number, movieIndex: number) => ((ref: HTMLDivElement | null) => void) | undefined
  isFocused?: (rowIndex: number, movieIndex: number) => boolean
}

function MovieRowComponent({ title, movies, rowIndex, isScroll = true, getFocusedMovieRef, isFocused }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current
      const scrollTo =
        direction === 'left'
          ? scrollLeft - clientWidth
          : scrollLeft + clientWidth
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' })
    }
  }, [])

  const handleMovieClick = useCallback((url: string) => {
    router.push(`/watch/${url}`)
  }, [router])

  const scrollLeft = useCallback(() => scroll('left'), [scroll])
  const scrollRight = useCallback(() => scroll('right'), [scroll])

  const processedMovies = useMemo(() => {
    return movies.map((movie) => {
      let viewCount: number = 0
      if (typeof movie.viewCount === 'number') {
        viewCount = movie.viewCount
      } else if (typeof movie.viewCount === 'string' && movie.viewCount) {
        const numStr = movie.viewCount.replace(/[K]/g, '')
        const num = parseFloat(numStr)
        viewCount = isNaN(num) ? 0 : num * (movie.viewCount.includes('K') ? 1000 : 1)
      }
      return {
        ...movie,
        viewCount,
        episode: movie.episode || '',
        url: movie?.url || '',
        movieId: 'id' in movie ? movie.id : movie.url,
        quality: movie.quality || '',
      }
    })
  }, [movies])

  if (movies.length === 0) {
    return null
  }

  const cardContent = (movie: typeof processedMovies[0], index: number) => {
    const focused = isFocused ? isFocused(rowIndex, index) : false
    const refCallback = getFocusedMovieRef ? getFocusedMovieRef(rowIndex, index) : undefined
    return (
      <div
        key={movie.movieId}
        ref={refCallback}
        onClick={() => handleMovieClick(movie.url)}
        tabIndex={focused ? 0 : -1}
        className={`relative group/item flex flex-col overflow-hidden rounded cursor-pointer transition-all duration-200 ${isScroll ? 'flex-shrink-0 w-[202px]' : ''}`}
      >
        <div className={`relative overflow-hidden rounded ${isScroll ? 'w-[200px] h-[300px] mx-2 my-2' : 'w-full aspect-[2/3]'}`} style={{ outline: focused ? '2px solid #ff00fb' : 'none', margin: isScroll ? '2px' : 0 }}>
          <Image
            src={movie.thumbnail}
            alt={movie.title}
            width={200}
            height={300}
            className="object-cover rounded transition group-hover/item:scale-110 w-full h-full"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
          {movie.viewCount > 0 && (
            <span className="absolute bottom-2 left-2 p-2 bg-black/60 text-white text-xs font-semibold rounded">
              {movie.viewCount} views
            </span>
          )}
          {movie.episode && (
            <span className="absolute bottom-2 right-2 p-2 bg-green-500 text-white text-xs font-semibold rounded">
              {movie.episode}
            </span>
          )}
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/30 transition" />

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {movie.quality && (
            <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-semibold rounded">
              {movie.quality}
            </span>
          )}
        </div>

        <div className="p-2">
          <p className="text-white text-sm font-semibold truncate w-full max-w-[200px]">
            {movie.title}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 px-8">{title}</h2>
      <div className="relative group">
        {isScroll && (
          <>
            <FaChevronLeft
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-white bg-black/50 rounded-full p-2 w-10 h-10 cursor-pointer opacity-0 group-hover:opacity-100 transition"
              onClick={scrollLeft}
            />
            <FaChevronRight
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-white bg-black/50 rounded-full p-2 w-10 h-10 cursor-pointer opacity-0 group-hover:opacity-100 transition"
              onClick={scrollRight}
            />
          </>
        )}
        <div
          ref={rowRef}
          className={`px-8 ${isScroll ? 'flex gap-4 overflow-x-scroll scrollbar-hide' : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'}`}
        >
          {processedMovies.map((movie, index) => cardContent(movie, index))}
        </div>
      </div>
    </div>
  )
}

export const MovieRow = memo(MovieRowComponent)
