import type { ReactionQuestion } from '../../types'

interface ReactionGameProps {
  question: ReactionQuestion
  onAnswer: (correct: boolean) => void
}

const COLOR_MAP: Record<string, string> = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
}

const COLOR_LABEL: Record<string, string> = {
  red: '赤',
  blue: '青',
  green: '緑',
}

const SHAPE_LABEL: Record<string, string> = {
  circle: '丸',
  square: '四角',
  triangle: '三角',
}

function Shape({ shape, color }: { shape: string; color: string }) {
  const colorClass = COLOR_MAP[color] ?? 'bg-gray-400'
  if (shape === 'circle') {
    return <div className={`w-32 h-32 rounded-full ${colorClass}`} />
  }
  if (shape === 'square') {
    return <div className={`w-32 h-32 rounded-lg ${colorClass}`} />
  }
  return (
    <div
      className="w-0 h-0"
      style={{
        borderLeft: '64px solid transparent',
        borderRight: '64px solid transparent',
        borderBottom: `110px solid ${color === 'red' ? '#ef4444' : color === 'blue' ? '#3b82f6' : '#22c55e'}`,
      }}
    />
  )
}

export function ReactionGame({ question, onAnswer }: ReactionGameProps) {
  const { targetShape, targetColor, displayShape, displayColor, shouldTap, conditionType } = question

  const conditionLabel =
    conditionType === 'both'
      ? `${SHAPE_LABEL[targetShape]}かつ${COLOR_LABEL[targetColor]}`
      : conditionType === 'shape-only'
      ? `形が${SHAPE_LABEL[targetShape]}（色は無視）`
      : `色が${COLOR_LABEL[targetColor]}（形は無視）`

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <p className="text-xs text-gray-400 mb-1">条件に合ったらタップ</p>
        <p className="text-sm font-bold text-white">{conditionLabel}</p>
      </div>
      <div className="flex items-center justify-center h-40">
        <Shape shape={displayShape} color={displayColor} />
      </div>
      <div className="flex gap-6">
        <button
          onClick={() => onAnswer(shouldTap)}
          className="px-10 py-5 text-xl font-bold rounded-2xl bg-green-600 hover:bg-green-400 active:scale-95 transition-transform"
        >
          タップ！
        </button>
        <button
          onClick={() => onAnswer(!shouldTap)}
          className="px-10 py-5 text-xl font-bold rounded-2xl bg-gray-700 hover:bg-gray-500 active:scale-95 transition-transform"
        >
          スルー
        </button>
      </div>
    </div>
  )
}
