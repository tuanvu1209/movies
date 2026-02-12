import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { HomepageData } from '@/shared/types/homepage'

interface UseHomeNavigationParams {
  homepageData: HomepageData | null
}

export function useHomeNavigation({ homepageData }: UseHomeNavigationParams) {
  const router = useRouter()
  const [focusedRowIndex, setFocusedRowIndex] = useState(0)
  const [focusedMovieIndex, setFocusedMovieIndex] = useState(0)
  const focusedMovieRef = useRef<HTMLDivElement | null>(null)

  // Reset focus when homepage data changes and ensure first item is focused
  useEffect(() => {
    if (homepageData && homepageData.length > 0) {
      const firstRow = homepageData[0]
      if (firstRow && firstRow.data.length > 0) {
        setFocusedRowIndex(0)
        setFocusedMovieIndex(0)
        // Clear ref to force re-attachment
        focusedMovieRef.current = null
      }
    }
  }, [homepageData])

  // Scroll to focused movie
  useEffect(() => {
    if (!focusedMovieRef.current) return

    // Use setTimeout to ensure DOM is updated
    const timeoutId = setTimeout(() => {
      if (!focusedMovieRef.current) return

      // Find the parent scroll container (the row container) for horizontal scroll
      let scrollContainer = focusedMovieRef.current.parentElement
      while (scrollContainer) {
        const style = window.getComputedStyle(scrollContainer)
        if (style.overflowX === 'scroll' || style.overflowX === 'auto') {
          break
        }
        scrollContainer = scrollContainer.parentElement
      }

      if (scrollContainer) {
        // Scroll the container horizontally to center the focused movie
        const movieRect = focusedMovieRef.current.getBoundingClientRect()
        const containerRect = scrollContainer.getBoundingClientRect()
        const scrollLeft = scrollContainer.scrollLeft
        const movieLeft = movieRect.left - containerRect.left + scrollLeft
        const movieWidth = movieRect.width
        const containerWidth = containerRect.width
        const targetScroll = movieLeft - (containerWidth / 2) + (movieWidth / 2)

        scrollContainer.scrollTo({
          left: Math.max(0, targetScroll),
          behavior: 'smooth',
        })
      }

      // Also scroll the page vertically to show the focused row
      const movieRect = focusedMovieRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const movieTop = movieRect.top
      const movieBottom = movieRect.bottom
      const movieHeight = movieRect.height

      // Check if movie is outside viewport
      if (movieTop < 0) {
        // Movie is above viewport, scroll up
        window.scrollTo({
          top: window.scrollY + movieTop - 100, // 100px padding from top
          behavior: 'smooth',
        })
      } else if (movieBottom > viewportHeight) {
        // Movie is below viewport, scroll down
        window.scrollTo({
          top: window.scrollY + (movieBottom - viewportHeight) + 100, // 100px padding from bottom
          behavior: 'smooth',
        })
      } else {
        // Try to center the movie vertically in viewport
        const targetScroll = window.scrollY + movieTop - (viewportHeight / 2) + (movieHeight / 2)
        window.scrollTo({
          top: Math.max(0, targetScroll),
          behavior: 'smooth',
        })
      }
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [focusedRowIndex, focusedMovieIndex, homepageData])

  useEffect(() => {
    if (!homepageData || homepageData.length === 0) {
      return
    }

    const handleKeyboard = (event: KeyboardEvent) => {
      // Ignore keyboard events when typing in input fields
      const target = event.target as HTMLElement
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable ||
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA'
      ) {
        return
      }

      const currentRow = homepageData[focusedRowIndex]
      if (!currentRow || currentRow.data.length === 0) return
      
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault()
          event.stopPropagation()
          // Move to previous row
          if (focusedRowIndex > 0) {
            const prevRow = homepageData[focusedRowIndex - 1]
            const newMovieIndex = Math.min(
              focusedMovieIndex,
              prevRow.data.length - 1
            )
            setFocusedRowIndex(focusedRowIndex - 1)
            setFocusedMovieIndex(newMovieIndex)
          }
          break

        case 'ArrowDown':
          event.preventDefault()
          event.stopPropagation()
          // Move to next row
          if (focusedRowIndex < homepageData.length - 1) {
            const nextRow = homepageData[focusedRowIndex + 1]
            const newMovieIndex = Math.min(
              focusedMovieIndex,
              nextRow.data.length - 1
            )
            setFocusedRowIndex(focusedRowIndex + 1)
            setFocusedMovieIndex(newMovieIndex)
          }
          break

        case 'ArrowLeft':
          event.preventDefault()
          event.stopPropagation()
          // Move to previous movie in current row
          if (focusedMovieIndex > 0) {
            setFocusedMovieIndex(focusedMovieIndex - 1)
          }
          break

        case 'ArrowRight':
          event.preventDefault()
          event.stopPropagation()
          // Move to next movie in current row
          if (focusedMovieIndex < currentRow.data.length - 1) {
            setFocusedMovieIndex(focusedMovieIndex + 1)
          }
          break

        case 'Enter':
          event.preventDefault()
          event.stopPropagation()
          // Navigate to selected movie
          const selectedMovie = currentRow.data[focusedMovieIndex]
          if (selectedMovie?.url) {
            router.push(`/watch/${selectedMovie.url}`)
          }
          break
      }
    }

    // Use capture phase to catch events early
    document.addEventListener('keydown', handleKeyboard, true)

    return () => {
      document.removeEventListener('keydown', handleKeyboard, true)
    }
  }, [homepageData, focusedRowIndex, focusedMovieIndex, router])

  const getFocusedMovieRef = useCallback((rowIndex: number, movieIndex: number) => {
    const isMatch = rowIndex === focusedRowIndex && movieIndex === focusedMovieIndex
    if (isMatch) {
      return (ref: HTMLDivElement | null) => {
        if (ref) {
          focusedMovieRef.current = ref
        }
      }
    }
    return undefined
  }, [focusedRowIndex, focusedMovieIndex])

  const isFocused = useCallback((rowIndex: number, movieIndex: number) => {
    return rowIndex === focusedRowIndex && movieIndex === focusedMovieIndex
  }, [focusedRowIndex, focusedMovieIndex])

  return {
    focusedRowIndex,
    focusedMovieIndex,
    getFocusedMovieRef,
    isFocused,
  }
}
