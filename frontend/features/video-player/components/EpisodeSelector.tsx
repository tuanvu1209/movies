import { useEffect, useRef } from 'react'
import { MovieInfo } from '../types/video'

interface EpisodeSelectorProps {
  movieInfo: MovieInfo
  selectedEpisode: number
  highlightedEpisode?: number
  showEpisodeSelector: boolean
  onEpisodeChange: (episode: number) => void
  onClose: () => void
}

export function EpisodeSelector({
  movieInfo,
  selectedEpisode,
  highlightedEpisode,
  showEpisodeSelector,
  onEpisodeChange,
  onClose,
}: EpisodeSelectorProps) {
  const episodes = movieInfo.episodes || []
  const totalEpisodes = episodes.length
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const selectedEpisodeRef = useRef<HTMLButtonElement>(null)
  const highlightedEpisodeRef = useRef<HTMLButtonElement>(null)
  const episodeToHighlight = highlightedEpisode ?? selectedEpisode

  // Auto-scroll to highlighted episode when it changes
  useEffect(() => {
    if (showEpisodeSelector && highlightedEpisodeRef.current && scrollContainerRef.current) {
      // Wait for the slide-in animation to complete (300ms) before scrolling
      const timeoutId = setTimeout(() => {
        if (highlightedEpisodeRef.current && scrollContainerRef.current) {
          const container = scrollContainerRef.current
          const button = highlightedEpisodeRef.current
          
          // Calculate scroll position to center the highlighted episode
          const containerRect = container.getBoundingClientRect()
          const buttonRect = button.getBoundingClientRect()
          const scrollTop = container.scrollTop
          const buttonTop = buttonRect.top - containerRect.top + scrollTop
          const buttonHeight = buttonRect.height
          const containerHeight = containerRect.height
          
          // Center the button in the container
          const targetScroll = buttonTop - (containerHeight / 2) + (buttonHeight / 2)
          
          container.scrollTo({
            top: targetScroll,
            behavior: 'smooth',
          })
        }
      }, 350) // Slightly longer than the 300ms transition

      return () => clearTimeout(timeoutId)
    }
  }, [showEpisodeSelector, episodeToHighlight])

  if (totalEpisodes === 0) {
    return null
  }

  return (
    <>
      {showEpisodeSelector && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-96 bg-black/95 backdrop-blur-md z-50 transform transition-transform duration-300 ease-in-out border-l border-white/20 shadow-2xl ${
          showEpisodeSelector ? 'translate-x-0' : 'translate-x-full'
        } ${!showEpisodeSelector ? 'pointer-events-none' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white text-2xl font-bold">Danh sách tập</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-400 text-sm">
              {totalEpisodes} tập • Đang xem tập {selectedEpisode}
            </p>
          </div>

          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto p-4"
          >
            <div className="space-y-2">
              {episodes.map((ep) => {
                const isSelected = ep.episode === selectedEpisode
                const isHighlighted = ep.episode === episodeToHighlight
                
                return (
                  <button
                    key={ep.episode}
                    ref={
                      isSelected 
                        ? selectedEpisodeRef 
                        : isHighlighted 
                        ? highlightedEpisodeRef 
                        : null
                    }
                    onClick={() => {
                      onEpisodeChange(ep.episode)
                      onClose()
                    }}
                    className={`
                      w-full p-4 rounded-lg transition-all duration-200 text-left
                      ${
                        isSelected
                          ? 'bg-red-600 text-white shadow-lg shadow-red-600/50'
                          : isHighlighted
                          ? 'bg-white/20 text-white ring-2 ring-white/50'
                          : 'bg-white/5 text-white hover:bg-white/10'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`
                          w-10 h-10 rounded-md flex items-center justify-center font-semibold text-sm
                          ${
                            isSelected
                              ? 'bg-white/20'
                              : isHighlighted
                              ? 'bg-white/15'
                              : 'bg-white/10'
                          }
                        `}
                      >
                        {ep.episode}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          Tập {ep.episode}
                          {isSelected && (
                            <span className="ml-2 text-xs opacity-80">• Đang phát</span>
                          )}
                        </p>
                        {ep.title && ep.title.length < 100 && (
                          <p
                            className={`text-sm mt-1 ${
                              isSelected ? 'opacity-90' : isHighlighted ? 'opacity-75' : 'opacity-60'
                            }`}
                          >
                            {ep.title.replace(/<[^>]*>/g, '').substring(0, 50)}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
