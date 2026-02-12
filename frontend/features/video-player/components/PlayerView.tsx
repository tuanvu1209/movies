import ReactPlayer from 'react-player'

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
      <div className="flex items-center justify-center h-full bg-gray-900 text-white">
        <div className="text-center">
          <p className="text-xl mb-2">Chưa có video URL</p>
          <p className="text-sm text-gray-400">Đang tìm kiếm m3u8 URL...</p>
        </div>
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
