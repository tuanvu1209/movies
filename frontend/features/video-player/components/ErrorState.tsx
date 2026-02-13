interface ErrorStateProps {
  error: string
}

export function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      <div className="text-netflix-red text-lg sm:text-xl text-center max-w-md">
        Lỗi: {error}
      </div>
    </div>
  )
}
