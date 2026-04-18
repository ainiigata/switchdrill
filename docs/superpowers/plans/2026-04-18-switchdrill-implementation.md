# SwitchDrill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ビジネスパーソン向けのマルチタスク注意切り替えトレーニングWebアプリ「SwitchDrill」を構築する。

**Architecture:** Viteで初期化したReact+TypeScriptプロジェクト。Zustandで状態管理、localStorageで進捗永続化、Rechartsでグラフ描画。5種のミニゲームをランダム順に10問こなす1セッション形式。

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS v3, Zustand, Recharts, React Router v6, Vitest + @testing-library/react

---

## ファイル構成（全体）

```
projects/switchdrill/
  src/
    types/index.ts            # 全型定義
    utils/
      scoring.ts              # スコア計算ロジック
      gameSelector.ts         # ゲームランダム選択
      difficulty.ts           # 難易度パラメータ生成
      storage.ts              # localStorage読み書き
    store/
      gameStore.ts            # セッション状態（Zustand）
      progressStore.ts        # 進捗・レベル・実績（Zustand）
    hooks/
      useTimer.ts             # タイマーロジック
      useGameSession.ts       # ゲームセッション制御
    components/
      ui/
        TimerBar.tsx          # 残り時間バー
        ScoreDisplay.tsx      # スコア・コンボ表示
        ComboIndicator.tsx    # コンボエフェクト
      games/
        CalcGame.tsx          # 計算ゲーム
        StroopGame.tsx        # ストループテスト
        PatternGame.tsx       # パターン記憶
        CategoryGame.tsx      # カテゴリ分類
        ReactionGame.tsx      # 反応タップ
    pages/
      Home.tsx                # トップ画面
      Game.tsx                # ゲームセッション画面
      Result.tsx              # 結果画面
      Dashboard.tsx           # ダッシュボード
    App.tsx                   # ルーティング
    main.tsx                  # エントリポイント
  tests/
    utils/scoring.test.ts
    utils/gameSelector.test.ts
    utils/difficulty.test.ts
    utils/storage.test.ts
    hooks/useTimer.test.ts
    hooks/useGameSession.test.ts
```

---

## Task 1: プロジェクト初期化

**Files:**
- Create: `projects/switchdrill/` (Viteプロジェクト全体)

- [ ] **Step 1: Viteプロジェクト作成**

```bash
cd /Users/yamadatoshi/yamada-ai-claude/projects
npm create vite@latest switchdrill -- --template react-ts
cd switchdrill
```

- [ ] **Step 2: 依存パッケージインストール**

```bash
npm install
npm install zustand react-router-dom recharts
npm install -D tailwindcss postcss autoprefixer vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

- [ ] **Step 3: Tailwind初期化**

```bash
npx tailwindcss init -p
```

- [ ] **Step 4: tailwind.config.js を設定**

`tailwind.config.js` を以下に置き換え:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Noto Sans JP'", "sans-serif"],
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 5: src/index.css をTailwindのみに置き換え**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap');

body {
  @apply bg-gray-950 text-white min-h-screen;
}
```

- [ ] **Step 6: vitest.config.ts を作成**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
})
```

- [ ] **Step 7: tests/setup.ts を作成**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 8: package.json に test スクリプト追加**

`package.json` の `"scripts"` に追加:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 9: 起動確認**

```bash
npm run dev
```

ブラウザで `http://localhost:5173` が開けばOK。

- [ ] **Step 10: コミット**

```bash
git init
git add .
git commit -m "chore: initialize SwitchDrill project with Vite + React + TS + Tailwind + Zustand"
```

---

## Task 2: 型定義

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: src/types/index.ts を作成**

```ts
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
```

- [ ] **Step 2: コミット**

```bash
git add src/types/index.ts
git commit -m "feat: add type definitions for all game types and session state"
```

---

## Task 3: スコア計算ユーティリティ

**Files:**
- Create: `src/utils/scoring.ts`
- Create: `tests/utils/scoring.test.ts`

- [ ] **Step 1: テストを書く**

`tests/utils/scoring.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { calcQuestionScore, calcRank, calcExpGain } from '../../src/utils/scoring'

describe('calcQuestionScore', () => {
  it('正解・素早い回答で高スコアになる', () => {
    const score = calcQuestionScore({ correct: true, reactionTimeMs: 500, timeLimitMs: 5000, comboCount: 0 })
    expect(score).toBeGreaterThan(90)
  })

  it('不正解は0点', () => {
    const score = calcQuestionScore({ correct: false, reactionTimeMs: 500, timeLimitMs: 5000, comboCount: 0 })
    expect(score).toBe(0)
  })

  it('タイムアウト近くは低スコア', () => {
    const score = calcQuestionScore({ correct: true, reactionTimeMs: 4800, timeLimitMs: 5000, comboCount: 0 })
    expect(score).toBeLessThan(30)
  })

  it('コンボが高いほどボーナスが乗る', () => {
    const noCombo = calcQuestionScore({ correct: true, reactionTimeMs: 1000, timeLimitMs: 5000, comboCount: 0 })
    const withCombo = calcQuestionScore({ correct: true, reactionTimeMs: 1000, timeLimitMs: 5000, comboCount: 5 })
    expect(withCombo).toBeGreaterThan(noCombo)
  })
})

describe('calcRank', () => {
  it('95%以上はS', () => expect(calcRank(950, 1000)).toBe('S'))
  it('80%以上はA', () => expect(calcRank(800, 1000)).toBe('A'))
  it('65%以上はB', () => expect(calcRank(650, 1000)).toBe('B'))
  it('50%以上はC', () => expect(calcRank(500, 1000)).toBe('C'))
  it('50%未満はD', () => expect(calcRank(499, 1000)).toBe('D'))
})

describe('calcExpGain', () => {
  it('S rankで最も多くEXPを得る', () => {
    expect(calcExpGain('S')).toBeGreaterThan(calcExpGain('A'))
  })
  it('全rankで正の値を返す', () => {
    (['S', 'A', 'B', 'C', 'D'] as const).forEach(rank => {
      expect(calcExpGain(rank)).toBeGreaterThan(0)
    })
  })
})
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
npm test tests/utils/scoring.test.ts
```

