import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface UseVideoControlsParams {
  playerRef: React.RefObject<any>
  selectedEpisode: number
  totalEpisodes: number
  onEpisodeChange: (episode: number) => void
}

export function useVideoControls({ 
  playerRef, 
  selectedEpisode, 
  totalEpisodes,
  onEpisodeChange 
}: UseVideoControlsParams) {
  const router = useRouter()
  const [showControls, setShowControls] = useState(false)
  const [showEpisodeSelector, setShowEpisodeSelector] = useState(false)
  const [highlightedEpisode, setHighlightedEpisode] = useState(selectedEpisode)
  const mouseTimeoutRef = useRef<number | null>(null)
  const showEpisodeSelectorRef = useRef(false)

  useEffect(() => {
    showEpisodeSelectorRef.current = showEpisodeSelector
  }, [showEpisodeSelector])

  // Reset highlighted episode when selected episode changes
  useEffect(() => {
    setHighlightedEpisode(selectedEpisode)
  }, [selectedEpisode])

  useEffect(() => {
    return () => {
      if (mouseTimeoutRef.current) {
        clearTimeout(mouseTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      // Ignore keyboard events when typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement)?.isContentEditable
      ) {
        return
      }

      const player = playerRef.current?.getInternalPlayer?.()

      switch (event.key) {
        case 'Escape':
          event.preventDefault()
          if (showEpisodeSelector) {
            setShowEpisodeSelector(false)
          } else {
            // Back to home when Escape is pressed and episode selector is closed
            router.push('/')
          }
          break

        case 'Backspace':
          event.preventDefault()
          if (showEpisodeSelector) {
            // Close episode selector if open
            setShowEpisodeSelector(false)
          } else {
            // Back to home when episode selector is closed
            router.push('/')
          }
          break

        case ' ': // Space bar
          event.preventDefault()
          if (showEpisodeSelector) {
            // If episode selector is open, select highlighted episode
            onEpisodeChange(highlightedEpisode)
            setShowEpisodeSelector(false)
          } else if (player) {
            // Otherwise, play/pause
            if (player.paused) {
              player.play().catch(() => {})
            } else {
              player.pause()
            }
            setShowControls(true)
            if (mouseTimeoutRef.current) {
              clearTimeout(mouseTimeoutRef.current)
            }
            mouseTimeoutRef.current = window.setTimeout(() => {
              if (!showEpisodeSelectorRef.current) {
                setShowControls(false)
              }
            }, 3000)
          }
          break

        case 'Enter':
          event.preventDefault()
          if (showEpisodeSelector && totalEpisodes > 0) {
            // Select highlighted episode
            onEpisodeChange(highlightedEpisode)
            setShowEpisodeSelector(false)
          }
          break

        case 'ArrowLeft':
          event.preventDefault()
          if (showEpisodeSelector) {
            // Navigate episodes when selector is open
            setHighlightedEpisode(prev => Math.max(1, prev - 1))
          } else if (player && typeof player.currentTime === 'number') {
            // Seek backward when selector is closed
            player.currentTime = Math.max(0, player.currentTime - 10)
            setShowControls(true)
            if (mouseTimeoutRef.current) {
              clearTimeout(mouseTimeoutRef.current)
            }
            mouseTimeoutRef.current = window.setTimeout(() => {
              if (!showEpisodeSelectorRef.current) {
                setShowControls(false)
              }
            }, 3000)
          }
          break

        case 'ArrowRight':
          event.preventDefault()
          if (showEpisodeSelector) {
            // Navigate episodes when selector is open
            setHighlightedEpisode(prev => Math.min(totalEpisodes, prev + 1))
          } else if (player && typeof player.currentTime === 'number' && typeof player.duration === 'number') {
            // Seek forward when selector is closed
            player.currentTime = Math.min(player.duration, player.currentTime + 10)
            setShowControls(true)
            if (mouseTimeoutRef.current) {
              clearTimeout(mouseTimeoutRef.current)
            }
            mouseTimeoutRef.current = window.setTimeout(() => {
              if (!showEpisodeSelectorRef.current) {
                setShowControls(false)
              }
            }, 3000)
          }
          break

        case 'ArrowUp':
          event.preventDefault()
          if (totalEpisodes > 0) {
            if (!showEpisodeSelector) {
              // Open episode selector if closed
              setShowEpisodeSelector(true)
              setHighlightedEpisode(selectedEpisode)
            } else {
              // Navigate up in episode selector
              setHighlightedEpisode(prev => Math.max(1, prev - 1))
            }
          }
          break

        case 'ArrowDown':
          event.preventDefault()
          if (totalEpisodes > 0) {
            if (!showEpisodeSelector) {
              // Open episode selector if closed
              setShowEpisodeSelector(true)
              setHighlightedEpisode(selectedEpisode)
            } else {
              // Navigate down in episode selector
              setHighlightedEpisode(prev => Math.min(totalEpisodes, prev + 1))
            }
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyboard)

    return () => {
      document.removeEventListener('keydown', handleKeyboard)
    }
  }, [playerRef, showEpisodeSelector, selectedEpisode, totalEpisodes, highlightedEpisode, onEpisodeChange, router])

  const handleMouseActivity = () => {
    setShowControls(true)
    if (mouseTimeoutRef.current) {
      clearTimeout(mouseTimeoutRef.current)
    }
    mouseTimeoutRef.current = window.setTimeout(() => {
      if (!showEpisodeSelectorRef.current) {
        setShowControls(false)
      }
    }, 3000)
  }

  return {
    showControls,
    showEpisodeSelector,
    setShowEpisodeSelector,
    handleMouseActivity,
    highlightedEpisode,
  }
}
