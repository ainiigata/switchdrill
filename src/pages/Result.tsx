import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { useProgressStore } from '../store/progressStore'

const RANK_COLOR: Record<string, string> = {
  S: 'text-yellow-400',
  A: 'text-orange-400',
  B: 'text-blue-400',
  C: 'text-green-400',
  D: 'text-gray-400',
}

const GAME_LABEL: Record<string, string> = {
  calc: '計算', stroop: 'ストループ', pattern: 'パターン', category: 'カテゴリ', reaction: '反応',
}

export function Result() {
  const navigate = useNavigate()
  const { resetSession } = useGameStore()
  const { progress } = useProgressStore()
  const lastSession = progress.sessionHistory.at(-1)
  const newAchievements = progress.achievements.filter(
    (a) => a.unlockedAt && new Date(a.unlockedAt).getTime() > Date.now() - 10000
  )

  if (!lastSession) { navigate('/'); return null }

  const handleRetry = () => {
    resetSession()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-4 py-8 max-w-lg mx-auto">
      <div className="text-center">
        <p className="text-gray-400 text-sm mb-2">セッション完了</p>
        <p className={`text-9xl font-black ${RANK_COLOR[lastSession.rank]}`}>{lastSession.rank}</p>
        <p className="text-3xl font-bold mt-2">{lastSession.totalScore.toLocaleString()} pt</p>
        <p className="text-gray-400 text-sm">平均反応 {lastSession.avgReactionMs}ms</p>
      </div>

      <div className="w-full bg-gray-800 rounded-2xl p-6">
        <h2 className="text-sm text-gray-400 mb-4">ゲーム別成績</h2>
        <div className="flex flex-col gap-2">
          {Object.entries(lastSession.resultsByType)
            .filter(([, v]) => v.total > 0)
            .map(([type, { correct, total }]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-sm">{GAME_LABEL[type]}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(correct / total) * 100}%` }} />
                  </div>
                  <span className="text-sm text-gray-400">{correct}/{total}</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {newAchievements.length > 0 && (
        <div className="w-full bg-yellow-900 border border-yellow-600 rounded-2xl p-4">
          <p className="text-yellow-400 font-bold mb-2">実績解除！</p>
          {newAchievements.map((a) => (
            <p key={a.id} className="text-sm">🏆 {a.name} — {a.description}</p>
          ))}
        </div>
      )}

      <div className="w-full flex flex-col gap-3">
        <button onClick={handleRetry} className="w-full py-4 text-xl font-bold rounded-2xl bg-indigo-600 hover:bg-indigo-400 active:scale-95 transition-transform">
          もう一度
        </button>
        <button onClick={() => navigate('/dashboard')} className="w-full py-4 text-xl font-bold rounded-2xl bg-gray-700 hover:bg-gray-500 active:scale-95 transition-transform">
          ダッシュボード
        </button>
      </div>
    </div>
  )
}
