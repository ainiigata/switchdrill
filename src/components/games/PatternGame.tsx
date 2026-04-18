import { useState, useEffect } from 'react'
import type { PatternQuestion } from '../../types'

interface PatternGameProps {
  question: PatternQuestion
  onAnswer: (correct: boolean) => void
}

export function PatternGame({ question, onAnswer }: PatternGameProps) {
  const { gridSize, pattern, showDurationMs } = question
  const [phase, setPhase] = useState<'show' | 'input'>('show')
  const [selected, setSelected] = useState<boolean[][]>(
    Array.from({ length: gridSize }, () => Array(gridSize).fill(false))
  )

  useEffect(() => {
    const timer = setTimeout(() => setPhase('input'), showDurationMs)
    return () => clearTimeout(timer)
  }, [showDurationMs])

  const toggleCell = (r: number, c: number) => {
    if (phase !== 'input') return
    setSelected((prev) => {
      const next = prev.map((row) => [...row])
      next[r][c] = !next[r][c]
      return next
    })
  }

  const handleSubmit = () => {
    const correct = pattern.every((row, r) =>
      row.every((cell, c) => cell === selected[r][c])
    )
    onAnswer(correct)
  }

  const cellSize = gridSize === 3 ? 'w-20 h-20' : gridSize === 4 ? 'w-16 h-16' : 'w-12 h-12'

  return (
    <div className="flex flex-col items-center gap-6">
      {phase === 'show' ? (
        <>
          <p className="text-sm text-gray-400">パターンを覚えてください</p>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
            {pattern.map((row, r) =>
              row.map((cell, c) => (
                <div
                  key={`${r}-${c}`}
                  className={`${cellSize} rounded-lg border-2 border-gray-600 ${cell ? 'bg-indigo-500' : 'bg-gray-800'}`}
                />
              ))
            )}
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-400">同じパターンを再現してください</p>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
            {selected.map((row, r) =>
              row.map((cell, c) => (
                <button
                  key={`${r}-${c}`}
                  onClick={() => toggleCell(r, c)}
                  className={`${cellSize} rounded-lg border-2 border-gray-600 active:scale-95 transition-transform ${cell ? 'bg-indigo-500' : 'bg-gray-800'}`}
                />
              ))
            )}
          </div>
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-400 rounded-xl font-bold text-lg"
          >
            決定
          </button>
        </>
      )}
    </div>
  )
}
