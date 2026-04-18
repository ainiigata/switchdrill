interface ComboIndicatorProps {
  combo: number
}

export function ComboIndicator({ combo }: ComboIndicatorProps) {
  if (combo < 2) return null
  return (
    <div className="text-center animate-bounce">
      <span className="text-yellow-400 font-black text-2xl">{combo} COMBO!</span>
    </div>
  )
}
