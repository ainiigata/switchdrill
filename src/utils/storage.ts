import type { PlayerProgress, Achievement } from '../types'

const STORAGE_KEY = 'switchdrill_progress'

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_session', name: '初めての挑戦', description: '初めてセッションを完了した', unlockedAt: null },
  { id: 'rank_s', name: 'Sランク達成', description: 'Sランクを獲得した', unlockedAt: null },
  { id: 'streak_3', name: '3日連続', description: '3日連続でプレイした', unlockedAt: null },
  { id: 'streak_7', name: '週間チャンピオン', description: '7日連続でプレイした', unlockedAt: null },
  { id: 'level_10', name: 'レベル10到達', description: 'レベル10に到達した', unlockedAt: null },
  { id: 'level_30', name: 'レベル30到達', description: 'レベル30に到達した', unlockedAt: null },
  { id: 'combo_5', name: '5コンボ達成', description: '1セッションで5コンボ以上出した', unlockedAt: null },
  { id: 'combo_10', name: '10コンボ達成', description: '1セッションで10コンボ以上出した', unlockedAt: null },
  { id: 'stroop_master', name: 'ストループ達人', description: 'ストループテストを全問正解した', unlockedAt: null },
  { id: 'sessions_10', name: '10セッション完了', description: '10回セッションを完了した', unlockedAt: null },
]

export const DEFAULT_PROGRESS: PlayerProgress = {
  level: 1,
  exp: 0,
  expToNext: 100,
  streak: 0,
  lastPlayedDate: null,
  sessionHistory: [],
  achievements: INITIAL_ACHIEVEMENTS,
}

export function saveProgress(progress: PlayerProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function loadProgress(): PlayerProgress {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return { ...DEFAULT_PROGRESS, achievements: INITIAL_ACHIEVEMENTS.map(a => ({ ...a })) }
  try {
    return JSON.parse(raw) as PlayerProgress
  } catch {
    return { ...DEFAULT_PROGRESS, achievements: INITIAL_ACHIEVEMENTS.map(a => ({ ...a })) }
  }
}
