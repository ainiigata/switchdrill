import { describe, it, expect } from 'vitest'
import { calcQuestionScore, calcRank, calcExpGain } from '../../src/utils/scoring'

describe('calcQuestionScore', () => {
  it('正解・素早い回答で高スコアになる', () => {
    const score = calcQuestionScore({ correct: true, reactionTimeMs: 500, timeLimitMs: 5000, comboCount: 0 })
    expect(score).toBeGreaterThan(90)
  })

  it('不正解は0点', () => {
    const score = calcQuestionScore({ correct: false, reactionTimeMs: 500, timeLimitMs: 5000, comboCount: 0 })
    expect(score).toBe(0)
  })

  it('タイムアウト近くは低スコア', () => {
    const score = calcQuestionScore({ correct: true, reactionTimeMs: 4800, timeLimitMs: 5000, comboCount: 0 })
    expect(score).toBeLessThan(30)
  })

  it('コンボが高いほどボーナスが乗る', () => {
    const noCombo = calcQuestionScore({ correct: true, reactionTimeMs: 1000, timeLimitMs: 5000, comboCount: 0 })
    const withCombo = calcQuestionScore({ correct: true, reactionTimeMs: 1000, timeLimitMs: 5000, comboCount: 5 })
    expect(withCombo).toBeGreaterThan(noCombo)
  })
})

describe('calcRank', () => {
  it('95%以上はS', () => expect(calcRank(950, 1000)).toBe('S'))
  it('80%以上はA', () => expect(calcRank(800, 1000)).toBe('A'))
  it('65%以上はB', () => expect(calcRank(650, 1000)).toBe('B'))
  it('50%以上はC', () => expect(calcRank(500, 1000)).toBe('C'))
  it('50%未満はD', () => expect(calcRank(499, 1000)).toBe('D'))
})

describe('calcExpGain', () => {
  it('S rankで最も多くEXPを得る', () => {
    expect(calcExpGain('S')).toBeGreaterThan(calcExpGain('A'))
  })
  it('全rankで正の値を返す', () => {
    (['S', 'A', 'B', 'C', 'D'] as const).forEach(rank => {
      expect(calcExpGain(rank)).toBeGreaterThan(0)
    })
  })
})
