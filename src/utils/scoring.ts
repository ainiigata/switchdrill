import type { SessionRecord } from '../types'

interface QuestionScoreParams {
  correct: boolean
  reactionTimeMs: number
  timeLimitMs: number
  comboCount: number
}

/** 1問あたりのスコアを計算 */
export function calcQuestionScore(params: QuestionScoreParams): number {
  const { correct, reactionTimeMs, timeLimitMs, comboCount } = params
  if (!correct) return 0

  const speedRatio = Math.max(0.2, 1 - reactionTimeMs / timeLimitMs)
  // speedRatioが高いほど（回答が速いほど）スコアが上がる
  // 0.9の場合: 100 * 0.9 * 1.05 = 94.5 → 95
  const baseScore = Math.round(100 * speedRatio * (1 + speedRatio * 0.05))
  const comboMultiplier = Math.min(2.0, 1 + comboCount * 0.1)
  return Math.round(baseScore * comboMultiplier)
}

/** セッション合計スコアからランクを算出 */
export function calcRank(totalScore: number, maxPossibleScore: number): SessionRecord['rank'] {
  const ratio = totalScore / maxPossibleScore
  if (ratio >= 0.95) return 'S'
  if (ratio >= 0.80) return 'A'
  if (ratio >= 0.65) return 'B'
  if (ratio >= 0.50) return 'C'
  return 'D'
}

/** 10問セッションの最大可能スコアを返す（コンボなし・最速前提） */
export const MAX_SESSION_SCORE = 1000
