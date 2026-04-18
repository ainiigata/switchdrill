import { useProgressStore } from '../store/progressStore'
import { useGameSession } from '../hooks/useGameSession'
import { Link } from 'react-router-dom'

const RANK_COLOR = { S: 'text-yellow-400', A: 'text-orange-400', B: 'text-blue-400', C: 'text-green-400', D: 'text-gray-400' }

export function Home() {
  const { progress } = useProgressStore()
  const { start } = useGameSession()
  const lastSession = progress.sessionHistory.at(-1)
  const expPercent = Math.round((progress.exp / progress.expToNext) * 100)

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

      <button
        onClick={start}
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
