interface ErrorStateProps {
  error: string
}

export function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-red-500 text-xl">Lỗi: {error}</div>
    </div>
  )
}
