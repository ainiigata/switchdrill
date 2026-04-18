import { describe, it, expect } from 'vitest'
import { generateSession } from '../../src/utils/gameSelector'

describe('generateSession', () => {
  it('10問生成される', () => {
    const questions = generateSession(1)
    expect(questions).toHaveLength(10)
  })

  it('各問題がtypeフィールドを持つ', () => {
    const questions = generateSession(1)
    const validTypes = ['calc', 'stroop', 'pattern', 'category', 'reaction']
    questions.forEach(q => {
      expect(validTypes).toContain(q.type)
    })
  })

  it('calcQuestionはanswer・choicesを持つ', () => {
    // 十分な試行で必ずcalcが入る
    let found = false
    for (let i = 0; i < 20; i++) {
      const qs = generateSession(1)
      const calcQ = qs.find(q => q.type === 'calc')
      if (calcQ && calcQ.type === 'calc') {
        expect(calcQ.choices).toHaveLength(4)
        expect(calcQ.choices).toContain(calcQ.answer)
        found = true
        break
      }
    }
    expect(found).toBe(true)
  })

  it('stroopQuestionはword・inkColor・choicesを持つ', () => {
    let found = false
    for (let i = 0; i < 20; i++) {
      const qs = generateSession(1)
      const q = qs.find(q => q.type === 'stroop')
      if (q && q.type === 'stroop') {
        expect(q.choices).toHaveLength(4)
        expect(q.choices).toContain(q.inkColor)
        found = true
        break
      }
    }
    expect(found).toBe(true)
  })
})
