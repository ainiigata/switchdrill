import { create } from 'zustand'
import type { GameSession, QuestionResult, GameQuestion } from '../types'

interface GameStoreState {
  session: GameSession | null
  startSession: (questions: GameQuestion[], sessionLevel: number) => void
  recordResult: (result: QuestionResult) => void
  nextQuestion: () => void
  resetSession: () => void
}

export const useGameStore = create<GameStoreState>((set) => ({
  session: null,

  startSession: (questions, sessionLevel) =>
    set({
      session: {
        questions,
        currentIndex: 0,
        results: [],
        comboCount: 0,
        totalScore: 0,
        startedAt: Date.now(),
        sessionLevel,
      },
    }),

  recordResult: (result) =>
    set((state) => {
      if (!state.session) return state
      const newCombo = result.correct ? state.session.comboCount + 1 : 0
      return {
        session: {
          ...state.session,
          results: [...state.session.results, result],
          comboCount: newCombo,
          totalScore: state.session.totalScore + result.score,
        },
      }
    }),

  nextQuestion: () =>
    set((state) => {
      if (!state.session) return state
      return {
        session: {
          ...state.session,
          currentIndex: state.session.currentIndex + 1,
        },
      }
    }),

  resetSession: () => set({ session: null }),
}))
