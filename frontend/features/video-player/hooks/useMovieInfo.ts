import { useState, useEffect, useRef } from 'react'
import { getBluphimMovieInfo } from '@/shared/lib/api'
import { MovieInfo } from '../types/video'

interface UseMovieInfoParams {
  id: string
  episode: number
}

export function useMovieInfo({ id, episode }: UseMovieInfoParams) {
  const [movieInfo, setMovieInfo] = useState<MovieInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [isPlayerReady, setIsPlayerReady] = useState(false)
  const isMountedRef = useRef(true)
  const isChangingEpisodeRef = useRef(false)
  const playerRef = useRef<any>(null)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    const fetchMovieInfo = async () => {
      if (isChangingEpisodeRef.current) {
        return
      }

      try {
        isChangingEpisodeRef.current = true
        setLoading(true)
        setError(null)

        if (playerRef.current) {
          try {
            playerRef.current.getInternalPlayer()?.pause?.()
          } catch (e) {
            // Ignore pause errors
          }
        }

        setVideoUrl('')
        setIsPlayerReady(false)

        const info = await getBluphimMovieInfo(id, episode)
        if (info && isMountedRef.current) {
          setMovieInfo(info)

          await new Promise(resolve => setTimeout(resolve, 200))

          requestAnimationFrame(() => {
            if (isMountedRef.current && info.m3u8Url) {
              setVideoUrl(info.m3u8Url)
            }
          })
        } else if (isMountedRef.current) {
          setError('Không thể lấy thông tin phim')
        }
      } catch (err: any) {
        if (isMountedRef.current) {
          setError(err.message || 'Có lỗi xảy ra khi lấy thông tin phim')
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false)
        }
        isChangingEpisodeRef.current = false
      }
    }

    if (id) {
      fetchMovieInfo()
    }

    return () => {
      setVideoUrl('')
      setIsPlayerReady(false)
      isChangingEpisodeRef.current = false
    }
  }, [id, episode])

  return {
    movieInfo,
    loading,
    error,
    videoUrl,
    isPlayerReady,
    setIsPlayerReady,
    playerRef,
  }
}
