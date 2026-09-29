import { getMistakes } from './mistakeService'

export function generateLearningReport(user) {
  if (!user || !user.learningLanguage) return null;

  const allMistakes = getMistakes(user.learningLanguage) || []
  const sortedMistakes = [...allMistakes].sort((a, b) => b.count - a.count).slice(0, 10)

  // Determine Categorized Mistakes
  const categorizedMistakes = {
    grammar: [],
    vocabulary: [],
    pronunciation: [],
    general: []
  }

  sortedMistakes.forEach(m => {
    if (m.type === 'grammar') categorizedMistakes.grammar.push(m)
    else if (m.type === 'vocabulary') categorizedMistakes.vocabulary.push(m)
    else if (m.type === 'pronunciation') categorizedMistakes.pronunciation.push(m)
    else categorizedMistakes.general.push(m)
  })

  // Chart Data: Last 7 Days XP
  const xpHistory = user.xpHistory || {}
  const today = new Date()
  const chartData = []
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    
    chartData.push({
      date: `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`,
      xp: xpHistory[dateStr] || 0
    })
  }

  // Smart Insights (Simulated AI)
  let insightText = "You are making steady progress! Keep practicing daily to build your vocabulary."
  if (user.streak >= 3) {
    insightText = `Incredible dedication! With a ${user.streak}-day streak, your language retention is optimal. We noticed you struggle slightly with ${categorizedMistakes.vocabulary.length > 0 ? 'some vocabulary terms' : 'grammar'}. Focus your next session on the Practice Lab.`
  } else if (sortedMistakes.length > 5) {
    insightText = "You are tackling challenging new concepts. It's totally normal to make mistakes. Spend a few minutes reviewing your Mistake Bank to solidify your understanding."
  } else if ((user.xp || 0) < 100) {
    insightText = "Welcome to your language journey! The secret to fluency is consistency. Try completing just one short lesson every day."
  }

  // Standard Recommendations
  const recs = []
  
  if (sortedMistakes.length > 3) {
    recs.push({
      type: 'vocabulary',
      title: 'Targeted Practice Needed',
      desc: `You have ${sortedMistakes.length} recurring mistakes. Spend 5-10 minutes in the "Mistakes" tab of the Practice Lab.`,
      color: 'text-amber-500',
      bg: 'bg-amber-100 dark:bg-amber-900/30'
    })
  }

  if ((user.streak || 0) < 2) {
    recs.push({
      type: 'consistency',
      title: 'Build Your Daily Habit',
      desc: 'You haven\'t built a streak yet. Completing just one lesson daily increases retention by 40%.',
      color: 'text-indigo-500',
      bg: 'bg-indigo-100 dark:bg-indigo-900/30'
    })
  } else if ((user.streak || 0) >= 3) {
    recs.push({
      type: 'challenge',
      title: 'Ready for Legendary',
      desc: `Your ${user.streak}-day streak proves you are ready! Try a Legendary challenge for extra XP.`,
      color: 'text-rose-500',
      bg: 'bg-rose-100 dark:bg-rose-900/30'
    })
  }

  const completedCount = Array.isArray(user.completedLessons) ? user.completedLessons.length : 0
  if (completedCount < 5) {
    recs.push({
      type: 'progression',
      title: 'Unlock Next Unit',
      desc: `You are ${5 - completedCount} lessons away from unlocking intermediate concepts.`,
      color: 'text-emerald-500',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30'
    })
  }

  return {
    sortedMistakes,
    categorizedMistakes,
    chartData,
    insightText,
    recs
  }
}