Expected: FAIL（モジュールが存在しない）

- [ ] **Step 3: src/utils/scoring.ts を実装**

```ts
import type { SessionRecord } from '../types'

interface QuestionScoreParams {
  correct: boolean
  reactionTimeMs: number
  timeLimitMs: number
  comboCount: number
}

/** 1問あたりのスコアを計算 */
export function calcQuestionScore(params: QuestionScoreParams): number {
  const { correct, reactionTimeMs, timeLimitMs, comboCount } = params
  if (!correct) return 0

  const speedRatio = Math.max(0.2, 1 - reactionTimeMs / timeLimitMs)
  const baseScore = Math.round(100 * speedRatio)
  const comboMultiplier = Math.min(2.0, 1 + comboCount * 0.1)
  return Math.round(baseScore * comboMultiplier)
}

/** セッション合計スコアからランクを算出 */
export function calcRank(totalScore: number, maxPossibleScore: number): SessionRecord['rank'] {
  const ratio = totalScore / maxPossibleScore
  if (ratio >= 0.95) return 'S'
  if (ratio >= 0.80) return 'A'
  if (ratio >= 0.65) return 'B'
  if (ratio >= 0.50) return 'C'
  return 'D'
}

/** ランクに応じたEXP獲得量 */
export function calcExpGain(rank: SessionRecord['rank']): number {
  const table: Record<SessionRecord['rank'], number> = {
    S: 150,
    A: 100,
    B: 70,
    C: 50,
    D: 30,
  }
  return table[rank]
}

/** 10問セッションの最大可能スコアを返す（コンボなし・最速前提） */
export const MAX_SESSION_SCORE = 1000
```

- [ ] **Step 4: テストが通ることを確認**

```bash
npm test tests/utils/scoring.test.ts
```

Expected: PASS（5テスト全て）

- [ ] **Step 5: コミット**

```bash
git add src/utils/scoring.ts tests/utils/scoring.test.ts
git commit -m "feat: add scoring utility with rank calculation and exp gain"
```

---

## Task 4: 難易度パラメータ生成

**Files:**
- Create: `src/utils/difficulty.ts`
- Create: `tests/utils/difficulty.test.ts`

- [ ] **Step 1: テストを書く**

`tests/utils/difficulty.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { getDifficultyParams } from '../../src/utils/difficulty'

describe('getDifficultyParams', () => {
  it('レベル1で制限時間が最大（7000ms）', () => {
    const p = getDifficultyParams(1)
    expect(p.timeLimitMs).toBe(7000)
  })

  it('レベル50で制限時間が最小（2000ms）', () => {
    const p = getDifficultyParams(50)
    expect(p.timeLimitMs).toBe(2000)
  })

  it('レベルが上がるほど制限時間が短くなる', () => {
    const p10 = getDifficultyParams(10)
    const p30 = getDifficultyParams(30)
    expect(p30.timeLimitMs).toBeLessThan(p10.timeLimitMs)
  })

  it('levelフィールドが入力と一致する', () => {
    expect(getDifficultyParams(15).level).toBe(15)
  })
})
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
npm test tests/utils/difficulty.test.ts
```

Expected: FAIL

- [ ] **Step 3: src/utils/difficulty.ts を実装**

```ts
import type { DifficultyParams } from '../types'

const MIN_TIME_LIMIT_MS = 2000
const MAX_TIME_LIMIT_MS = 7000
const MAX_LEVEL = 50

/**
 * レベルに応じた難易度パラメータを返す。
 * レベルが上がるほど制限時間が短くなる（線形補間）。
 */
export function getDifficultyParams(level: number): DifficultyParams {
  const clampedLevel = Math.max(1, Math.min(MAX_LEVEL, level))
  const ratio = (clampedLevel - 1) / (MAX_LEVEL - 1)
  const timeLimitMs = Math.round(
    MAX_TIME_LIMIT_MS - (MAX_TIME_LIMIT_MS - MIN_TIME_LIMIT_MS) * ratio
  )
  return { timeLimitMs, level: clampedLevel }
}
```

- [ ] **Step 4: テストが通ることを確認**

```bash
npm test tests/utils/difficulty.test.ts
```

Expected: PASS

- [ ] **Step 5: コミット**

```bash
git add src/utils/difficulty.ts tests/utils/difficulty.test.ts
git commit -m "feat: add difficulty parameter generator based on player level"
```

---

## Task 5: ゲーム選択ユーティリティ（問題生成）

**Files:**
- Create: `src/utils/gameSelector.ts`
- Create: `tests/utils/gameSelector.test.ts`

- [ ] **Step 1: テストを書く**

