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

// --- 計算ゲーム ---
// lv1-10:  1桁+/-のみ、選択肢±3〜5
// lv11-20: ×追加、1桁〜2桁(2-15)、選択肢±2〜3
// lv21-30: ÷追加、2桁(5-25)、×は2桁×1桁、選択肢±1〜2
// lv31-40: 2桁+/-（10-49）、2桁×1桁(11-19×2-9)、選択肢±1
// lv41-50: 2桁×1桁(12-29×2-9)、÷(2桁÷1桁)、選択肢がどれも近くて紛らわしい

function generateCalcQuestion(level: number): CalcQuestion {
  type Op = CalcQuestion['operator']
  let operators: Op[]
  let spread: number

  if (level <= 10) {
    operators = ['+', '-']
    spread = randomInt(3, 5)
  } else if (level <= 20) {
    operators = ['+', '-', '×']
    spread = randomInt(2, 3)
  } else if (level <= 30) {
    operators = ['+', '-', '×', '÷']
    spread = randomInt(1, 2)
  } else if (level <= 40) {
    operators = ['+', '-', '×', '÷']
    spread = 1
  } else {
    operators = ['×', '÷', '+', '-']
    spread = 1
  }

  const op = operators[randomInt(0, operators.length - 1)]
  let a: number, b: number, answer: number

  if (op === '+') {
    if (level <= 10) {
      a = randomInt(1, 9); b = randomInt(1, 9)
    } else if (level <= 20) {
      a = randomInt(5, 15); b = randomInt(3, 9)
    } else if (level <= 30) {
      a = randomInt(10, 25); b = randomInt(5, 15)
    } else {
      a = randomInt(10, 49); b = randomInt(10, 49)
    }
    answer = a + b
  } else if (op === '-') {
    if (level <= 10) {
      b = randomInt(1, 8); a = randomInt(b + 1, 9)
    } else if (level <= 20) {
      b = randomInt(3, 9); a = randomInt(b + 1, 15)
    } else if (level <= 30) {
      b = randomInt(5, 15); a = randomInt(b + 5, 30)
    } else {
      b = randomInt(10, 40); a = randomInt(b + 5, 99)
    }
    answer = a - b
  } else if (op === '×') {
    if (level <= 20) {
      a = randomInt(2, 9); b = randomInt(2, 9)
    } else if (level <= 30) {
      a = randomInt(2, 15); b = randomInt(2, 9)
    } else {
      a = randomInt(11, 29); b = randomInt(2, 9)
    }
    answer = a * b
  } else {
    // ÷ : 割り切れる問題
    if (level <= 30) {
      b = randomInt(2, 9)
      const q = randomInt(2, 9)
      a = b * q; answer = q
    } else {
      b = randomInt(2, 9)
      const q = randomInt(5, 19)
      a = b * q; answer = q
    }
  }

  // 不正解の選択肢: spread=1のとき answer±1〜2になるよう工夫
  const wrongAnswers = new Set<number>()
  let attempt = 0
  while (wrongAnswers.size < 3 && attempt < 30) {
    attempt++
    const offset = randomInt(1, spread) * (Math.random() < 0.5 ? 1 : -1)
    const w = answer + offset
    if (w !== answer && w > 0) wrongAnswers.add(w)
  }
  // 万が一3個揃わなかった場合の保険
  let fallback = answer + 1
  while (wrongAnswers.size < 3) {
    if (!wrongAnswers.has(fallback) && fallback !== answer) wrongAnswers.add(fallback)
    fallback++
  }
  return { type: 'calc', a, b, operator: op, answer, choices: shuffle([answer, ...wrongAnswers]) }
}

// --- ストループテスト ---
// lv1-15:  2色のみ、文字の色を答える
// lv16-30: 3色、文字の色を答える
// lv31-45: 4色、文字の色を答える
// lv46-50: 4色、50%の確率で「文字の意味」を答える（ルール切り替え）

const COLORS: ColorName[] = ['red', 'blue', 'green', 'yellow']

