// ゲームの種類
export type GameType = 'calc' | 'stroop' | 'pattern' | 'category' | 'reaction'

// 難易度パラメータ
export interface DifficultyParams {
  timeLimitMs: number      // 回答制限時間（ミリ秒）
  level: number            // プレイヤーの現在レベル (1-50)
}

// 計算ゲームの問題
export interface CalcQuestion {
  type: 'calc'
  a: number
  b: number
  operator: '+' | '-' | '×'
  answer: number
  choices: number[]
}

// ストループテストの問題
export type ColorName = 'red' | 'blue' | 'green' | 'yellow'
export interface StroopQuestion {
  type: 'stroop'
  word: ColorName        // 表示される文字
  inkColor: ColorName    // 文字の色（正解）
  choices: ColorName[]
}

// パターン記憶の問題
export interface PatternQuestion {
  type: 'pattern'
  gridSize: 3 | 4 | 5
  pattern: boolean[][]   // trueのセルが点灯
  showDurationMs: number
}

// カテゴリ分類の問題
export interface CategoryQuestion {
  type: 'category'
  word: string
  categoryA: string
  categoryB: string
  correctCategory: 'A' | 'B'
}

// 反応タップの問題
export interface ReactionQuestion {
  type: 'reaction'
  targetShape: 'circle' | 'square' | 'triangle'
  targetColor: 'red' | 'blue' | 'green'
  displayShape: 'circle' | 'square' | 'triangle'
  displayColor: 'red' | 'blue' | 'green'
  shouldTap: boolean   // trueならタップ、falseならスルー
}

export type GameQuestion =
  | CalcQuestion
  | StroopQuestion
  | PatternQuestion
  | CategoryQuestion
  | ReactionQuestion

// 1問の結果
export interface QuestionResult {
  gameType: GameType
  correct: boolean
  reactionTimeMs: number
  score: number
}

// セッション状態
export interface GameSession {
  questions: GameQuestion[]
  currentIndex: number
  results: QuestionResult[]
  comboCount: number
  totalScore: number
  startedAt: number
}

// セッション完了記録
export interface SessionRecord {
  date: string            // ISO形式
  totalScore: number
  rank: 'S' | 'A' | 'B' | 'C' | 'D'
  avgReactionMs: number
  resultsByType: Record<GameType, { correct: number; total: number }>
}

// 実績
export interface Achievement {
  id: string
  name: string
  description: string
  unlockedAt: string | null  // nullは未解除
}

// プレイヤー進捗
export interface PlayerProgress {
  level: number              // 1-50
  exp: number
  expToNext: number
  streak: number             // 連続プレイ日数
  lastPlayedDate: string | null
  sessionHistory: SessionRecord[]
  achievements: Achievement[]
}
