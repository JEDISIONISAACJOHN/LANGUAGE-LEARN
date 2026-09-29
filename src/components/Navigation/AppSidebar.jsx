import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, BookA, Target, Trophy, User, Settings, BookOpen, Bot, Layers, FileText, LogOut, Gamepad2 } from 'lucide-react'
import LangLearnLogo from '../Logo/LangLearnLogo'
import AlphabetModal from '../AlphabetModal/AlphabetModal'
import { useAuth } from '../../services/auth'
import { getLanguageById } from '../../data/languages'
import { useTheme } from '../../services/themeContext'

export default function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { t } = useTheme()
  const [showAlphabetModal, setShowAlphabetModal] = useState(false)

  const learningLang = getLanguageById(user?.learningLanguage) || { name: 'Hindi' }

  const navItems = [
    { to: '/dashboard', label: t('dashboard') || 'USER DASHBOARD', icon: Home },
    { to: '/stories', label: t('stories') || 'STORIES', icon: BookOpen },
    { to: '/tutor', label: t('tutor') || 'AI TUTOR', icon: Bot },
    { to: '/letters', label: t('letters') || 'SCRIPT / LETTERS', icon: BookA },
    { to: '/practice', label: t('practice') || 'PRACTICE', icon: Target },
    { to: '/games', label: t('games') || 'GAMES', icon: Gamepad2 },
    { to: '/leaderboard', label: t('leaderboard') || 'LEADERBOARDS', icon: Trophy },
    { to: '/curriculum', label: t('curriculum') || 'CURRICULUM', icon: Layers },
    { to: '/report', label: t('report') || 'REPORT', icon: FileText },
    ...(user?.role === 'admin' ? [{ to: '/admin', label: t('admin') || 'ADMIN DASHBOARD', icon: Settings }] : []),
    { to: '/profile', label: t('profile') || 'PROFILE', icon: User },
    { to: '/settings', label: t('settings') || 'SETTINGS', icon: Settings },
  ]

  return (
    <>
      {/* ======================================================== */}
      {/* 1. DESKTOP FIXED TOP NAVBAR                              */}
      {/* ======================================================== */}
      <header className="hidden md:flex flex-row items-center justify-between w-full h-20 fixed top-0 left-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 px-6 z-50 shadow-sm">
        
        {/* Logo */}
        <div className="flex-shrink-0 flex items-center pr-6 border-r border-slate-200 dark:border-slate-800">
          <NavLink to="/dashboard" className="block hover:scale-105 transition-transform">
            <LangLearnLogo size="small" />
          </NavLink>
        </div>

        {/* Horizontal Navigation Links */}
        <nav className="flex-1 overflow-x-auto scrollbar-hide px-4 flex items-center space-x-2">
          {navItems.filter(i => i.to !== '/profile' && i.to !== '/settings').map((item, idx) => {
            const Icon = item.icon
            if (item.action === 'alphabet') {
              return (
                <button
                  key={idx}
                  onClick={() => setShowAlphabetModal(true)}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full font-extrabold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-brand-primary dark:hover:text-white transition-all group border-2 border-transparent hover:bg-white/50 dark:hover:bg-slate-800/50 whitespace-nowrap"
                >
                  <Icon size={18} className="text-slate-500 group-hover:text-brand-primary transition-colors flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              )
            }

            const isActive = location.pathname === item.to
            return (
              <NavLink
                key={idx}
                to={item.to}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full font-extrabold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-white border-2 border-transparent'
                }`}
              >
                <Icon size={18} className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-500'}`} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Right Side: Profile & Settings */}
        <div className="flex-shrink-0 flex items-center pl-6 space-x-3 border-l border-slate-200 dark:border-slate-800">
          <NavLink to="/profile" className="p-2.5 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Profile">
            <User size={20} />
          </NavLink>
          <NavLink to="/settings" className="p-2.5 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Settings">
            <Settings size={20} />
          </NavLink>
          <button 
            onClick={async () => {
              await logout()
              navigate('/login')
            }}
            className="p-2.5 rounded-full text-slate-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors" title="Logout"
          >
            <LogOut size={20} />
          </button>

          {/* Redundant user pill removed to save space */}
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. MOBILE FIXED BOTTOM NAVIGATION BAR (Height 64px)       */}
      {/* ======================================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t-2 border-slate-100 dark:border-slate-800 flex items-center overflow-x-auto scrollbar-hide px-2 z-40 shadow-lg space-x-4">
        {navItems.map((item, idx) => {
          const Icon = item.icon
          if (item.action === 'alphabet') {
            return (
              <button
                key={idx}
                onClick={() => setShowAlphabetModal(true)}
                className="flex-shrink-0 flex flex-col items-center justify-center p-1 text-slate-500 dark:text-slate-400 min-w-[60px]"
              >
                <Icon size={22} />
                <span className="text-[10px] font-bold mt-0.5">Letters</span>
              </button>
            )
          }

          const isActive = location.pathname === item.to
          return (
            <NavLink
              key={idx}
              to={item.to}
              className={`flex-shrink-0 flex flex-col items-center justify-center p-1 transition-colors min-w-[60px] ${
                isActive ? 'text-indigo-600 dark:text-indigo-400 font-black' : 'text-slate-500 dark:text-slate-400 font-semibold'
              }`}
            >
              <Icon size={22} />
              <span className="text-[10px] mt-0.5">{item.label.split(' ')[0]}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Alphabet / Script Explorer Modal */}
      <AlphabetModal
        languageId={user?.learningLanguage || 'hi'}
        languageName={learningLang.name}
        isOpen={showAlphabetModal}
        onClose={() => setShowAlphabetModal(false)}
      />
    </>
  )
}
