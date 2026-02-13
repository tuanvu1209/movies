'use client'

import dynamic from 'next/dynamic'
import { PageLoading } from '@/shared/components/PageLoading'

const VideoPlayer = dynamic(() => import('@/features/video-player').then(mod => ({ default: mod.VideoPlayer })), {
  loading: () => <PageLoading message="Đang tải trình phát..." />,
  ssr: false,
})

export default function WatchPage() {
  return (
    <div className="min-h-screen bg-black">
      <VideoPlayer />
    </div>
  )
}
