import { describe, it, expect } from 'vitest'
import { getDifficultyParams } from '../../src/utils/difficulty'

describe('getDifficultyParams', () => {
  it('レベル1で制限時間が最大（7000ms）', () => {
    const p = getDifficultyParams(1)
    expect(p.timeLimitMs).toBe(7000)
  })

  it('レベル50で制限時間が最小（2000ms）', () => {
    const p = getDifficultyParams(50)
    expect(p.timeLimitMs).toBe(2000)
  })

  it('レベルが上がるほど制限時間が短くなる', () => {
    const p10 = getDifficultyParams(10)
    const p30 = getDifficultyParams(30)
    expect(p30.timeLimitMs).toBeLessThan(p10.timeLimitMs)
  })

  it('levelフィールドが入力と一致する', () => {
    expect(getDifficultyParams(15).level).toBe(15)
  })
})
