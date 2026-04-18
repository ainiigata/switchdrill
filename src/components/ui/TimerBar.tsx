interface TimerBarProps {
  elapsedMs: number
  timeLimitMs: number
}

export function TimerBar({ elapsedMs, timeLimitMs }: TimerBarProps) {
  const ratio = Math.min(1, elapsedMs / timeLimitMs)
  const remaining = 1 - ratio
  const color = remaining > 0.5 ? 'bg-green-400' : remaining > 0.25 ? 'bg-yellow-400' : 'bg-red-500'

  return (
    <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-none ${color}`}
        style={{ width: `${remaining * 100}%` }}
      />
    </div>
  )
}