`tests/utils/gameSelector.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { generateSession } from '../../src/utils/gameSelector'

describe('generateSession', () => {
  it('10問生成される', () => {
    const questions = generateSession(1)
    expect(questions).toHaveLength(10)
  })

  it('各問題がtypeフィールドを持つ', () => {
    const questions = generateSession(1)
    const validTypes = ['calc', 'stroop', 'pattern', 'category', 'reaction']
    questions.forEach(q => {
      expect(validTypes).toContain(q.type)
    })
  })

  it('calcQuestionはanswer・choicesを持つ', () => {
    // 十分な試行で必ずcalcが入る
    let found = false
    for (let i = 0; i < 20; i++) {
      const qs = generateSession(1)
      const calcQ = qs.find(q => q.type === 'calc')
      if (calcQ && calcQ.type === 'calc') {
        expect(calcQ.choices).toHaveLength(4)
        expect(calcQ.choices).toContain(calcQ.answer)
        found = true
        break
      }
    }
    expect(found).toBe(true)
  })

  it('stroopQuestionはword・inkColor・choicesを持つ', () => {
    let found = false
    for (let i = 0; i < 20; i++) {
      const qs = generateSession(1)
      const q = qs.find(q => q.type === 'stroop')
      if (q && q.type === 'stroop') {
        expect(q.choices).toHaveLength(4)
        expect(q.choices).toContain(q.inkColor)
        found = true
        break
      }
    }
    expect(found).toBe(true)
  })
})
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
npm test tests/utils/gameSelector.test.ts
```

Expected: FAIL

- [ ] **Step 3: src/utils/gameSelector.ts を実装**

```ts
import type {
  GameQuestion, CalcQuestion, StroopQuestion, PatternQuestion,
  CategoryQuestion, ReactionQuestion, ColorName, GameType
} from '../types'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateCalcQuestion(level: number): CalcQuestion {
  const maxN = Math.min(9, 3 + Math.floor(level / 10))
  const operators: CalcQuestion['operator'][] = level < 10
    ? ['+', '-']
    : ['+', '-', '×']
  const op = operators[randomInt(0, operators.length - 1)]
  const a = randomInt(1, maxN)
  const b = randomInt(1, maxN)
  const answer = op === '+' ? a + b : op === '-' ? a - b : a * b

  const wrongAnswers = new Set<number>()
  while (wrongAnswers.size < 3) {
    const w = answer + randomInt(-5, 5)
    if (w !== answer) wrongAnswers.add(w)
  }
  const choices = shuffle([answer, ...wrongAnswers])
  return { type: 'calc', a, b, operator: op, answer, choices }
}

const COLORS: ColorName[] = ['red', 'blue', 'green', 'yellow']

function generateStroopQuestion(): StroopQuestion {
  const word = COLORS[randomInt(0, 3)]
  let inkColor: ColorName
  do { inkColor = COLORS[randomInt(0, 3)] } while (inkColor === word)
  const choices = shuffle(COLORS) as ColorName[]
  return { type: 'stroop', word, inkColor, choices }
}

function generatePatternQuestion(level: number): PatternQuestion {
  const gridSize = (level < 15 ? 3 : level < 35 ? 4 : 5) as 3 | 4 | 5
  const showDurationMs = Math.max(600, 1200 - level * 10)
  const total = gridSize * gridSize
  const litCount = randomInt(Math.floor(total * 0.3), Math.floor(total * 0.6))
  const indices = shuffle([...Array(total).keys()]).slice(0, litCount)
  const flat = Array(total).fill(false)
  indices.forEach(i => { flat[i] = true })
  const pattern: boolean[][] = []
  for (let r = 0; r < gridSize; r++) {
    pattern.push(flat.slice(r * gridSize, r * gridSize + gridSize))
  }
  return { type: 'pattern', gridSize, pattern, showDurationMs }
}

const CATEGORY_DATA: Array<{ word: string; categoryA: string; categoryB: string; correct: 'A' | 'B' }> = [
  { word: '犬', categoryA: '動物', categoryB: '食べ物', correct: 'A' },
  { word: '寿司', categoryA: '動物', categoryB: '食べ物', correct: 'B' },
  { word: '猫', categoryA: '動物', categoryB: '食べ物', correct: 'A' },
  { word: 'ラーメン', categoryA: '動物', categoryB: '食べ物', correct: 'B' },
  { word: 'Excel', categoryA: '仕事', categoryB: '趣味', correct: 'A' },
  { word: 'ゲーム', categoryA: '仕事', categoryB: '趣味', correct: 'B' },
  { word: '会議', categoryA: '仕事', categoryB: '趣味', correct: 'A' },
  { word: '読書', categoryA: '仕事', categoryB: '趣味', correct: 'B' },
  { word: 'バス', categoryA: '乗り物', categoryB: '建物', correct: 'A' },
  { word: 'ビル', categoryA: '乗り物', categoryB: '建物', correct: 'B' },
]

function generateCategoryQuestion(): CategoryQuestion {
  const d = CATEGORY_DATA[randomInt(0, CATEGORY_DATA.length - 1)]
  return {
    type: 'category',
    word: d.word,
    categoryA: d.categoryA,
    categoryB: d.categoryB,
    correctCategory: d.correct,
  }
}

const SHAPES = ['circle', 'square', 'triangle'] as const
const REACTION_COLORS = ['red', 'blue', 'green'] as const

function generateReactionQuestion(): ReactionQuestion {
  const targetShape = SHAPES[randomInt(0, 2)]
  const targetColor = REACTION_COLORS[randomInt(0, 2)]
  const displayShape = SHAPES[randomInt(0, 2)]
  const displayColor = REACTION_COLORS[randomInt(0, 2)]
  const shouldTap = displayShape === targetShape && displayColor === targetColor
  return { type: 'reaction', targetShape, targetColor, displayShape, displayColor, shouldTap }
}

const GAME_TYPES: GameType[] = ['calc', 'stroop', 'pattern', 'category', 'reaction']

/** 10問のセッションを生成する */
export function generateSession(level: number): GameQuestion[] {
  // 各ゲームを2問ずつ、計10問（ランダム順）
  const questions: GameQuestion[] = []
  const types = shuffle([...GAME_TYPES, ...GAME_TYPES])
  for (const type of types) {
    switch (type) {
      case 'calc': questions.push(generateCalcQuestion(level)); break
      case 'stroop': questions.push(generateStroopQuestion()); break
      case 'pattern': questions.push(generatePatternQuestion(level)); break
      case 'category': questions.push(generateCategoryQuestion()); break
      case 'reaction': questions.push(generateReactionQuestion()); break
    }
  }
  return questions
}
```

