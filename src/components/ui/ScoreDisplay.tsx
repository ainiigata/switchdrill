interface ScoreDisplayProps {
  score: number
  questionIndex: number
  totalQuestions: number
}

export function ScoreDisplay({ score, questionIndex, totalQuestions }: ScoreDisplayProps) {
  return (
    <div className="flex items-center justify-between text-sm text-gray-300">
      <span className="font-bold text-white text-lg">{score.toLocaleString()} pt</span>
      <span>{questionIndex + 1} / {totalQuestions}</span>
    </div>
  )
}