function generateStroopQuestion(level: number): StroopQuestion {
  const colorCount = level <= 15 ? 2 : level <= 30 ? 3 : 4
  const available = COLORS.slice(0, colorCount)
  const word = available[randomInt(0, available.length - 1)]
  let inkColor: ColorName
  do { inkColor = available[randomInt(0, available.length - 1)] } while (inkColor === word)
  const choices = shuffle(available) as ColorName[]

  // lv46+は半分の確率でルールが逆転（意味を答える）
  const askAbout: StroopQuestion['askAbout'] = (level >= 46 && Math.random() < 0.5) ? 'word' : 'ink'

  return { type: 'stroop', word, inkColor, choices, askAbout }
}

// --- パターン記憶 ---
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

// --- カテゴリ分類 ---
// lv1-10:  明確なカテゴリ
// lv11-25: やや紛らわしい
// lv26-40: 知識が必要なもの（分類が曖昧）
// lv41-50: 常識を逆手に取る問題

type CategoryEntry = { word: string; categoryA: string; categoryB: string; correct: 'A' | 'B'; minLevel: number }

const CATEGORY_DATA: CategoryEntry[] = [
  // lv1〜 明確
  { word: '犬', categoryA: '動物', categoryB: '食べ物', correct: 'A', minLevel: 1 },
  { word: '寿司', categoryA: '動物', categoryB: '食べ物', correct: 'B', minLevel: 1 },
  { word: '猫', categoryA: '動物', categoryB: '食べ物', correct: 'A', minLevel: 1 },
  { word: 'ラーメン', categoryA: '動物', categoryB: '食べ物', correct: 'B', minLevel: 1 },
  { word: 'バス', categoryA: '乗り物', categoryB: '建物', correct: 'A', minLevel: 1 },
  { word: 'ビル', categoryA: '乗り物', categoryB: '建物', correct: 'B', minLevel: 1 },
  { word: '電車', categoryA: '乗り物', categoryB: '建物', correct: 'A', minLevel: 1 },
  { word: '駅', categoryA: '乗り物', categoryB: '建物', correct: 'B', minLevel: 1 },
  { word: 'りんご', categoryA: '果物', categoryB: '野菜', correct: 'A', minLevel: 1 },
  { word: 'にんじん', categoryA: '果物', categoryB: '野菜', correct: 'B', minLevel: 1 },
  // lv11〜 ビジネス・趣味
  { word: 'Excel', categoryA: '仕事', categoryB: '趣味', correct: 'A', minLevel: 11 },
  { word: 'ゲーム', categoryA: '仕事', categoryB: '趣味', correct: 'B', minLevel: 11 },
  { word: '会議', categoryA: '仕事', categoryB: '趣味', correct: 'A', minLevel: 11 },
  { word: '読書', categoryA: '仕事', categoryB: '趣味', correct: 'B', minLevel: 11 },
  { word: '資料作成', categoryA: '仕事', categoryB: '趣味', correct: 'A', minLevel: 11 },
  { word: '釣り', categoryA: '仕事', categoryB: '趣味', correct: 'B', minLevel: 11 },
  { word: '哺乳類', categoryA: '生物の分類', categoryB: '食べ物の種類', correct: 'A', minLevel: 11 },
  { word: 'サバ', categoryA: '魚類', categoryB: '野菜', correct: 'A', minLevel: 11 },
  { word: 'キャベツ', categoryA: '魚類', categoryB: '野菜', correct: 'B', minLevel: 11 },
  // lv26〜 分類が紛らわしい
  { word: 'タコ', categoryA: '魚介類', categoryB: '肉類', correct: 'A', minLevel: 26 },
  { word: 'コウモリ', categoryA: '鳥類', categoryB: '哺乳類', correct: 'B', minLevel: 26 },
  { word: 'クジラ', categoryA: '魚類', categoryB: '哺乳類', correct: 'B', minLevel: 26 },
  { word: 'トマト', categoryA: '野菜', categoryB: '果物', correct: 'A', minLevel: 26 },
  { word: 'アボカド', categoryA: '野菜', categoryB: '果物', correct: 'B', minLevel: 26 },
  { word: 'イチゴ', categoryA: '果物', categoryB: '野菜', correct: 'A', minLevel: 26 },
  { word: 'ピーナッツ', categoryA: '木の実', categoryB: '豆類', correct: 'B', minLevel: 26 },
  { word: 'タケノコ', categoryA: '野菜', categoryB: '木材', correct: 'A', minLevel: 26 },
  // lv41〜 常識の逆手・専門知識
  { word: 'カモノハシ', categoryA: '哺乳類', categoryB: '爬虫類', correct: 'A', minLevel: 41 },
  { word: 'ウニ', categoryA: '魚介類', categoryB: '植物', correct: 'A', minLevel: 41 },
  { word: 'クモ', categoryA: '昆虫', categoryB: '節足動物', correct: 'B', minLevel: 41 },
  { word: 'サンゴ', categoryA: '植物', categoryB: '動物', correct: 'B', minLevel: 41 },
  { word: 'トリュフ', categoryA: '野菜', categoryB: 'キノコ', correct: 'B', minLevel: 41 },
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

// --- 反応タップ ---
// lv1-20:  形AND色の両方一致でタップ（条件が明確）
// lv21-35: ランダムに「形のみ」「色のみ」「両方」の3条件が混在
// lv36-50: 3条件混在＋フェイク率増加

const SHAPES = ['circle', 'square', 'triangle'] as const
const REACTION_COLORS = ['red', 'blue', 'green'] as const

function generateReactionQuestion(level: number): ReactionQuestion {
  const targetShape = SHAPES[randomInt(0, 2)]
  const targetColor = REACTION_COLORS[randomInt(0, 2)]

  // 判定条件を決定
  let conditionType: ReactionQuestion['conditionType']
  if (level <= 20) {
    conditionType = 'both'
  } else if (level <= 35) {
    conditionType = (['both', 'shape-only', 'color-only'] as const)[randomInt(0, 2)]
  } else {
    conditionType = (['both', 'shape-only', 'color-only'] as const)[randomInt(0, 2)]
  }

  // フェイク率: lv1=70%タップ → lv50=35%タップ
  const tapProbability = 0.70 - (level - 1) / 49 * 0.35
  const shouldTapTarget = Math.random() < tapProbability

  let displayShape = SHAPES[randomInt(0, 2)]
  let displayColor = REACTION_COLORS[randomInt(0, 2)]

  if (shouldTapTarget) {
    // タップすべき表示を生成（条件に合致させる）
    if (conditionType === 'both') {
      displayShape = targetShape
      displayColor = targetColor
    } else if (conditionType === 'shape-only') {
      displayShape = targetShape
      // 色は何でも良い（意図的にランダム）
    } else {
      displayColor = targetColor
      // 形は何でも良い
    }
  } else {
    // タップしてはいけない表示を生成（条件に不一致させる）
    if (conditionType === 'both') {
      // 両方外す
      do { displayShape = SHAPES[randomInt(0, 2)] } while (displayShape === targetShape)
      do { displayColor = REACTION_COLORS[randomInt(0, 2)] } while (displayColor === targetColor)
    } else if (conditionType === 'shape-only') {
      // 形を外す
      do { displayShape = SHAPES[randomInt(0, 2)] } while (displayShape === targetShape)
    } else {
      // 色を外す
      do { displayColor = REACTION_COLORS[randomInt(0, 2)] } while (displayColor === targetColor)
    }
  }

  const shouldTap =
    conditionType === 'both' ? displayShape === targetShape && displayColor === targetColor
    : conditionType === 'shape-only' ? displayShape === targetShape
    : displayColor === targetColor

  return { type: 'reaction', targetShape, targetColor, displayShape, displayColor, shouldTap, conditionType }
}

const GAME_TYPES: GameType[] = ['calc', 'stroop', 'pattern', 'category', 'reaction']

/** 10問のセッションを生成する */
export function generateSession(level: number): GameQuestion[] {
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
