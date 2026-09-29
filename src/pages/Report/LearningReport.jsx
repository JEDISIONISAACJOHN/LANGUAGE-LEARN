import React, { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Printer, TrendingUp, AlertTriangle, Target, Clock, Zap, BookOpen, Star, BrainCircuit } from 'lucide-react'
import { useAuth } from '../../services/auth'
import { useTheme } from '../../services/themeContext'
import { getLanguageById } from '../../data/languages'
import { generateLearningReport } from '../../services/recommendationEngine'

import RightSidebar from '../../components/RightSidebar/RightSidebar'

export default function LearningReport() {
  const { user } = useAuth()
  const { t } = useTheme()
  const printRef = useRef(null)

  const [reportData, setReportData] = useState(null)

  const learningLang = getLanguageById(user?.learningLanguage) || { name: 'Language' }

  useEffect(() => {
    if (user) {
      const data = generateLearningReport(user)
      setReportData(data)
    }
  }, [user])

  const handlePrint = () => {
    window.print()
  }

  const completedCount = Array.isArray(user?.completedLessons) ? user.completedLessons.length : 0
  const estimatedMins = completedCount * 5
  const estimatedHours = Math.floor(estimatedMins / 60)
  const remainingMins = estimatedMins % 60
  const timeString = estimatedHours > 0 ? `${estimatedHours}h ${remainingMins}m` : `${remainingMins}m`

  if (!reportData) return <div className="min-h-screen bg-transparent p-10 text-center">Loading Report...</div>

  const maxChartXP = Math.max(...reportData.chartData.map(d => d.xp), 100) // minimum scale of 100

  return (
    <div className="min-h-screen bg-transparent flex justify-center pb-20 md:pb-0 font-sans">
      <main className="flex-1 max-w-[900px] px-4 py-8 space-y-8" ref={printRef}>
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              <Target className="text-indigo-500" />
              Learning Report
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Performance analysis and recommendations for <span className="font-bold text-indigo-500">{learningLang.name}</span>
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="print-hidden flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 rounded-xl font-bold text-slate-700 dark:text-slate-200 transition-all active:scale-95"
          >
            <Printer size={18} /> Print Report
          </button>
        </div>

        {/* Profile Card */}
        <div className="soft-card p-6 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-3xl mb-8 flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center font-black text-2xl backdrop-blur-md">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user?.name || 'Learner'}</h2>
            <p className="text-indigo-100 font-medium">Goal: {user?.goal ? user.goal.charAt(0).toUpperCase() + user.goal.slice(1) : 'Conversation'}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="soft-card p-5 bg-white dark:bg-slate-900 rounded-3xl">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center mb-3">
              <Zap size={20} />
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total XP</p>
            <p className="text-2xl font-black text-slate-800 dark:text-white">{user?.xp || 0}</p>
          </div>
          
          <div className="soft-card p-5 bg-white dark:bg-slate-900 rounded-3xl">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-500 flex items-center justify-center mb-3">
              <TrendingUp size={20} />
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Current Streak</p>
            <p className="text-2xl font-black text-slate-800 dark:text-white">{user?.streak || 0} Days</p>
          </div>
          
          <div className="soft-card p-5 bg-white dark:bg-slate-900 rounded-3xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-500 flex items-center justify-center mb-3">
              <BookOpen size={20} />
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Lessons Done</p>
            <p className="text-2xl font-black text-slate-800 dark:text-white">{completedCount}</p>
          </div>
          
          <div className="soft-card p-5 bg-white dark:bg-slate-900 rounded-3xl">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-500 flex items-center justify-center mb-3">
              <Clock size={20} />
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Time Learned</p>
            <p className="text-2xl font-black text-slate-800 dark:text-white">{timeString}</p>
          </div>
        </div>

        {/* 7-Day Activity Chart */}
        <div className="soft-card p-6 bg-white dark:bg-slate-900 rounded-3xl mb-8">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Activity (Last 7 Days)</h2>
          <div className="flex items-end justify-between h-48 gap-2">
            {reportData.chartData.map((day, idx) => {
              const heightPercent = Math.max((day.xp / maxChartXP) * 100, 5) // at least 5% height for visibility
              return (
                <div key={idx} className="flex flex-col items-center flex-1 group">
                  <div className="w-full flex justify-center items-end h-32 mb-3">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="w-full max-w-[40px] bg-gradient-to-t from-indigo-500 to-violet-400 rounded-t-lg relative"
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {day.xp} XP
                      </div>
                    </motion.div>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 text-center whitespace-nowrap overflow-hidden text-ellipsis w-full">
                    {day.date}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* AI Smart Insights */}
        <div className="soft-card p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-900/30 border-2 border-emerald-100 dark:border-emerald-800 rounded-3xl mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 shrink-0 bg-emerald-200 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-300 rounded-2xl flex items-center justify-center">
              <BrainCircuit size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mb-2">Smart Insights</h2>
              <p className="text-emerald-700 dark:text-emerald-400 font-medium leading-relaxed">
                {reportData.insightText}
              </p>
            </div>
          </div>
        </div>

        {/* Improvement Recommendations */}
        <div className="mb-8 page-break-inside-avoid">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Star className="text-amber-500" size={20} />
            Action Plan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportData.recs.length > 0 ? (
              reportData.recs.map((rec, idx) => (
                <div key={idx} className="soft-card p-5 bg-white dark:bg-slate-900 rounded-2xl flex gap-4">
                  <div className={`w-12 h-12 rounded-xl flex shrink-0 items-center justify-center ${rec.bg} ${rec.color}`}>
                    <Zap size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white mb-1">{rec.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{rec.desc}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                <p className="text-slate-500 font-medium">Keep learning to unlock personalized recommendations!</p>
              </div>
            )}
          </div>
        </div>

        {/* Weakness Analysis */}
        <div className="mt-10 page-break-before">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="text-rose-500" size={20} />
            Mistake Bank Analysis
          </h2>
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            {reportData.sortedMistakes.length > 0 ? (
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-500">Term</th>
                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-500">Meaning</th>
                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-500">Errors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {reportData.sortedMistakes.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-800 dark:text-white">{m.word}</td>
                      <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{m.translation}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                          {m.count}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-10 text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Star size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No Mistakes Yet!</h3>
                <p className="text-slate-500">You haven't made any mistakes in {learningLang.name} yet. Keep up the perfect work!</p>
              </div>
            )}
          </div>
        </div>

      </main>

      <div className="print-hidden">
        <RightSidebar />
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            margin: 1cm;
          }
          .print-hidden {
            display: none !important;
          }
          .page-break-before {
            page-break-before: always;
          }
          .page-break-inside-avoid {
            page-break-inside: avoid;
          }
          body {
            background-color: white !important;
          }
          main {
            margin-left: 0 !important;
            max-width: 100% !important;
            padding: 0 !important;
          }
          .soft-card {
            border: 1px solid #e2e8f0;
            box-shadow: none !important;
          }
        }
      `}} />
    </div>
  )
}
