import { create } from 'zustand'
import type { PlayerProgress, SessionRecord } from '../types'
import { loadProgress, saveProgress } from '../utils/storage'

interface ProgressStoreState {
  progress: PlayerProgress
  applySessionResult: (record: SessionRecord, maxCombo: number) => void
  loadFromStorage: () => void
}

export const useProgressStore = create<ProgressStoreState>((set, get) => ({
  progress: loadProgress(),

  loadFromStorage: () => set({ progress: loadProgress() }),

  applySessionResult: (record, maxCombo) => {
    const { progress } = get()
    const today = new Date().toISOString().split('T')[0]

    // ストリーク計算
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const newStreak = progress.lastPlayedDate === yesterday
      ? progress.streak + 1
      : progress.lastPlayedDate === today
      ? progress.streak
      : 1

    // 実績チェック
    const updatedAchievements = progress.achievements.map((a) => {
      if (a.unlockedAt) return a
      const now = new Date().toISOString()
      if (a.id === 'first_session') return { ...a, unlockedAt: now }
      if (a.id === 'rank_s' && record.rank === 'S') return { ...a, unlockedAt: now }
      if (a.id === 'streak_3' && newStreak >= 3) return { ...a, unlockedAt: now }
      if (a.id === 'streak_7' && newStreak >= 7) return { ...a, unlockedAt: now }
      if (a.id === 'combo_5' && maxCombo >= 5) return { ...a, unlockedAt: now }
      if (a.id === 'combo_10' && maxCombo >= 10) return { ...a, unlockedAt: now }
      if (a.id === 'sessions_10' && progress.sessionHistory.length + 1 >= 10) return { ...a, unlockedAt: now }
      return a
    })

    const newProgress: PlayerProgress = {
      ...progress,
      streak: newStreak,
      lastPlayedDate: today,
      sessionHistory: [...progress.sessionHistory, record].slice(-30),
      achievements: updatedAchievements,
    }

    saveProgress(newProgress)
    set({ progress: newProgress })
  },
}))
