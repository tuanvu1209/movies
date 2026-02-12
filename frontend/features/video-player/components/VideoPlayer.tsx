'use client'

import { useParams } from 'next/navigation'
import { useMovieInfo } from '../hooks/useMovieInfo'
import { useEpisode } from '../hooks/useEpisode'
import { useVideoControls } from '../hooks/useVideoControls'
import { PlayerView } from './PlayerView'
import { VideoControls } from './VideoControls'
import { EpisodeSelector } from './EpisodeSelector'
import { LoadingState } from './LoadingState'
import { ErrorState } from './ErrorState'

export function VideoPlayer() {
  const params = useParams()
  const id = params.id as string

  const { selectedEpisode, handleEpisodeChange } = useEpisode(id)
  const {
    movieInfo,
    loading,
    error,
    videoUrl,
    isPlayerReady,
    setIsPlayerReady,
    playerRef,
  } = useMovieInfo({ id, episode: selectedEpisode })

  const totalEpisodes = movieInfo?.episodes?.length || 0

  const {
    showControls,
    showEpisodeSelector,
    setShowEpisodeSelector,
    handleMouseActivity,
    highlightedEpisode,
  } = useVideoControls({ 
    playerRef,
    selectedEpisode,
    totalEpisodes,
    onEpisodeChange: handleEpisodeChange,
  })

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState error={error} />
  }

  return (
    <div className="min-h-screen bg-black">
      <div
        className="relative w-screen h-screen"
        onMouseMove={handleMouseActivity}
        onMouseEnter={handleMouseActivity}
      >
        <div className="absolute inset-0">
          <PlayerView
            videoUrl={videoUrl}
            selectedEpisode={selectedEpisode}
            isPlayerReady={isPlayerReady}
            loading={loading}
            playerRef={playerRef}
            onReady={() => setIsPlayerReady(true)}
            onError={() => setIsPlayerReady(false)}
          />
        </div>

        <VideoControls
          movieInfo={movieInfo}
          selectedEpisode={selectedEpisode}
          totalEpisodes={totalEpisodes}
          showControls={showControls}
          showEpisodeSelector={showEpisodeSelector}
          onToggleEpisodeSelector={() => setShowEpisodeSelector(!showEpisodeSelector)}
        />

        {movieInfo && (
          <EpisodeSelector
            movieInfo={movieInfo}
            selectedEpisode={selectedEpisode}
            highlightedEpisode={highlightedEpisode}
            showEpisodeSelector={showEpisodeSelector}
            onEpisodeChange={handleEpisodeChange}
            onClose={() => setShowEpisodeSelector(false)}
          />
        )}
      </div>
    </div>
  )
}
