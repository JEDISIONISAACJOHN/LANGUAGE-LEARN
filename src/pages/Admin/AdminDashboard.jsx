import { useState, useEffect } from 'react'
import { Users, Activity, BookOpen, Target, Settings, Database, TrendingUp, Award, Box, ShieldCheck, ChevronRight, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import { supabase } from '../../services/supabase'
import LearnerManagement from './components/LearnerManagement'
import DatabaseInspector from './components/DatabaseInspector'
import LearningAnalytics from './components/LearningAnalytics'
import ContentManagement from './components/ContentManagement'
import AIRecommendations from './components/AIRecommendations'
import AchievementsManager from './components/AchievementsManager'

export default function AdminDashboard() {
  const { user, getAllUsers, logout } = useAuth()
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState('learners')
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [stats, setStats] = useState({
    totalLearners: 0,
    activeLearners: 0,
    lessonsCompleted: 0,
    avgProficiency: 0
  })

  // Basic role check
  useEffect(() => {
    if (user?.role !== 'admin' && user?.email !== 'bnsns9646@gmail.com') {
      navigate('/')
    }
  }, [user, navigate])

  useEffect(() => {
    async function loadStats() {
      const allUsers = await getAllUsers()
      if (allUsers) {
        const total = allUsers.length
        const active = allUsers.filter(u => u.xp > 0 || (u.completedLessons && u.completedLessons.length > 0)).length
        const completed = allUsers.reduce((acc, u) => acc + (u.completedLessons?.length || 0), 0)
        
        let totalProficiency = 0
        let scoredUsers = 0
        allUsers.forEach(u => {
          if (u.assessmentScore) {
            totalProficiency += u.assessmentScore
            scoredUsers++
          }
        })
        const avg = scoredUsers > 0 ? (totalProficiency / scoredUsers).toFixed(1) : 0
        
        setStats({
          totalLearners: total,
          activeLearners: active,
          lessonsCompleted: completed,
          avgProficiency: avg
        })
      }
    }
    loadStats()
  }, [getAllUsers, refreshTrigger])

  // Setup Supabase Realtime Subscription for Automatic Updates
  useEffect(() => {
    if (!supabase) return
    
    const channel = supabase
      .channel('admin-profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        // Trigger a refresh whenever ANY profile changes
        setRefreshTrigger(prev => prev + 1)
      })
      .subscribe()
      
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const tabs = [
    { id: 'learners', label: 'Learner Management', icon: Users },
    { id: 'analytics', label: 'Learning Analytics', icon: TrendingUp },
    { id: 'content', label: 'Content Management', icon: Box },
    { id: 'ai', label: 'AI & Recommendations', icon: Target },
    { id: 'achievements', label: 'Achievements Manager', icon: Award },
    { id: 'database', label: 'Database Inspector', icon: Database },
  ]

  const renderTabContent = () => {
    const handleDataChange = () => setRefreshTrigger(prev => prev + 1)
    
    switch (activeTab) {
      case 'learners':
        return <LearnerManagement onDataChange={handleDataChange} refreshTrigger={refreshTrigger} />
      case 'analytics':
        return <LearningAnalytics />
      case 'content':
        return <ContentManagement onDataChange={handleDataChange} />
      case 'ai':
        return <AIRecommendations />
      case 'achievements':
        return <AchievementsManager onDataChange={handleDataChange} />
      case 'database':
        return <DatabaseInspector />
      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Settings className="w-16 h-16 text-slate-600 mb-4 animate-spin-slow" />
            <h3 className="text-xl font-bold text-white mb-2">Module Under Construction</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              The <strong>{tabs.find(t => t.id === activeTab)?.label}</strong> module is currently being integrated with the backend systems.
            </p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-[#0f111a] text-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Administrator System Control Portal</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">NeoLearner Admin Operations</h1>
            <p className="text-slate-400 mt-1">Manage learners, monitor AI proficiency engines, configure courses, and inspect system analytics.</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/')} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-700">
              Learner View
            </button>
            <button 
              onClick={async () => {
                await logout()
                navigate('/login')
              }} 
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-medium transition-colors border border-red-500/20 flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
            <div className="flex items-center space-x-3 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                A
              </div>
              <div className="text-sm">
                <p className="text-white font-semibold leading-none">Admin</p>
                <p className="text-indigo-400 text-xs mt-1">System Administrator</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Total Learners</h3>
            <div className="text-4xl font-extrabold text-white">{stats.totalLearners}</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Active (7 Days)</h3>
            <div className="text-4xl font-extrabold text-blue-400">{stats.activeLearners}</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Lessons Completed</h3>
            <div className="text-4xl font-extrabold text-amber-400">{stats.lessonsCompleted}</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent"></div>
            <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 relative z-10">Avg Proficiency</h3>
            <div className="text-4xl font-extrabold text-emerald-400 relative z-10">{stats.avgProficiency}%</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-2 mb-6 flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Dynamic Content Area */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  )
}
