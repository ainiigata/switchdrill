import type { StroopQuestion, ColorName } from '../../types'

interface StroopGameProps {
  question: StroopQuestion
  onAnswer: (correct: boolean) => void
}

const COLOR_LABEL: Record<ColorName, string> = {
  red: '赤',
  blue: '青',
  green: '緑',
  yellow: '黄',
}

const INK_CLASS: Record<ColorName, string> = {
  red: 'text-red-500',
  blue: 'text-blue-400',
  green: 'text-green-400',
  yellow: 'text-yellow-300',
}

const BUTTON_CLASS: Record<ColorName, string> = {
  red: 'bg-red-600 hover:bg-red-400',
  blue: 'bg-blue-600 hover:bg-blue-400',
  green: 'bg-green-600 hover:bg-green-400',
  yellow: 'bg-yellow-500 hover:bg-yellow-300',
}

export function StroopGame({ question, onAnswer }: StroopGameProps) {
  const { word, inkColor, choices } = question

  return (
    <div className="flex flex-col items-center gap-8">
      <p className="text-sm text-gray-400">この文字の「色」を選んでください</p>
      <p className={`text-7xl font-black ${INK_CLASS[inkColor]}`}>
        {COLOR_LABEL[word]}
      </p>
      <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
        {choices.map((c) => (
          <button
            key={c}
            onClick={() => onAnswer(c === inkColor)}
            className={`py-5 text-xl font-bold rounded-2xl active:scale-95 transition-transform ${BUTTON_CLASS[c]}`}
          >
            {COLOR_LABEL[c]}
          </button>
        ))}
      </div>
    </div>
  )
}
