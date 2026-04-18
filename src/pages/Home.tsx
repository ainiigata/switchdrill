import { useState } from 'react'
import { useProgressStore } from '../store/progressStore'
import { useGameSession } from '../hooks/useGameSession'
import { Link } from 'react-router-dom'

const RANK_COLOR = { S: 'text-yellow-400', A: 'text-orange-400', B: 'text-blue-400', C: 'text-green-400', D: 'text-gray-400' }

const DIFFICULTIES = [
  { label: 'かんたん', level: 1,  desc: '制限時間 7秒', color: 'bg-green-700 hover:bg-green-500 border-green-500' },
  { label: 'ふつう',   level: 15, desc: '制限時間 5.4秒', color: 'bg-blue-700 hover:bg-blue-500 border-blue-500' },
  { label: 'むずかしい', level: 30, desc: '制限時間 3.9秒', color: 'bg-orange-700 hover:bg-orange-500 border-orange-500' },
  { label: 'エキスパート', level: 45, desc: '制限時間 2.5秒', color: 'bg-red-800 hover:bg-red-600 border-red-600' },
]

export function Home() {
  const { progress } = useProgressStore()
  const { start } = useGameSession()
  const lastSession = progress.sessionHistory.at(-1)
  const expPercent = Math.round((progress.exp / progress.expToNext) * 100)
  const [selectedLevel, setSelectedLevel] = useState<number>(progress.level)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-4 py-8">
      <div className="text-center">
        <h1 className="text-5xl font-black tracking-tight mb-2">SwitchDrill</h1>
        <p className="text-gray-400">注意切り替え力を鍛えよう</p>
      </div>

      <div className="w-full max-w-sm bg-gray-800 rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Lv.{progress.level}</span>
          <span className="text-yellow-400 font-bold">🔥 {progress.streak}日連続</span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${expPercent}%` }} />
        </div>
        <p className="text-xs text-gray-500 text-right">{progress.exp} / {progress.expToNext} EXP</p>

        {lastSession && (
          <div className="border-t border-gray-700 pt-4 flex justify-between items-center">
            <span className="text-sm text-gray-400">前回</span>
            <span className={`text-3xl font-black ${RANK_COLOR[lastSession.rank]}`}>{lastSession.rank}</span>
            <span className="text-sm text-gray-400">{lastSession.totalScore.toLocaleString()}pt</span>
          </div>
        )}
      </div>

      {/* 難易度選択 */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <p className="text-sm text-gray-400 text-center">難易度を選択</p>
        <div className="grid grid-cols-2 gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.level}
              onClick={() => setSelectedLevel(d.level)}
              className={`py-3 px-2 rounded-xl border-2 text-sm font-bold transition-all active:scale-95 ${
                selectedLevel === d.level
                  ? `${d.color} border-opacity-100 ring-2 ring-white ring-opacity-30`
                  : 'bg-gray-800 border-gray-600 hover:border-gray-400'
              }`}
            >
              <div>{d.label}</div>
              <div className="text-xs font-normal opacity-70 mt-0.5">{d.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => start(selectedLevel)}
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
