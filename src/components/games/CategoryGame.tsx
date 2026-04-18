import type { CategoryQuestion } from '../../types'

interface CategoryGameProps {
  question: CategoryQuestion
  onAnswer: (correct: boolean) => void
}

export function CategoryGame({ question, onAnswer }: CategoryGameProps) {
  const { word, categoryA, categoryB, correctCategory } = question

  return (
    <div className="flex flex-col items-center gap-10">
      <p className="text-sm text-gray-400">どちらのカテゴリに属しますか？</p>
      <p className="text-6xl font-black text-white">{word}</p>
      <div className="flex gap-6 w-full max-w-sm">
        <button
          onClick={() => onAnswer(correctCategory === 'A')}
          className="flex-1 py-6 text-xl font-bold rounded-2xl bg-purple-700 hover:bg-purple-500 active:scale-95 transition-transform"
        >
          {categoryA}
        </button>
        <button
          onClick={() => onAnswer(correctCategory === 'B')}
          className="flex-1 py-6 text-xl font-bold rounded-2xl bg-teal-700 hover:bg-teal-500 active:scale-95 transition-transform"
        >
          {categoryB}
        </button>
      </div>
    </div>
  )
}
