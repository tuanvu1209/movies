import { useRouter } from 'next/navigation'
import { MovieInfo } from '../types/video'

interface VideoControlsProps {
  movieInfo: MovieInfo | null
  selectedEpisode: number
  totalEpisodes: number
  showControls: boolean
  showEpisodeSelector: boolean
  onToggleEpisodeSelector: () => void
}

export function VideoControls({
  movieInfo,
  selectedEpisode,
  totalEpisodes,
  showControls,
  showEpisodeSelector,
  onToggleEpisodeSelector,
}: VideoControlsProps) {
  const router = useRouter()

  return (
    <>
      <div
        className={`absolute top-0 left-0 z-50 p-6 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-black/70 hover:bg-black/90 flex items-center justify-center transition-all duration-200 backdrop-blur-sm border border-white/20 hover:scale-110"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex flex-col">
            <h1 className="text-white text-xl font-semibold">
              {movieInfo?.title || 'Đang tải...'}
            </h1>
            {totalEpisodes > 0 && (
              <p className="text-gray-300 text-sm">
                Tập {selectedEpisode} / {totalEpisodes}
              </p>
            )}
          </div>
        </div>
      </div>

      {totalEpisodes > 0 && (
        <div
          className={`absolute bottom-20 right-4 z-50 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <button
            onClick={onToggleEpisodeSelector}
            className="bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-all duration-200 backdrop-blur-sm border border-white/20"
          >
            <span className="font-medium">Tập {selectedEpisode}</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${showEpisodeSelector ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
    </>
  )
}
