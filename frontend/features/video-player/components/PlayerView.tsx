import ReactPlayer from 'react-player'
import { PageLoading } from '@/shared/components/PageLoading'

interface PlayerViewProps {
  videoUrl: string
  selectedEpisode: number
  isPlayerReady: boolean
  loading: boolean
  playerRef: React.RefObject<any>
  onReady: () => void
  onError: (error: any) => void
}

export function PlayerView({
  videoUrl,
  selectedEpisode,
  isPlayerReady,
  loading,
  playerRef,
  onReady,
  onError,
}: PlayerViewProps) {
  if (!videoUrl) {
    return (
      <div className="h-full min-h-[50vh]">
        <PageLoading fullScreen={false} message="Đang tìm kiếm m3u8 URL..." />
      </div>
    )
  }

  return (
    <ReactPlayer
      ref={playerRef}
      key={`player-${selectedEpisode}-${videoUrl.substring(0, 50)}`}
      url={videoUrl}
      controls
      playing={isPlayerReady && !loading}
      width="100%"
      height="100%"
      onReady={onReady}
      onError={onError}
      config={{
        file: {
          attributes: {
            controlsList: 'nodownload',
            crossOrigin: 'anonymous',
          },
          hlsOptions: {
            enableWorker: true,
            lowLatencyMode: false,
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
          },
        },
      }}
    />
  )
}
