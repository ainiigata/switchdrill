import type { DifficultyParams } from '../types'

const MIN_TIME_LIMIT_MS = 2000
const MAX_TIME_LIMIT_MS = 7000
const MAX_LEVEL = 50

/**
 * レベルに応じた難易度パラメータを返す。
 * レベルが上がるほど制限時間が短くなる（線形補間）。
 */
export function getDifficultyParams(level: number): DifficultyParams {
  const clampedLevel = Math.max(1, Math.min(MAX_LEVEL, level))
  const ratio = (clampedLevel - 1) / (MAX_LEVEL - 1)
  const timeLimitMs = Math.round(
    MAX_TIME_LIMIT_MS - (MAX_TIME_LIMIT_MS - MIN_TIME_LIMIT_MS) * ratio
  )
  return { timeLimitMs, level: clampedLevel }
}
