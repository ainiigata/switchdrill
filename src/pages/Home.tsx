import { useState } from 'react'
import { useProgressStore } from '../store/progressStore'
import { useGameSession } from '../hooks/useGameSession'
import { Link } from 'react-router-dom'

const RANK_COLOR = { S: 'text-yellow-400', A: 'text-orange-400', B: 'text-blue-400', C: 'text-green-400', D: 'text-gray-400' }

function getDifficultyLabel(level: number): { label: string; color: string } {
  if (level <= 10) return { label: 'かんたん', color: 'text-green-400' }
  if (level <= 25) return { label: 'ふつう', color: 'text-blue-400' }
  if (level <= 40) return { label: 'むずかしい', color: 'text-orange-400' }
  return { label: 'エキスパート', color: 'text-red-400' }
}

export function Home() {
  const { progress } = useProgressStore()
  const { start } = useGameSession()
  const lastSession = progress.sessionHistory.at(-1)
  const [level, setLevel] = useState(25)
  const { label, color } = getDifficultyLabel(level)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-4 py-8">
      <div className="text-center">
        <h1 className="text-5xl font-black tracking-tight mb-2">SwitchDrill</h1>
        <p className="text-gray-400">注意切り替え力を鍛えよう</p>
      </div>

      {/* 難易度スライダー */}
      <div className="w-full max-w-sm bg-gray-800 rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex justify-between items-baseline">
          <span className="text-gray-400 text-sm">難易度</span>
          <span className={`text-lg font-black ${color}`}>{label}</span>
        </div>

        <input
          type="range"
          min={1}
          max={50}
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
          className="w-full accent-indigo-500"
        />

        <div className="flex justify-between text-xs text-gray-500">
          <span>1</span>
          <span className="text-white font-bold text-base">Lv.{level}</span>
          <span>50</span>
        </div>

        <div className="text-xs text-gray-400 text-center">
          制限時間: {((7000 - (7000 - 2000) * (level - 1) / 49) / 1000).toFixed(1)}秒
        </div>
      </div>

      {lastSession && (
        <div className="w-full max-w-sm bg-gray-800 rounded-2xl px-6 py-4 flex justify-between items-center">
          <span className="text-sm text-gray-400">前回</span>
          <span className={`text-3xl font-black ${RANK_COLOR[lastSession.rank]}`}>{lastSession.rank}</span>
          <span className="text-sm text-gray-400">{lastSession.totalScore.toLocaleString()}pt</span>
        </div>
      )}

      <button
        onClick={() => start(level)}
        className="w-full max-w-sm py-6 text-2xl font-black rounded-2xl bg-indigo-600 hover:bg-indigo-400 active:scale-95 transition-transform shadow-lg shadow-indigo-900"
      >
        スタート
      </button>

      <Link to="/dashboard" className="text-gray-400 hover:text-white underline text-sm">
        ダッシュボードを見る
      </Link>
    </div>
  )
}
