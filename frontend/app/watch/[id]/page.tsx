'use client'

import dynamic from 'next/dynamic'

const VideoPlayer = dynamic(() => import('@/features/video-player').then(mod => ({ default: mod.VideoPlayer })), {
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white text-xl">Loading player...</div>
    </div>
  ),
  ssr: false,
})

export default function WatchPage() {
  return (
    <div className="min-h-screen bg-black">
      <VideoPlayer />
    </div>
  )
}