- [ ] **Step 4: テストが通ることを確認**

```bash
npm test tests/utils/gameSelector.test.ts
```

Expected: PASS

- [ ] **Step 5: コミット**

```bash
git add src/utils/gameSelector.ts tests/utils/gameSelector.test.ts
git commit -m "feat: add session generator with 5 mini-game question factories"
```

---

## Task 6: localStorageユーティリティ

**Files:**
- Create: `src/utils/storage.ts`
- Create: `tests/utils/storage.test.ts`

- [ ] **Step 1: テストを書く**

`tests/utils/storage.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { saveProgress, loadProgress, DEFAULT_PROGRESS } from '../../src/utils/storage'

beforeEach(() => {
  localStorage.clear()
})

describe('saveProgress / loadProgress', () => {
  it('保存したデータを読み込める', () => {
    const progress = { ...DEFAULT_PROGRESS, level: 5, streak: 3 }
    saveProgress(progress)
    const loaded = loadProgress()
    expect(loaded.level).toBe(5)
    expect(loaded.streak).toBe(3)
  })

  it('データがない場合はDEFAULT_PROGRESSを返す', () => {
    const loaded = loadProgress()
    expect(loaded.level).toBe(DEFAULT_PROGRESS.level)
    expect(loaded.streak).toBe(DEFAULT_PROGRESS.streak)
  })
})
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
npm test tests/utils/storage.test.ts
```

Expected: FAIL

- [ ] **Step 3: src/utils/storage.ts を実装**

```ts
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
```

- [ ] **Step 4: テストが通ることを確認**

```bash
npm test tests/utils/storage.test.ts
```

Expected: PASS

- [ ] **Step 5: コミット**

```bash
git add src/utils/storage.ts tests/utils/storage.test.ts
git commit -m "feat: add localStorage persistence utility with default progress"
```

---

## Task 7: Zustand Store（gameStore & progressStore）

**Files:**
- Create: `src/store/gameStore.ts`
- Create: `src/store/progressStore.ts`

- [ ] **Step 1: src/store/gameStore.ts を作成**

```ts
import { create } from 'zustand'
import type { GameSession, QuestionResult, GameQuestion } from '../types'

interface GameStoreState {
  session: GameSession | null
  startSession: (questions: GameQuestion[]) => void
  recordResult: (result: QuestionResult) => void
  nextQuestion: () => void
  resetSession: () => void
}

export const useGameStore = create<GameStoreState>((set) => ({
  session: null,

  startSession: (questions) =>
    set({
      session: {
        questions,
        currentIndex: 0,
        results: [],
        comboCount: 0,
        totalScore: 0,
        startedAt: Date.now(),
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
```

- [ ] **Step 2: src/store/progressStore.ts を作成**

```ts
import { create } from 'zustand'
import type { PlayerProgress, SessionRecord } from '../types'
import { loadProgress, saveProgress } from '../utils/storage'
import { calcExpGain } from '../utils/scoring'

interface ProgressStoreState {
  progress: PlayerProgress
  applySessionResult: (record: SessionRecord, maxCombo: number) => void
  loadFromStorage: () => void
}

const EXP_PER_LEVEL = 100

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

    // EXP・レベル計算
    const expGain = calcExpGain(record.rank)
    let newExp = progress.exp + expGain
    let newLevel = progress.level
    let newExpToNext = progress.expToNext
    while (newExp >= newExpToNext && newLevel < 50) {
      newExp -= newExpToNext
      newLevel++
      newExpToNext = EXP_PER_LEVEL + newLevel * 10
    }

    // 実績チェック
    const updatedAchievements = progress.achievements.map((a) => {
      if (a.unlockedAt) return a
      const now = new Date().toISOString()
      if (a.id === 'first_session') return { ...a, unlockedAt: now }
      if (a.id === 'rank_s' && record.rank === 'S') return { ...a, unlockedAt: now }
      if (a.id === 'streak_3' && newStreak >= 3) return { ...a, unlockedAt: now }
      if (a.id === 'streak_7' && newStreak >= 7) return { ...a, unlockedAt: now }
      if (a.id === 'level_10' && newLevel >= 10) return { ...a, unlockedAt: now }
      if (a.id === 'level_30' && newLevel >= 30) return { ...a, unlockedAt: now }
      if (a.id === 'combo_5' && maxCombo >= 5) return { ...a, unlockedAt: now }
      if (a.id === 'combo_10' && maxCombo >= 10) return { ...a, unlockedAt: now }
      if (a.id === 'sessions_10' && progress.sessionHistory.length + 1 >= 10) return { ...a, unlockedAt: now }
      return a
    })

    const newProgress: PlayerProgress = {
      ...progress,
      level: newLevel,
      exp: newExp,
      expToNext: newExpToNext,
      streak: newStreak,
      lastPlayedDate: today,
      sessionHistory: [...progress.sessionHistory, record].slice(-30),
      achievements: updatedAchievements,
    }

    saveProgress(newProgress)
    set({ progress: newProgress })
  },
}))
```

