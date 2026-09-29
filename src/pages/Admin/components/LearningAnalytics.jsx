import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, TrendingUp, Users, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useAuth } from '../../../services/auth'

export default function LearningAnalytics() {
  const { getAllUsers } = useAuth()
  const [data, setData] = useState(null)
  
  useEffect(() => {
    async function loadData() {
      const allUsers = await getAllUsers()
      if (allUsers) {
        // Mock analytics data based on local storage users
        const activeToday = Math.max(1, Math.floor(allUsers.length * 0.4))
        const activeWeek = Math.max(1, Math.floor(allUsers.length * 0.8))
        
        let totalSessions = 0
        let totalScore = 0
        let scoreCount = 0
        
        allUsers.forEach(u => {
          totalSessions += (u.completedLessons?.length || 0)
          if (u.assessmentScore) {
            totalScore += u.assessmentScore
            scoreCount++
          }
        })
        
        setData({
          users: allUsers,
          activeToday,
          activeWeek,
          totalSessions,
          avgScore: scoreCount > 0 ? (totalScore / scoreCount).toFixed(1) : 0,
          growthRate: '+12.5%',
          retentionRate: '85%'
        })
      }
    }
    loadData()
  }, [getAllUsers])

  if (!data) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  // Generate chart data for Language Popularity dynamically based on user selection
  const langCounts = {
    hi: { lang: 'Hindi', users: 0, color: 'bg-orange-500' },
    ta: { lang: 'Tamil', users: 0, color: 'bg-emerald-500' },
    bn: { lang: 'Bengali', users: 0, color: 'bg-blue-500' },
    te: { lang: 'Telugu', users: 0, color: 'bg-purple-500' },
    mr: { lang: 'Marathi', users: 0, color: 'bg-indigo-500' },
    kn: { lang: 'Kannada', users: 0, color: 'bg-pink-500' },
  }
  
  if (data.users && data.users.length > 0) {
    data.users.forEach(u => {
      if (u.learningLanguage && langCounts[u.learningLanguage]) {
        langCounts[u.learningLanguage].users++
      } else if (u.learningLanguage) {
        langCounts[u.learningLanguage] = { lang: u.learningLanguage.toUpperCase(), users: 1, color: 'bg-gray-500' }
      }
    })
  }

  let languageData = Object.values(langCounts).filter(l => l.users > 0).sort((a, b) => b.users - a.users)
  
  if (languageData.length === 0) {
    languageData = [{ lang: 'No Active Tracks', users: 1, color: 'bg-slate-700' }]
  }

  const totalLangUsers = languageData.reduce((acc, curr) => acc + curr.users, 0) || 1

  // Generate mock chart data for Weekly Activity since we don't have historical lesson timestamps yet
  // but we can scale it based on total completed lessons across the platform
  const totalLessons = data.totalSessions || 1
  const weeklyData = [
    { day: 'Mon', value: Math.floor(totalLessons * 0.1) },
    { day: 'Tue', value: Math.floor(totalLessons * 0.15) },
    { day: 'Wed', value: Math.floor(totalLessons * 0.1) },
    { day: 'Thu', value: Math.floor(totalLessons * 0.25) },
    { day: 'Fri', value: Math.floor(totalLessons * 0.2) },
    { day: 'Sat', value: Math.floor(totalLessons * 0.15) },
    { day: 'Sun', value: Math.floor(totalLessons * 0.05) },
  ]
  const maxWeeklyValue = Math.max(...weeklyData.map(d => d.value), 1)

  return (
    <div className="space-y-6">
      
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Active Today" 
          value={data.activeToday.toString()} 
          icon={Users} 
          trend={data.growthRate}
          isPositive={true}
        />
        <MetricCard 
          title="Active This Week" 
          value={data.activeWeek.toString()} 
          icon={TrendingUp} 
          trend="+5.2%"
          isPositive={true}
        />
        <MetricCard 
          title="Avg Assessment Score" 
          value={`${data.avgScore}%`} 
          icon={BarChart2} 
          trend="-2.1%"
          isPositive={false}
        />
        <MetricCard 
          title="Avg Session Length" 
          value="14m" 
          icon={Clock} 
          trend="+1.5m"
          isPositive={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Activity Chart */}
        <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Weekly Learning Activity</h3>
              <p className="text-sm text-slate-400">Total completed lessons per day</p>
            </div>
            <select className="bg-slate-900 border border-slate-700 text-sm text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500">
              <option>This Week</option>
              <option>Last Week</option>
            </select>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-2 px-2">
            {weeklyData.map((item, index) => {
              const heightPercent = (item.value / maxWeeklyValue) * 100
              return (
                <div key={item.day} className="flex flex-col items-center w-full gap-2 group">
                  <div className="w-full relative h-full flex items-end justify-center">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1, type: 'spring', bounce: 0.2 }}
                      className="w-full max-w-[40px] bg-gradient-to-t from-emerald-500/80 to-emerald-400 rounded-t-lg relative"
                    >
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded font-medium transition-opacity whitespace-nowrap z-10">
                        {item.value} lessons
                      </div>
                    </motion.div>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{item.day}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Language Distribution */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-1">Popular Languages</h3>
          <p className="text-sm text-slate-400 mb-6">Active learners per track</p>
          
          <div className="space-y-5">
            {languageData.map((lang, index) => {
              const percent = (lang.users / totalLangUsers) * 100
              return (
                <div key={lang.lang}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-semibold text-slate-200">{lang.lang}</span>
                    <span className="text-slate-400">{percent.toFixed(0)}% ({lang.users})</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 1, delay: 0.2 + (index * 0.1) }}
                      className={`h-full rounded-full ${lang.color}`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="mt-8 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg shrink-0">
                <TrendingUp size={18} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">Insights</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Bengali track enrollment grew by 15% this week. Consider prioritizing Bengali Phase 2 content release.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function MetricCard({ title, value, icon: Icon, trend, isPositive }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 relative overflow-hidden group">
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-slate-700/20 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors"></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="p-2.5 bg-slate-900/80 text-indigo-400 rounded-xl border border-slate-700/50">
          <Icon size={20} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
      
      <div className="relative z-10">
        <h4 className="text-slate-400 text-sm font-medium mb-1">{title}</h4>
        <div className="text-3xl font-black text-white">{value}</div>
      </div>
    </div>
  )
}
