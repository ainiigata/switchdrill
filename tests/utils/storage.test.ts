import { describe, it, expect, beforeEach } from 'vitest'
import { saveProgress, loadProgress, DEFAULT_PROGRESS } from '../../src/utils/storage'

beforeEach(() => {
  localStorage.clear()
})

describe('saveProgress / loadProgress', () => {
  it('保存したデータを読み込める', () => {
    const progress = { ...DEFAULT_PROGRESS, level: 5, streak: 3 }
    saveProgress(progress)
    const loaded = loadProgress()
    expect(loaded.level).toBe(5)
    expect(loaded.streak).toBe(3)
  })

  it('データがない場合はDEFAULT_PROGRESSを返す', () => {
    const loaded = loadProgress()
    expect(loaded.level).toBe(DEFAULT_PROGRESS.level)
    expect(loaded.streak).toBe(DEFAULT_PROGRESS.streak)
  })
})