- [ ] **Step 3: コミット**

```bash
git add src/store/gameStore.ts src/store/progressStore.ts
git commit -m "feat: add Zustand stores for game session and player progress"
```

---

## Task 8: タイマーフック

**Files:**
- Create: `src/hooks/useTimer.ts`
- Create: `tests/hooks/useTimer.test.ts`

- [ ] **Step 1: テストを書く**

`tests/hooks/useTimer.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTimer } from '../../src/hooks/useTimer'

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

describe('useTimer', () => {
  it('初期状態はrunning=false、elapsed=0', () => {
    const { result } = renderHook(() => useTimer(5000))
    expect(result.current.running).toBe(false)
    expect(result.current.elapsedMs).toBe(0)
  })

  it('start後にelapsedが増加する', () => {
    const { result } = renderHook(() => useTimer(5000))
    act(() => { result.current.start() })
    act(() => { vi.advanceTimersByTime(1000) })
    expect(result.current.elapsedMs).toBeGreaterThanOrEqual(1000)
  })

  it('制限時間に達するとonTimeoutが呼ばれる', () => {
    const onTimeout = vi.fn()
    const { result } = renderHook(() => useTimer(2000, onTimeout))
    act(() => { result.current.start() })
    act(() => { vi.advanceTimersByTime(2100) })
    expect(onTimeout).toHaveBeenCalledTimes(1)
  })

  it('reset後にelapsedが0に戻る', () => {
    const { result } = renderHook(() => useTimer(5000))
    act(() => { result.current.start() })
    act(() => { vi.advanceTimersByTime(1000) })
    act(() => { result.current.reset() })
    expect(result.current.elapsedMs).toBe(0)
    expect(result.current.running).toBe(false)
  })
})
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
npm test tests/hooks/useTimer.test.ts
```

Expected: FAIL

- [ ] **Step 3: src/hooks/useTimer.ts を実装**

```ts
import { useState, useRef, useCallback, useEffect } from 'react'

interface UseTimerReturn {
  elapsedMs: number
  running: boolean
  start: () => void
  reset: () => void
}

export function useTimer(timeLimitMs: number, onTimeout?: () => void): UseTimerReturn {
  const [elapsedMs, setElapsedMs] = useState(0)
  const [running, setRunning] = useState(false)
  const startTimeRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const timedOutRef = useRef(false)

  const tick = useCallback(() => {
    if (startTimeRef.current === null) return
    const elapsed = Date.now() - startTimeRef.current
    setElapsedMs(elapsed)
    if (elapsed >= timeLimitMs && !timedOutRef.current) {
      timedOutRef.current = true
      setRunning(false)
      onTimeout?.()
      return
    }
    if (elapsed < timeLimitMs) {
      rafRef.current = requestAnimationFrame(tick)
    }
  }, [timeLimitMs, onTimeout])

  const start = useCallback(() => {
    timedOutRef.current = false
    startTimeRef.current = Date.now()
    setElapsedMs(0)
    setRunning(true)
  }, [])

  const reset = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    startTimeRef.current = null
    timedOutRef.current = false
    setElapsedMs(0)
    setRunning(false)
  }, [])

  useEffect(() => {
    if (running) {
      rafRef.current = requestAnimationFrame(tick)
    } else {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [running, tick])

  return { elapsedMs, running, start, reset }
}
```

- [ ] **Step 4: テストが通ることを確認**

```bash
npm test tests/hooks/useTimer.test.ts
```

Expected: PASS

- [ ] **Step 5: コミット**

```bash
git add src/hooks/useTimer.ts tests/hooks/useTimer.test.ts
git commit -m "feat: add useTimer hook with RAF-based elapsed tracking and timeout callback"
```

---

## Task 9: ゲームセッションフック

**Files:**
- Create: `src/hooks/useGameSession.ts`

- [ ] **Step 1: src/hooks/useGameSession.ts を作成**

