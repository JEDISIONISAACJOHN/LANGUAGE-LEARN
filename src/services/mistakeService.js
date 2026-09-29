// Spaced Repetition and Mistake Bank Storage

const MISTAKES_KEY = 'bharatlingo_mistakes'
const MASTERY_KEY = 'bharatlingo_mastery'

export function getMistakes(languageId) {
  try {
    const raw = localStorage.getItem(MISTAKES_KEY)
    const all = raw ? JSON.parse(raw) : {}
    return all[languageId] || []
  } catch (e) {
    return []
  }
}

export function recordMistake(wordObj, languageId, explicitCategory = null) {
  if (!wordObj || !languageId) return
  try {
    const raw = localStorage.getItem(MISTAKES_KEY)
    const all = raw ? JSON.parse(raw) : {}
    const list = all[languageId] || []

    const wordStr = typeof wordObj === 'string' ? wordObj : wordObj.word || wordObj.targetWord || wordObj.prompt
    if (!wordStr) return

    // Map exercise types to categories for the report
    let category = explicitCategory || 'general'
    if (!explicitCategory && typeof wordObj === 'object' && wordObj.type) {
      if (wordObj.type === 'speaking' || wordObj.type === 'listening') category = 'pronunciation'
      else if (wordObj.type === 'sentence-order' || wordObj.type === 'fill-blank') category = 'grammar'
      else if (wordObj.type === 'translation' || wordObj.type === 'matching' || wordObj.type === 'multiple-choice') category = 'vocabulary'
    }

    const existingIdx = list.findIndex((m) => m.word === wordStr)
    if (existingIdx !== -1) {
      list[existingIdx].count = (list[existingIdx].count || 1) + 1
      list[existingIdx].lastMistakeAt = new Date().toISOString()
      list[existingIdx].type = category
    } else {
      list.push({
        word: wordStr,
        translation: typeof wordObj === 'object' ? (wordObj.translation || wordObj.meaning || '') : '',
        pronunciation: typeof wordObj === 'object' ? (wordObj.pronunciation || '') : '',
        type: category,
        count: 1,
        lastMistakeAt: new Date().toISOString(),
      })
    }

    all[languageId] = list
    localStorage.setItem(MISTAKES_KEY, JSON.stringify(all))
  } catch (e) {
    console.warn('Error recording mistake:', e)
  }
}

export function resolveMistake(wordStr, languageId) {
  try {
    const raw = localStorage.getItem(MISTAKES_KEY)
    const all = raw ? JSON.parse(raw) : {}
    const list = all[languageId] || []

    all[languageId] = list.filter((m) => m.word !== wordStr)
    localStorage.setItem(MISTAKES_KEY, JSON.stringify(all))
  } catch (e) {
    console.warn('Error resolving mistake:', e)
  }
}

export function getMasteryMap(languageId) {
  try {
    const raw = localStorage.getItem(MASTERY_KEY)
    const all = raw ? JSON.parse(raw) : {}
    return all[languageId] || {}
  } catch (e) {
    return {}
  }
}

export function updateWordMastery(wordStr, languageId, isCorrect) {
  try {
    const raw = localStorage.getItem(MASTERY_KEY)
    const all = raw ? JSON.parse(raw) : {}
    const map = all[languageId] || {}

    const currentLevel = map[wordStr] || 0
    const newLevel = isCorrect ? Math.min(3, currentLevel + 1) : Math.max(0, currentLevel - 1)

    map[wordStr] = newLevel
    all[languageId] = map
    localStorage.setItem(MASTERY_KEY, JSON.stringify(all))
    return newLevel
  } catch (e) {
    return 0
  }
}
