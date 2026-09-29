import { getSM2Stats } from './spacedRepetition'

/**
 * Predicts the learner's overall proficiency and estimates time to next level.
 * 
 * @param {Object} user - The user object containing xp, streak, and language progress.
 * @returns {Object} - { projectedFluency: number, daysToNextLevel: number, nextLevelName: string }
 */
export function predictProficiency(user) {
  if (!user || !user.learningLanguage) {
    return { projectedFluency: 0, daysToNextLevel: 0, nextLevelName: 'Beginner' }
  }

  const learningLang = user.learningLanguage
  const langProgress = user.languageProgress?.[learningLang] || {}
  
  const currentXP = langProgress.xp || 0
  const completedLessons = Array.isArray(langProgress.completedLessons) 
    ? langProgress.completedLessons.length 
    : 0

  // 1. Get Memory Retention Score from Spaced Repetition (SM-2)
  const sm2Stats = getSM2Stats(learningLang)
  // If no items tracked yet, assume a baseline retention of 50
  const retentionScore = sm2Stats.totalTracked > 0 ? sm2Stats.averageRetention : 50

  // 2. Calculate Proficiency Factors
  // Assume 5000 XP is 100% fluent in this heuristic model
  const xpFactor = Math.min((currentXP / 5000) * 100, 100)
  // Assume 100 lessons completed is 100% fluent
  const lessonFactor = Math.min((completedLessons / 100) * 100, 100)

  // Weighted Fluency Score:
  // 40% Memory Retention, 30% XP Volume, 30% Course Completion
  let projectedFluency = (retentionScore * 0.4) + (xpFactor * 0.3) + (lessonFactor * 0.3)
  
  // Apply a tiny streak bonus (up to 5% extra fluency for 30 day streak)
  const streakBonus = Math.min((user.streak || 0) / 30 * 5, 5)
  projectedFluency = Math.min(Math.round(projectedFluency + streakBonus), 100)

  // 3. Estimate Time to Next Level
  const LEVELS = [
    { name: 'Beginner', threshold: 0 },
    { name: 'Intermediate', threshold: 2000 },
    { name: 'Advanced', threshold: 5000 },
    { name: 'Fluent', threshold: 10000 },
  ]

  let nextLevel = LEVELS[LEVELS.length - 1]
  for (let i = 0; i < LEVELS.length; i++) {
    if (currentXP < LEVELS[i].threshold) {
      nextLevel = LEVELS[i]
      break
    }
  }

  // Calculate Velocity (XP per day)
  // Use streak as a proxy for consecutive active days. If streak is 0, assume minimum velocity.
  const activeDays = Math.max(1, user.streak || 1)
  // We use recent velocity based on total XP over streak. 
  // If XP is high but streak is low (maybe they grinded), cap it to avoid unrealistic predictions.
  let dailyVelocity = Math.max(20, currentXP / activeDays) 
  if (dailyVelocity > 500) dailyVelocity = 500 // Cap max velocity

  let daysToNextLevel = 0
  if (currentXP < nextLevel.threshold) {
    const xpRemaining = nextLevel.threshold - currentXP
    daysToNextLevel = Math.ceil(xpRemaining / dailyVelocity)
  }

  return {
    projectedFluency,
    daysToNextLevel,
    nextLevelName: nextLevel.name,
    currentXP,
    xpRemaining: nextLevel.threshold - currentXP > 0 ? nextLevel.threshold - currentXP : 0,
    dailyVelocity: Math.round(dailyVelocity)
  }
}
