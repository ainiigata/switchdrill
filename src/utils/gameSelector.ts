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

function generateStroopQuestion(level: number): StroopQuestion {
  // レベルが低いほど色の種類を絞って選びやすくする
  const colorCount = level < 15 ? 2 : level < 30 ? 3 : 4
  const available = COLORS.slice(0, colorCount)
  const word = available[randomInt(0, available.length - 1)]
  let inkColor: ColorName
  do { inkColor = available[randomInt(0, available.length - 1)] } while (inkColor === word)
  const choices = shuffle(available) as ColorName[]
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

type CategoryEntry = { word: string; categoryA: string; categoryB: string; correct: 'A' | 'B'; minLevel: number }

const CATEGORY_DATA: CategoryEntry[] = [
  // 簡単（level 1〜）
  { word: '犬', categoryA: '動物', categoryB: '食べ物', correct: 'A', minLevel: 1 },
  { word: '寿司', categoryA: '動物', categoryB: '食べ物', correct: 'B', minLevel: 1 },
  { word: '猫', categoryA: '動物', categoryB: '食べ物', correct: 'A', minLevel: 1 },
  { word: 'ラーメン', categoryA: '動物', categoryB: '食べ物', correct: 'B', minLevel: 1 },
  { word: 'バス', categoryA: '乗り物', categoryB: '建物', correct: 'A', minLevel: 1 },
  { word: 'ビル', categoryA: '乗り物', categoryB: '建物', correct: 'B', minLevel: 1 },
  // 中程度（level 10〜）
  { word: 'Excel', categoryA: '仕事', categoryB: '趣味', correct: 'A', minLevel: 10 },
  { word: 'ゲーム', categoryA: '仕事', categoryB: '趣味', correct: 'B', minLevel: 10 },
  { word: '会議', categoryA: '仕事', categoryB: '趣味', correct: 'A', minLevel: 10 },
  { word: '読書', categoryA: '仕事', categoryB: '趣味', correct: 'B', minLevel: 10 },
  { word: 'サバ', categoryA: '魚', categoryB: '野菜', correct: 'A', minLevel: 10 },
  { word: 'キャベツ', categoryA: '魚', categoryB: '野菜', correct: 'B', minLevel: 10 },
  // 難しい（level 25〜）：紛らわしいカテゴリ
  { word: 'タコ', categoryA: '魚介類', categoryB: '肉類', correct: 'A', minLevel: 25 },
  { word: 'イカ', categoryA: '肉類', categoryB: '魚介類', correct: 'B', minLevel: 25 },
  { word: 'コウモリ', categoryA: '鳥類', categoryB: '哺乳類', correct: 'B', minLevel: 25 },
  { word: 'クジラ', categoryA: '魚類', categoryB: '哺乳類', correct: 'B', minLevel: 25 },
  { word: 'トマト', categoryA: '野菜', categoryB: '果物', correct: 'A', minLevel: 25 },
  { word: 'アボカド', categoryA: '野菜', categoryB: '果物', correct: 'B', minLevel: 25 },
]

function generateCategoryQuestion(level: number): CategoryQuestion {
  const pool = CATEGORY_DATA.filter(d => d.minLevel <= level)
  const d = pool[randomInt(0, pool.length - 1)]
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

function generateReactionQuestion(level: number): ReactionQuestion {
  const targetShape = SHAPES[randomInt(0, 2)]
  const targetColor = REACTION_COLORS[randomInt(0, 2)]
  // レベルが高いほどshouldTap=trueの確率を下げる（フェイクが増えて難しくなる）
  // level1: 70%, level50: 30%
  const tapProbability = 0.70 - (level - 1) / (50 - 1) * 0.40
  if (Math.random() < tapProbability) {
    // shouldTap=true: displayを targetに一致させる
    return { type: 'reaction', targetShape, targetColor, displayShape: targetShape, displayColor: targetColor, shouldTap: true }
  }
  // shouldTap=false: 少なくとも1つ不一致にする
  let displayShape = SHAPES[randomInt(0, 2)]
  let displayColor = REACTION_COLORS[randomInt(0, 2)]
  if (displayShape === targetShape && displayColor === targetColor) {
    displayShape = SHAPES[(SHAPES.indexOf(targetShape) + 1) % SHAPES.length]
  }
  return { type: 'reaction', targetShape, targetColor, displayShape, displayColor, shouldTap: false }
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
      case 'stroop': questions.push(generateStroopQuestion(level)); break
      case 'pattern': questions.push(generatePatternQuestion(level)); break
      case 'category': questions.push(generateCategoryQuestion(level)); break
      case 'reaction': questions.push(generateReactionQuestion(level)); break
    }
  }
  return questions
}
