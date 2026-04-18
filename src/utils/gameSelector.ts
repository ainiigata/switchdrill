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
