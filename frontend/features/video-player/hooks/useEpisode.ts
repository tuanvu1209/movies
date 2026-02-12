import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export function useEpisode(id: string) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialEpisode = parseInt(searchParams.get('episode') || '1', 10) || 1
  const [selectedEpisode, setSelectedEpisode] = useState(initialEpisode)

  useEffect(() => {
    const currentEpisode = searchParams.get('episode')
    const episodeNum = parseInt(currentEpisode || '1', 10) || 1

    setSelectedEpisode(prevEpisode => {
      if (episodeNum !== prevEpisode) {
        return episodeNum
      }
      return prevEpisode
    })
  }, [searchParams])

  const handleEpisodeChange = (episode: number) => {
    if (episode === selectedEpisode) {
      return
    }

    const currentPath = `/watch/${id}`
    const newUrl = `${currentPath}?episode=${episode}`
    router.push(newUrl, { scroll: false })
    setSelectedEpisode(episode)
  }

  return {
    selectedEpisode,
    handleEpisodeChange,
  }
}
