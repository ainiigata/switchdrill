import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { useProgressStore } from '../store/progressStore'
import { calcQuestionScore, calcRank, MAX_SESSION_SCORE } from '../utils/scoring'
import { getDifficultyParams } from '../utils/difficulty'
import { generateSession } from '../utils/gameSelector'
import type { GameType, SessionRecord } from '../types'

export function useGameSession() {
  const navigate = useNavigate()
  const { session, startSession, recordResult, nextQuestion, resetSession } = useGameStore()
  const { progress, applySessionResult } = useProgressStore()

  const start = useCallback(() => {
    const questions = generateSession(progress.level)
    startSession(questions)
    navigate('/game')
  }, [progress.level, startSession, navigate])

  const submitAnswer = useCallback(
    (correct: boolean, reactionTimeMs: number) => {
      if (!session) return
      const { timeLimitMs } = getDifficultyParams(progress.level)
      const score = calcQuestionScore({
        correct,
        reactionTimeMs,
        timeLimitMs,
        comboCount: session.comboCount,
      })
      recordResult({ gameType: session.questions[session.currentIndex].type as GameType, correct, reactionTimeMs, score })

      const isLast = session.currentIndex >= session.questions.length - 1
      if (isLast) {
        finishSession()
      } else {
        nextQuestion()
      }
    },
    [session, progress.level, recordResult, nextQuestion]
  )

  const finishSession = useCallback(() => {
    if (!session) return
    const results = [...session.results]
    const totalScore = session.totalScore
    const rank = calcRank(totalScore, MAX_SESSION_SCORE)
    const avgReactionMs =
      results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + r.reactionTimeMs, 0) / results.length)
        : 0

    const resultsByType = {} as SessionRecord['resultsByType']
    ;(['calc', 'stroop', 'pattern', 'category', 'reaction'] as GameType[]).forEach((type) => {
      const typed = results.filter((r) => r.gameType === type)
      resultsByType[type] = { correct: typed.filter((r) => r.correct).length, total: typed.length }
    })

    const record: SessionRecord = {
      date: new Date().toISOString(),
      totalScore,
      rank,
      avgReactionMs,
      resultsByType,
    }

    const maxCombo = results.reduce((max, _, i, arr) => {
      let combo = 0
      for (let j = i; j < arr.length && arr[j].correct; j++) combo++
      return Math.max(max, combo)
    }, 0)

    applySessionResult(record, maxCombo)
    navigate('/result')
  }, [session, applySessionResult, navigate])

  const handleTimeout = useCallback(() => {
    submitAnswer(false, getDifficultyParams(progress.level).timeLimitMs)
  }, [submitAnswer, progress.level])

  return { session, start, submitAnswer, handleTimeout, resetSession }
}
