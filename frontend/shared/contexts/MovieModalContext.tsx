'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { Movie } from '@/shared/types/movie'

interface MovieModalContextType {
  selectedMovie: Movie | null
  isOpen: boolean
  openModal: (movie: Movie) => void
  closeModal: () => void
}

const MovieModalContext = createContext<MovieModalContextType | undefined>(undefined)

export function MovieModalProvider({ children }: { children: ReactNode }) {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const openModal = (movie: Movie) => {
    setSelectedMovie(movie)
    setIsOpen(true)
    document.body.style.overflow = 'hidden' // Prevent background scrolling
  }

  const closeModal = () => {
    setIsOpen(false)
    setSelectedMovie(null)
    document.body.style.overflow = 'unset'
  }

  return (
    <MovieModalContext.Provider value={{ selectedMovie, isOpen, openModal, closeModal }}>
      {children}
    </MovieModalContext.Provider>
  )
}

export function useMovieModal() {
  const context = useContext(MovieModalContext)
  if (context === undefined) {
    throw new Error('useMovieModal must be used within a MovieModalProvider')
  }
  return context
}
