import type { CalcQuestion } from '../../types'

interface CalcGameProps {
  question: CalcQuestion
  onAnswer: (correct: boolean) => void
}

export function CalcGame({ question, onAnswer }: CalcGameProps) {
  const { a, b, operator, answer, choices } = question

  return (
    <div className="flex flex-col items-center gap-8">
      <p className="text-5xl font-black text-white">
        {a} {operator} {b} ＝ ?
      </p>
      <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
        {choices.map((choice) => (
          <button
            key={choice}
            onClick={() => onAnswer(choice === answer)}
            className="py-5 text-2xl font-bold rounded-2xl bg-indigo-700 hover:bg-indigo-500 active:scale-95 transition-transform"
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  )
}