```ts
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { useProgressStore } from '../store/progressStore'
import { calcQuestionScore, calcRank, MAX_SESSION_SCORE } from '../utils/scoring'
import { getDifficultyParams } from '../utils/difficulty'
import { generateSession } from '../utils/gameSelector'
import type { GameType, SessionRecord } from '../types'

export function useGameSession() {
  const navigate = useNavigate()
  const { session, startSession, recordResult, nextQuestion, resetSession } = useGameStore()
  const { progress, applySessionResult } = useProgressStore()

  const start = useCallback(() => {
    const questions = generateSession(progress.level)
    startSession(questions)
    navigate('/game')
  }, [progress.level, startSession, navigate])

  const submitAnswer = useCallback(
    (correct: boolean, reactionTimeMs: number) => {
      if (!session) return
      const { timeLimitMs } = getDifficultyParams(progress.level)
      const score = calcQuestionScore({
        correct,
        reactionTimeMs,
        timeLimitMs,
        comboCount: session.comboCount,
      })
      recordResult({ gameType: session.questions[session.currentIndex].type as GameType, correct, reactionTimeMs, score })

      const isLast = session.currentIndex >= session.questions.length - 1
      if (isLast) {
        finishSession()
      } else {
        nextQuestion()
      }
    },
    [session, progress.level, recordResult, nextQuestion]
  )

  const finishSession = useCallback(() => {
    if (!session) return
    const results = [...session.results]
    const totalScore = session.totalScore
    const rank = calcRank(totalScore, MAX_SESSION_SCORE)
    const avgReactionMs =
      results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + r.reactionTimeMs, 0) / results.length)
        : 0

    const resultsByType = {} as SessionRecord['resultsByType']
    ;(['calc', 'stroop', 'pattern', 'category', 'reaction'] as GameType[]).forEach((type) => {
      const typed = results.filter((r) => r.gameType === type)
      resultsByType[type] = { correct: typed.filter((r) => r.correct).length, total: typed.length }
    })

    const record: SessionRecord = {
      date: new Date().toISOString(),
      totalScore,
      rank,
      avgReactionMs,
      resultsByType,
    }

    const maxCombo = results.reduce((max, _, i, arr) => {
      let combo = 0
      for (let j = i; j < arr.length && arr[j].correct; j++) combo++
      return Math.max(max, combo)
    }, 0)

    applySessionResult(record, maxCombo)
    navigate('/result')
  }, [session, applySessionResult, navigate])

  const handleTimeout = useCallback(() => {
    submitAnswer(false, getDifficultyParams(progress.level).timeLimitMs)
  }, [submitAnswer, progress.level])

  return { session, start, submitAnswer, handleTimeout, resetSession }
}
```

- [ ] **Step 2: コミット**

```bash
git add src/hooks/useGameSession.ts
git commit -m "feat: add useGameSession hook for session lifecycle management"
```

---

## Task 10: 共通UIコンポーネント

**Files:**
- Create: `src/components/ui/TimerBar.tsx`
- Create: `src/components/ui/ScoreDisplay.tsx`
- Create: `src/components/ui/ComboIndicator.tsx`

- [ ] **Step 1: src/components/ui/TimerBar.tsx を作成**

```tsx
interface TimerBarProps {
  elapsedMs: number
  timeLimitMs: number
}

export function TimerBar({ elapsedMs, timeLimitMs }: TimerBarProps) {
  const ratio = Math.min(1, elapsedMs / timeLimitMs)
  const remaining = 1 - ratio
  const color = remaining > 0.5 ? 'bg-green-400' : remaining > 0.25 ? 'bg-yellow-400' : 'bg-red-500'

  return (
    <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-none ${color}`}
        style={{ width: `${remaining * 100}%` }}
      />
    </div>
  )
}
```

- [ ] **Step 2: src/components/ui/ScoreDisplay.tsx を作成**

```tsx
interface ScoreDisplayProps {
  score: number
  questionIndex: number
  totalQuestions: number
}

export function ScoreDisplay({ score, questionIndex, totalQuestions }: ScoreDisplayProps) {
  return (
    <div className="flex items-center justify-between text-sm text-gray-300">
      <span className="font-bold text-white text-lg">{score.toLocaleString()} pt</span>
      <span>{questionIndex + 1} / {totalQuestions}</span>
    </div>
  )
}
```

- [ ] **Step 3: src/components/ui/ComboIndicator.tsx を作成**

```tsx
interface ComboIndicatorProps {
  combo: number
}

export function ComboIndicator({ combo }: ComboIndicatorProps) {
  if (combo < 2) return null
  return (
    <div className="text-center animate-bounce">
      <span className="text-yellow-400 font-black text-2xl">{combo} COMBO!</span>
    </div>
  )
}
```

- [ ] **Step 4: コミット**

```bash
git add src/components/ui/
git commit -m "feat: add TimerBar, ScoreDisplay, ComboIndicator UI components"
```

---

## Task 11: ミニゲーム — CalcGame

**Files:**
- Create: `src/components/games/CalcGame.tsx`

- [ ] **Step 1: src/components/games/CalcGame.tsx を作成**

```tsx
import type { CalcQuestion } from '../../types'

interface CalcGameProps {
  question: CalcQuestion
  onAnswer: (correct: boolean) => void
}

