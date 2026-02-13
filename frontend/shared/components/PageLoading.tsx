'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

interface PageLoadingProps {
  message?: string
  fullScreen?: boolean
}

export function PageLoading({ message, fullScreen = true }: PageLoadingProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center bg-black ${fullScreen ? 'min-h-screen w-full' : 'min-h-[40vh]'}`}
    >
      {/* Logo + BinPhim */}
      <motion.div
        className="flex items-center gap-3 mb-8"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative h-12 w-12 flex-shrink-0">
          <Image src="/logo.png" alt="Logo" fill className="object-contain" sizes="48px" />
        </div>
        <span className="text-xl font-bold text-white">BinPhim</span>
      </motion.div>

      {/* Rotating ring + inner glow */}
      <motion.div
        className="relative flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="h-16 w-16 rounded-full border-2 border-netflix-red/30 border-t-netflix-red"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute h-14 w-14 rounded-full border border-netflix-red/50"
          animate={{ rotate: -360, scale: [1, 1.05, 1] }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
            scale: { duration: 1.5, repeat: Infinity },
          }}
        />
        <motion.div
          className="absolute h-3 w-3 rounded-full bg-netflix-red shadow-[0_0_12px_4px_rgba(229,9,20,0.6)]"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      </motion.div>

      {/* Bouncing dots */}
      <div className="mt-6 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-netflix-red"
            animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {message && (
        <motion.p
          className="mt-4 text-sm font-medium text-white/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.p>
      )}
    </div>
  )
}
