import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Gamepad2, Zap, Trophy, Play, Star, Sparkles } from 'lucide-react'
import { useAuth } from '../../services/auth'
import { getLanguageById } from '../../data/languages'
import { useTheme } from '../../services/themeContext'

export default function GamesHub() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useTheme()
  const learningLang = getLanguageById(user?.learningLanguage) || { name: 'Language' }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  const games = [
    {
      id: 'speed-match',
      title: 'Speed Match',
      description: 'Match pairs as fast as possible before the timer runs out!',
      icon: Zap,
      color: 'from-amber-400 to-orange-500',
      shadow: 'shadow-orange-500/20',
      badge: 'HOT'
    },
    {
      id: 'token-tower',
      title: 'Token Tower',
      description: 'Build a tower by correctly stacking vocabulary tokens.',
      icon: Gamepad2,
      color: 'from-emerald-400 to-teal-500',
      shadow: 'shadow-teal-500/20',
      badge: 'NEW'
    }
  ]

  return (
    <div className="w-full h-full space-y-8 font-sans pb-12 pt-6">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
          <Gamepad2 size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white">
            Games Hub
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Learn {learningLang.name} fast with interactive minigames.
          </p>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {games.map((game) => (
          <motion.div key={game.id} variants={itemVariants}>
            <div 
              onClick={() => !game.disabled && navigate(`/games/${game.id}`)}
              className={`relative overflow-hidden rounded-3xl p-6 h-full flex flex-col justify-between transition-all duration-300 ${
                game.disabled 
                  ? 'bg-slate-100 dark:bg-slate-800/50 grayscale opacity-70 cursor-not-allowed border border-slate-200 dark:border-slate-700' 
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:-translate-y-2 hover:shadow-xl ' + game.shadow
              }`}
            >
              {/* Background Glow */}
              {!game.disabled && (
                <div className={`absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-gradient-to-br ${game.color} rounded-full opacity-10 blur-3xl`} />
              )}
              
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br ${game.color} shadow-lg ${game.shadow}`}>
                    <game.icon size={26} />
                  </div>
                  {game.badge && (
                    <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {game.badge}
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">
                  {game.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  {game.description}
                </p>
              </div>

              <div className="mt-8">
                <button 
                  className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
                    game.disabled 
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500' 
                      : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
                  }`}
                  disabled={game.disabled}
                >
                  <Play size={18} fill="currentColor" />
                  {game.disabled ? 'Coming Soon' : 'Play Now'}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
