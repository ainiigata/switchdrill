import { useNavigate } from 'react-router-dom'
import { useProgressStore } from '../store/progressStore'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts'

const GAME_LABEL: Record<string, string> = {
  calc: '計算', stroop: 'ストループ', pattern: 'パターン', category: 'カテゴリ', reaction: '反応',
}

export function Dashboard() {
  const navigate = useNavigate()
  const { progress } = useProgressStore()
  const history = progress.sessionHistory.slice(-14)

  const lineData = history.map((s, i) => ({
    name: `${i + 1}`,
    score: s.totalScore,
    rank: s.rank,
  }))

  const radarData = (['calc', 'stroop', 'pattern', 'category', 'reaction'] as const).map((type) => {
    const all = history.flatMap((s) => {
      const r = s.resultsByType[type]
      return r ? [r.correct / Math.max(r.total, 1)] : []
    })
    const avg = all.length > 0 ? all.reduce((a, b) => a + b, 0) / all.length : 0
    return { subject: GAME_LABEL[type], value: Math.round(avg * 100) }
  })

  const expPercent = Math.round((progress.exp / progress.expToNext) * 100)
  const unlockedAchievements = progress.achievements.filter((a) => a.unlockedAt)

  return (
    <div className="min-h-screen px-4 py-8 max-w-lg mx-auto flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white">← 戻る</button>
        <h1 className="text-2xl font-black">ダッシュボード</h1>
      </div>

      {/* レベル */}
      <div className="bg-gray-800 rounded-2xl p-6 flex flex-col gap-3">
        <div className="flex justify-between">
          <span className="font-bold">Lv.{progress.level}</span>
          <span className="text-yellow-400">🔥 {progress.streak}日連続</span>
        </div>
        <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${expPercent}%` }} />
        </div>
        <p className="text-xs text-gray-500 text-right">{progress.exp} / {progress.expToNext} EXP</p>
      </div>

      {/* スコア推移 */}
      {lineData.length > 0 && (
        <div className="bg-gray-800 rounded-2xl p-6">
          <h2 className="text-sm text-gray-400 mb-4">スコア推移（直近14回）</h2>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={lineData}>
              <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 10 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} domain={[0, 1000]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: 8 }}
                formatter={(v, _name, p: any) => [`${v}pt (${p.payload.rank})`, 'スコア']}
              />
              <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* レーダーチャート */}
      {history.length > 0 && (
        <div className="bg-gray-800 rounded-2xl p-6">
          <h2 className="text-sm text-gray-400 mb-4">ゲーム別正解率</h2>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Radar name="正解率" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 実績 */}
      <div className="bg-gray-800 rounded-2xl p-6">
        <h2 className="text-sm text-gray-400 mb-4">実績 ({unlockedAchievements.length}/{progress.achievements.length})</h2>
        <div className="grid grid-cols-1 gap-2">
          {progress.achievements.map((a) => (
            <div key={a.id} className={`flex items-center gap-3 p-3 rounded-xl ${a.unlockedAt ? 'bg-indigo-900' : 'bg-gray-900 opacity-50'}`}>
              <span className="text-2xl">{a.unlockedAt ? '🏆' : '🔒'}</span>
              <div>
                <p className="font-bold text-sm">{a.name}</p>
                <p className="text-xs text-gray-400">{a.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