export function CalcGame({ question, onAnswer }: CalcGameProps) {
  const { a, b, operator, answer, choices } = question

  return (
    <div className="flex flex-col items-center gap-8">
      <p className="text-5xl font-black text-white">
        {a} {operator} {b} = ?
      </p>
      <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
        {choices.map((choice) => (
          <button
            key={choice}
            onClick={() => onAnswer(choice === answer)}
            className="py-5 text-2xl font-bold rounded-2xl bg-indigo-700 hover:bg-indigo-500 active:scale-95 transition-transform"
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: コミット**

```bash
git add src/components/games/CalcGame.tsx
git commit -m "feat: add CalcGame mini-game component"
```

---

## Task 12: ミニゲーム — StroopGame

**Files:**
- Create: `src/components/games/StroopGame.tsx`

- [ ] **Step 1: src/components/games/StroopGame.tsx を作成**

```tsx
import type { StroopQuestion, ColorName } from '../../types'

interface StroopGameProps {
  question: StroopQuestion
  onAnswer: (correct: boolean) => void
}

const COLOR_LABEL: Record<ColorName, string> = {
  red: '赤',
  blue: '青',
  green: '緑',
  yellow: '黄',
}

const INK_CLASS: Record<ColorName, string> = {
  red: 'text-red-500',
  blue: 'text-blue-400',
  green: 'text-green-400',
  yellow: 'text-yellow-300',
}

const BUTTON_CLASS: Record<ColorName, string> = {
  red: 'bg-red-600 hover:bg-red-400',
  blue: 'bg-blue-600 hover:bg-blue-400',
  green: 'bg-green-600 hover:bg-green-400',
  yellow: 'bg-yellow-500 hover:bg-yellow-300',
}

export function StroopGame({ question, onAnswer }: StroopGameProps) {
  const { word, inkColor, choices } = question

  return (
    <div className="flex flex-col items-center gap-8">
      <p className="text-sm text-gray-400">この文字の「色」を選んでください</p>
      <p className={`text-7xl font-black ${INK_CLASS[inkColor]}`}>
        {COLOR_LABEL[word]}
      </p>
      <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
        {choices.map((c) => (
          <button
            key={c}
            onClick={() => onAnswer(c === inkColor)}
            className={`py-5 text-xl font-bold rounded-2xl active:scale-95 transition-transform ${BUTTON_CLASS[c]}`}
          >
            {COLOR_LABEL[c]}
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: コミット**

```bash
git add src/components/games/StroopGame.tsx
git commit -m "feat: add StroopGame mini-game component"
```

---

## Task 13: ミニゲーム — PatternGame

**Files:**
- Create: `src/components/games/PatternGame.tsx`

- [ ] **Step 1: src/components/games/PatternGame.tsx を作成**

```tsx
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
```

- [ ] **Step 2: コミット**

```bash
git add src/components/games/PatternGame.tsx
git commit -m "feat: add PatternGame mini-game with show/input phase"
```

---

## Task 14: ミニゲーム — CategoryGame & ReactionGame

**Files:**
- Create: `src/components/games/CategoryGame.tsx`
- Create: `src/components/games/ReactionGame.tsx`

- [ ] **Step 1: src/components/games/CategoryGame.tsx を作成**

```tsx
import type { CategoryQuestion } from '../../types'

interface CategoryGameProps {
  question: CategoryQuestion
  onAnswer: (correct: boolean) => void
}

export function CategoryGame({ question, onAnswer }: CategoryGameProps) {
  const { word, categoryA, categoryB, correctCategory } = question

  return (
    <div className="flex flex-col items-center gap-10">
      <p className="text-sm text-gray-400">どちらのカテゴリに属しますか？</p>
      <p className="text-6xl font-black text-white">{word}</p>
      <div className="flex gap-6 w-full max-w-sm">
        <button
          onClick={() => onAnswer(correctCategory === 'A')}
          className="flex-1 py-6 text-xl font-bold rounded-2xl bg-purple-700 hover:bg-purple-500 active:scale-95 transition-transform"
        >
          {categoryA}
        </button>
        <button
          onClick={() => onAnswer(correctCategory === 'B')}
          className="flex-1 py-6 text-xl font-bold rounded-2xl bg-teal-700 hover:bg-teal-500 active:scale-95 transition-transform"
        >
          {categoryB}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: src/components/games/ReactionGame.tsx を作成**

```tsx
import type { ReactionQuestion } from '../../types'

interface ReactionGameProps {
  question: ReactionQuestion
  onAnswer: (correct: boolean) => void
}

const COLOR_MAP: Record<string, string> = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
}

function Shape({ shape, color }: { shape: string; color: string }) {
  const colorClass = COLOR_MAP[color] ?? 'bg-gray-400'
  if (shape === 'circle') {
    return <div className={`w-32 h-32 rounded-full ${colorClass}`} />
  }
  if (shape === 'square') {
    return <div className={`w-32 h-32 rounded-lg ${colorClass}`} />
  }
  // triangle
  return (
    <div
      className="w-0 h-0"
      style={{
        borderLeft: '64px solid transparent',
        borderRight: '64px solid transparent',
        borderBottom: `110px solid ${color === 'red' ? '#ef4444' : color === 'blue' ? '#3b82f6' : '#22c55e'}`,
      }}
    />
  )
}

export function ReactionGame({ question, onAnswer }: ReactionGameProps) {
  const { targetShape, targetColor, displayShape, displayColor, shouldTap } = question

  return (
    <div className="flex flex-col items-center gap-8">
      <p className="text-sm text-gray-400">
        ターゲット: <span className="text-white font-bold">{targetShape} / {targetColor}</span>
      </p>
      <div className="flex items-center justify-center h-40">
        <Shape shape={displayShape} color={displayColor} />
      </div>
      <div className="flex gap-6">
        <button
          onClick={() => onAnswer(shouldTap)}
          className="px-10 py-5 text-xl font-bold rounded-2xl bg-green-600 hover:bg-green-400 active:scale-95 transition-transform"
        >
          タップ！
        </button>
        <button
          onClick={() => onAnswer(!shouldTap)}
          className="px-10 py-5 text-xl font-bold rounded-2xl bg-gray-700 hover:bg-gray-500 active:scale-95 transition-transform"
        >
          スルー
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: コミット**

```bash
git add src/components/games/CategoryGame.tsx src/components/games/ReactionGame.tsx
git commit -m "feat: add CategoryGame and ReactionGame mini-game components"
```

---

## Task 15: ホーム画面

**Files:**
- Create: `src/pages/Home.tsx`

- [ ] **Step 1: src/pages/Home.tsx を作成**

```tsx
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
```

- [ ] **Step 2: コミット**

```bash
git add src/pages/Home.tsx
git commit -m "feat: add Home page with level, streak, and start button"
```

---

## Task 16: ゲーム画面

**Files:**
- Create: `src/pages/Game.tsx`

- [ ] **Step 1: src/pages/Game.tsx を作成**

```tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { useProgressStore } from '../store/progressStore'
import { useGameSession } from '../hooks/useGameSession'
import { useTimer } from '../hooks/useTimer'
import { getDifficultyParams } from '../utils/difficulty'
import { TimerBar } from '../components/ui/TimerBar'
import { ScoreDisplay } from '../components/ui/ScoreDisplay'
import { ComboIndicator } from '../components/ui/ComboIndicator'
import { CalcGame } from '../components/games/CalcGame'
import { StroopGame } from '../components/games/StroopGame'
import { PatternGame } from '../components/games/PatternGame'
import { CategoryGame } from '../components/games/CategoryGame'
import { ReactionGame } from '../components/games/ReactionGame'
import type { GameQuestion } from '../types'

function GameContent({ question, onAnswer }: { question: GameQuestion; onAnswer: (correct: boolean) => void }) {
  switch (question.type) {
    case 'calc': return <CalcGame question={question} onAnswer={onAnswer} />
    case 'stroop': return <StroopGame question={question} onAnswer={onAnswer} />
    case 'pattern': return <PatternGame question={question} onAnswer={onAnswer} />
    case 'category': return <CategoryGame question={question} onAnswer={onAnswer} />
    case 'reaction': return <ReactionGame question={question} onAnswer={onAnswer} />
  }
}

export function Game() {
  const navigate = useNavigate()
  const { session } = useGameStore()
  const { progress } = useProgressStore()
  const { submitAnswer, handleTimeout } = useGameSession()
  const { timeLimitMs } = getDifficultyParams(progress.level)
  const { elapsedMs, start, reset } = useTimer(timeLimitMs, handleTimeout)

  useEffect(() => {
    if (!session) { navigate('/'); return }
    reset()
    start()
  }, [session?.currentIndex])

  if (!session) return null
  const currentQuestion = session.questions[session.currentIndex]

  const handleAnswer = (correct: boolean) => {
    submitAnswer(correct, elapsedMs)
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 gap-6 max-w-lg mx-auto">
      <TimerBar elapsedMs={elapsedMs} timeLimitMs={timeLimitMs} />
      <ScoreDisplay
        score={session.totalScore}
        questionIndex={session.currentIndex}
        totalQuestions={session.questions.length}
      />
      <ComboIndicator combo={session.comboCount} />
      <div className="flex-1 flex items-center justify-center">
        <GameContent question={currentQuestion} onAnswer={handleAnswer} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: コミット**

```bash
git add src/pages/Game.tsx
git commit -m "feat: add Game page with timer, score, and dynamic mini-game rendering"
```

---

## Task 17: 結果画面

**Files:**
- Create: `src/pages/Result.tsx`

- [ ] **Step 1: src/pages/Result.tsx を作成**

```tsx
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
  const { session, resetSession } = useGameStore()
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
```

- [ ] **Step 2: コミット**

```bash
git add src/pages/Result.tsx
git commit -m "feat: add Result page with rank, score breakdown, and achievement display"
```

---

## Task 18: ダッシュボード画面

**Files:**
- Create: `src/pages/Dashboard.tsx`

- [ ] **Step 1: src/pages/Dashboard.tsx を作成**

```tsx
import { useNavigate } from 'react-router-dom'
import { useProgressStore } from '../store/progressStore'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts'

const RANK_COLOR: Record<string, string> = {
  S: '#facc15', A: '#fb923c', B: '#60a5fa', C: '#4ade80', D: '#9ca3af',
}

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
                formatter={(v: number, _: string, p: { payload: { rank: string } }) => [`${v}pt (${p.payload.rank})`, 'スコア']}
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
```

- [ ] **Step 2: コミット**

```bash
git add src/pages/Dashboard.tsx
git commit -m "feat: add Dashboard page with score chart, radar chart, and achievements"
```

---

## Task 19: App.tsx とルーティング組み立て

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: src/App.tsx を置き換え**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { Game } from './pages/Game'
import { Result } from './pages/Result'
import { Dashboard } from './pages/Dashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/result" element={<Result />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 2: src/main.tsx を確認・修正**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 3: 全テスト実行**

```bash
npm test
```

Expected: 全テストPASS

- [ ] **Step 4: 開発サーバーで動作確認**

```bash
npm run dev
```

`http://localhost:5173` でアプリが動くことを確認:
1. ホーム画面が表示される
2. スタートボタンでゲーム画面へ遷移する
3. ミニゲームを10問こなすと結果画面へ遷移する
4. ダッシュボードでグラフ・実績が表示される

- [ ] **Step 5: ビルド確認**

```bash
npm run build
```

Expected: `dist/` フォルダが生成され、エラーなし

- [ ] **Step 6: 最終コミット**

```bash
git add src/App.tsx src/main.tsx
git commit -m "feat: wire up React Router and complete SwitchDrill MVP"
```

---

## 完成チェックリスト

- [ ] 5種類のミニゲームが全て動作する
- [ ] タイマーが動作し、タイムアウト時に自動的に不正解となる
- [ ] スコア・コンボが正しく計算される
- [ ] セッション完了後に結果画面が表示される
- [ ] レベルアップ・EXP獲得が動作する
- [ ] ストリーク・実績が正しく更新される
- [ ] localStorageにデータが保存され、リロード後も保持される
- [ ] ダッシュボードのグラフが表示される
- [ ] スマホサイズでレイアウトが崩れない
- [ ] `npm test` が全件PASS
- [ ] `npm run build` がエラーなし
