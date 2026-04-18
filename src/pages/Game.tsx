import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { useProgressStore } from '../store/progressStore'
import { useGameSession } from '../hooks/useGameSession'
import { useTimer } from '../hooks/useTimer'
import { getDifficultyParams } from '../utils/difficulty'
import { TimerBar } from '../components/ui/TimerBar'
import { ScoreDisplay } from '../components/ui/ScoreDisplay'
import { ComboIndicator } from '../components/ui/ComboIndicator'
import { CalcGame } from '../components/games/CalcGame'
import { StroopGame } from '../components/games/StroopGame'
import { PatternGame } from '../components/games/PatternGame'
import { CategoryGame } from '../components/games/CategoryGame'
import { ReactionGame } from '../components/games/ReactionGame'
import type { GameQuestion } from '../types'

function GameContent({ question, onAnswer }: { question: GameQuestion; onAnswer: (correct: boolean) => void }) {
  switch (question.type) {
    case 'calc': return <CalcGame question={question} onAnswer={onAnswer} />
    case 'stroop': return <StroopGame question={question} onAnswer={onAnswer} />
    case 'pattern': return <PatternGame question={question} onAnswer={onAnswer} />
    case 'category': return <CategoryGame question={question} onAnswer={onAnswer} />
    case 'reaction': return <ReactionGame question={question} onAnswer={onAnswer} />
  }
}

export function Game() {
  const navigate = useNavigate()
  const { session } = useGameStore()
  const { progress } = useProgressStore()
  const { submitAnswer, handleTimeout } = useGameSession()
  const { timeLimitMs } = getDifficultyParams(session?.sessionLevel ?? progress.level)
  const { elapsedMs, start, reset } = useTimer(timeLimitMs, handleTimeout)

  useEffect(() => {
    if (!session) { navigate('/'); return }
    reset()
    start()
  }, [session?.currentIndex])

  if (!session) return null
  const currentQuestion = session.questions[session.currentIndex]

  const handleAnswer = (correct: boolean) => {
    submitAnswer(correct, elapsedMs)
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 gap-6 max-w-lg mx-auto">
      <TimerBar elapsedMs={elapsedMs} timeLimitMs={timeLimitMs} />
      <ScoreDisplay
        score={session.totalScore}
        questionIndex={session.currentIndex}
        totalQuestions={session.questions.length}
      />
      <ComboIndicator combo={session.comboCount} />
      <div className="flex-1 flex items-center justify-center">
        <GameContent question={currentQuestion} onAnswer={handleAnswer} />
      </div>
    </div>
  )
}
