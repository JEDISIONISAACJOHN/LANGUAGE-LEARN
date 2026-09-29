import { useState } from 'react'
import { Brain, Cpu, Zap, Activity, RefreshCw, Settings2, Sparkles, Filter } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AIRecommendations() {
  const [engineStatus, setEngineStatus] = useState('online')
  const [strictness, setStrictness] = useState(70)

  // Mock logs
  const mockLogs = [
    { id: 1, time: '10:45 AM', user: 'user_482', action: 'Adaptive Path Updated', detail: 'Increased vocabulary difficulty based on 95% pass rate.' },
    { id: 2, time: '10:42 AM', user: 'user_193', action: 'Story Generated', detail: 'Created contextual story "The Lost Ticket" focusing on travel.' },
    { id: 3, time: '10:38 AM', user: 'user_847', action: 'Pronunciation Review', detail: 'Flagged retroflex consonants for review in next session.' },
    { id: 4, time: '10:30 AM', user: 'system', action: 'Engine Optimization', detail: 'Model weights updated for improved spaced repetition.' },
  ]

  return (
    <div className="space-y-6">
      
      {/* Engine Status Headers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Core Engine Status */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
              <Brain size={24} />
            </div>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              ONLINE
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Core NLP Engine</h3>
          <p className="text-sm text-slate-400">Handles language parsing and contextual generation.</p>
        </div>

        {/* Adaptive Logic Status */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/10 rounded-bl-full"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
              <Cpu size={24} />
            </div>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              ONLINE
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Adaptive Logic</h3>
          <p className="text-sm text-slate-400">Calculates difficulty scaling and spaced repetition.</p>
        </div>

        {/* Speech Evaluation Status */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/10 rounded-bl-full"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
              <Activity size={24} />
            </div>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-700/50 text-slate-400 text-xs font-bold rounded-full border border-slate-600">
              STANDBY
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Speech Evaluator</h3>
          <p className="text-sm text-slate-400">Acoustic modeling for pronunciation accuracy.</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Real-time Recommendations Log */}
        <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl flex flex-col h-[500px]">
          <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="text-indigo-400" size={20} />
              <h3 className="text-lg font-bold text-white">Live Recommendation Engine</h3>
            </div>
            <button className="text-slate-400 hover:text-white transition-colors">
              <Filter size={18} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {mockLogs.map((log, index) => (
              <motion.div 
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-700/30 hover:border-indigo-500/30 transition-colors"
              >
                <div className="text-xs font-mono text-slate-500 mt-1 shrink-0 w-16">{log.time}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-white">{log.action}</span>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {log.user}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{log.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Engine Configurations */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 flex flex-col h-[500px]">
          <div className="flex items-center gap-2 mb-6">
            <Settings2 className="text-emerald-400" size={20} />
            <h3 className="text-lg font-bold text-white">Global AI Parameters</h3>
          </div>

          <div className="space-y-8 flex-1">
            {/* Difficulty Strictness */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <label className="text-sm font-semibold text-slate-200 block mb-1">Assessment Strictness</label>
                  <span className="text-xs text-slate-400">Controls how easily users level up.</span>
                </div>
                <span className="text-lg font-bold text-emerald-400">{strictness}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={strictness}
                onChange={(e) => setStrictness(e.target.value)}
                className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-2 uppercase font-bold tracking-wider">
                <span>Forgiving</span>
                <span>Standard</span>
                <span>Rigid</span>
              </div>
            </div>

            {/* Content Generation Limit */}
            <div>
              <label className="text-sm font-semibold text-slate-200 block mb-1">Story Generation Cache</label>
              <p className="text-xs text-slate-400 mb-3">Limits real-time AI generation to save API costs.</p>
              <select className="w-full bg-slate-900 border border-slate-700 text-sm text-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500">
                <option>Aggressive Caching (Low Cost)</option>
                <option>Balanced</option>
                <option>Always Generate Fresh (High Cost)</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-700/50">
            <button className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
              <RefreshCw size={18} />
              Restart AI Engines
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
