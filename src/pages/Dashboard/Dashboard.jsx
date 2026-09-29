import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import { useProgress } from '../../services/progress'
import { useTheme } from '../../services/themeContext'
import { getLessonsForLanguage } from '../../data/lessons'
import { fetchDynamicLessons } from '../../services/dynamicLessonService'
import { getLanguageById } from '../../data/languages'
import { predictProficiency } from '../../services/proficiencyPredictor'
import AlphabetModal from '../../components/AlphabetModal/AlphabetModal'
import { useAppSound } from '../../services/sound'
import { BookA, CheckCircle2, Sparkles, Target, BookOpen, Bot, Play, LayoutGrid, Lock, LogOut } from 'lucide-react'

// Animation Variants for Bento Grid
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { addXP } = useProgress()
  const { t } = useTheme()
  const { playClick, playSuccess } = useAppSound()
  const [lessons, setLessons] = useState([])
  const [currentLesson, setCurrentLesson] = useState(null)
  const [showAlphabetModal, setShowAlphabetModal] = useState(false)

  useEffect(() => {
    if (!user?.learningLanguage || !user?.goal) {
      navigate('/onboarding')
      return
    }

    async function loadLessons() {
      const preferredLang = user.preferredLanguage || 'en'
      let languageLessons = []
      try {
        languageLessons = await fetchDynamicLessons({
          languageId: user.learningLanguage,
          goal: user.goal,
          ageRange: user.ageRange || 'adult',
          level: user.level || 'beginner',
          learningStyle: user.learningStyle,
          interests: user.interests,
          count: 15,
        })
      } catch {
        languageLessons = getLessonsForLanguage(user.learningLanguage, preferredLang)
      }

      if (!languageLessons || languageLessons.length === 0) {
        languageLessons = getLessonsForLanguage(user.learningLanguage, preferredLang)
      }

      setLessons(languageLessons)

      const completedIds = Array.isArray(user.completedLessons) ? user.completedLessons : []
      const nextIncomplete = languageLessons.find((lesson) => !completedIds.includes(lesson.id))
      setCurrentLesson(nextIncomplete || languageLessons[languageLessons.length - 1])
    }

    loadLessons()
  }, [user, navigate])

  const handleLessonClick = (lessonId) => {
    playClick()
    navigate(`/lesson/${lessonId}`)
  }

  const learningLang = getLanguageById(user?.learningLanguage)

  if (!user || !learningLang) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  const completedCount = (user.completedLessons || []).length
  const totalLessons = Math.max(1, lessons.length)
  const progressPercent = Math.min(Math.round((completedCount / totalLessons) * 100), 100)
  const prediction = predictProficiency(user)

  return (
    <div className="w-full h-full space-y-8 font-sans pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight"
          >
            {t('good_morning')}, <br className="md:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-400">{user.name?.split(' ')[0] || 'Learner'}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-slate-500 dark:text-slate-400 mt-2 text-base"
          >
            {t('ready_to_master')} {learningLang.name} {t('today')}
          </motion.p>
        </div>
        
        {/* Right side: Badge and Logout */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Proficiency Level Badge */}
          {user.level && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex items-center gap-3 shadow-sm"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Sparkles size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-indigo-500 dark:text-indigo-400">Current Level</p>
                <p className="text-sm font-bold text-slate-800 dark:text-white capitalize">{user.level}</p>
              </div>
            </motion.div>
          )}

          {/* Logout Button */}
          <button
            onClick={async () => {
              await logout()
              navigate('/login')
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-500/30 rounded-xl shadow-sm transition-all font-bold text-sm"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* BENTO GRID LAYOUT */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-12 gap-6"
      >
        
        {/* Main Hero Action Block - Spans 8 cols */}
        <motion.div variants={itemVariants} className="md:col-span-8 h-full">
          <div 
            className="bento-card h-full min-h-[280px] p-8 md:p-10 bg-gradient-to-br from-indigo-600 to-cyan-500 text-white relative overflow-hidden group cursor-pointer shadow-lg transition-transform hover:scale-[1.01]"
            onClick={() => currentLesson && handleLessonClick(currentLesson.id)}
          >
            {/* Decorative Orbs */}
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000 ease-out"></div>
            <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 bg-cyan-300 opacity-20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700 ease-out"></div>
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md mb-6 border border-white/10">
                  <Sparkles size={14} /> {t('next_up')}
                </div>
                <h2 className="text-2xl md:text-3xl font-black mb-3 leading-tight drop-shadow-sm">
                  {currentLesson?.title || t('daily_practice')}
                </h2>
                <p className="text-white/80 text-base max-w-md font-medium">
                  {currentLesson?.description || t('continue_learning')}
                </p>
              </div>
              
              <div className="mt-10 flex items-center justify-between">
                <button className="btn-gamified bg-white text-indigo-900 border-none group-hover:translate-x-2">
                  <Play size={20} fill="currentColor" /> {t('start')}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Block - Spans 4 cols */}
        <motion.div variants={itemVariants} className="md:col-span-4">
          <div className="bento-card h-full flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-indigo-500 mb-6">
                <Target size={24} />
              </div>
              <h3 className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                {t('course_progress')}
              </h3>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-black text-slate-800 dark:text-white">{progressPercent}%</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{completedCount} {t('of')} {totalLessons} {t('lessons_completed')}</p>
            </div>
            
            <div className="mt-8">
              <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Small Feature Blocks */}
        <motion.div variants={itemVariants} className="md:col-span-4">
          <div 
            onClick={() => { playClick(); navigate('/stories'); }}
            className="bento-card cursor-pointer group hover:scale-[1.02] transition-all"
          >
            <div className="w-10 h-10 rounded-[1rem] bg-orange-100 border border-orange-200 text-orange-500 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform">
              <BookOpen size={20} />
            </div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1">{t('stories')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('read_listen')}</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="md:col-span-4">
          <div 
            onClick={() => { playClick(); navigate('/tutor'); }}
            className="bento-card cursor-pointer group hover:scale-[1.02] transition-all"
          >
            <div className="w-10 h-10 rounded-[1rem] bg-indigo-100 border border-indigo-200 text-indigo-500 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
              <Bot size={20} />
            </div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1">{t('tutor')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('practice_conv')}</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="md:col-span-4">
          <div 
            onClick={() => { playClick(); setShowAlphabetModal(true); }}
            className="bento-card cursor-pointer group hover:scale-[1.02] transition-all"
          >
            <div className="w-10 h-10 rounded-[1rem] bg-emerald-100 border border-emerald-200 text-emerald-500 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform">
              <BookA size={20} />
            </div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1">{t('alphabet')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('learn_script')}</p>
          </div>
        </motion.div>

        {/* Proficiency Prediction Block - Spans 12 cols */}
        <motion.div variants={itemVariants} className="md:col-span-12">
          <div className="bento-card bg-gradient-to-r from-purple-500 to-pink-500 text-white flex flex-col md:flex-row items-center justify-between p-6 hover:scale-[1.01] transition-transform">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Sparkles size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-1">{t('fluency_forecast')}</h3>
                <p className="text-white/80 text-sm">
                  {t('fluency_desc')}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-8 mt-4 md:mt-0 bg-black/10 rounded-2xl p-4">
              <div className="text-center md:text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-white/70 mb-1">{t('projected_fluency')}</p>
                <p className="text-3xl font-black">{prediction.projectedFluency}%</p>
              </div>
              <div className="w-px h-10 bg-white/20 hidden md:block"></div>
              <div className="text-center md:text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-white/70 mb-1">{t('next_milestone')}</p>
                <p className="text-xl font-bold">{prediction.nextLevelName}</p>
                <p className="text-sm font-medium text-white/80">{t('in_days')}{prediction.daysToNextLevel}{t('days')}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* All Lessons List */}
        <motion.div variants={itemVariants} className="md:col-span-12 mt-8">
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
              <LayoutGrid size={24} className="text-indigo-500" /> {t('syllabus')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {lessons.slice(0, 9).map((lesson, idx) => {
              const isCompleted = (user.completedLessons || []).includes(lesson.id)
              const isLocked = !isCompleted && currentLesson?.id !== lesson.id
              
              return (
                <div 
                  key={lesson.id}
                  onClick={() => !isLocked && handleLessonClick(lesson.id)}
                  className={`p-5 rounded-[1.5rem] border ${
                    isCompleted ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800' : 
                    isLocked ? 'bg-slate-50 dark:bg-slate-900 opacity-50 border-slate-200 dark:border-slate-800' : 
                    'glass-panel cursor-pointer hover:border-indigo-400 hover:shadow-lg'
                  } flex items-center gap-4 transition-all`}
                >
                  <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center shrink-0 ${
                    isCompleted ? 'bg-primary/20 text-primary' :
                    isLocked ? 'bg-surface-hover text-text-muted border border-border-subtle' :
                    'bg-primary text-white shadow-lg shadow-primary/30'
                  }`}>
                    {isCompleted ? <CheckCircle2 size={20} /> : isLocked ? <Lock size={20} /> : <span className="font-black text-lg">{idx + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-base truncate ${isLocked ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-white'}`}>
                      {lesson.title}
                    </p>
                    <p className={`text-sm font-medium truncate mt-0.5 ${isLocked ? 'text-slate-400 dark:text-slate-500' : 'text-slate-500 dark:text-slate-400'}`}>
                      {lesson.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

      </motion.div>

      <AlphabetModal
        languageId={user.learningLanguage}
        languageName={learningLang.name}
        isOpen={showAlphabetModal}
        onClose={() => { playClick(); setShowAlphabetModal(false); }}
      />
    </div>
  )
}
