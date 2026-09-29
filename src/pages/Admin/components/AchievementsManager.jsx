import { useState, useEffect } from 'react'
import { Award, Plus, Edit2, Trash2, Search, X, Save } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const INITIAL_ACHIEVEMENTS = [
  { id: 1, title: 'First Steps', description: 'Complete your first lesson', icon: '🌱', xp: 50, unlockedBy: 142 },
  { id: 2, title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥', xp: 200, unlockedBy: 89 },
  { id: 3, title: 'Polyglot', description: 'Start learning a second language', icon: '🌍', xp: 150, unlockedBy: 34 },
  { id: 4, title: 'Perfect Pitch', description: 'Score 100% on a pronunciation test', icon: '🎤', xp: 300, unlockedBy: 12 },
  { id: 5, title: 'Night Owl', description: 'Complete 5 lessons after 10 PM', icon: '🦉', xp: 100, unlockedBy: 56 },
]

export default function AchievementsManager() {
  const [achievements, setAchievements] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formState, setFormState] = useState({})

  useEffect(() => {
    const localData = localStorage.getItem('bharatlingo_admin_achievements')
    if (localData) {
      setAchievements(JSON.parse(localData))
    } else {
      setAchievements(INITIAL_ACHIEVEMENTS)
    }
  }, [])

  const saveAchievements = (newData) => {
    setAchievements(newData)
    localStorage.setItem('bharatlingo_admin_achievements', JSON.stringify(newData))
  }

  const handleOpenModal = (item = null) => {
    setEditingItem(item)
    if (item) {
      setFormState(item)
    } else {
      setFormState({ title: '', description: '', icon: '🏆', xp: 100, unlockedBy: 0 })
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (editingItem) {
      saveAchievements(achievements.map(a => a.id === editingItem.id ? { ...formState, id: a.id } : a))
    } else {
      saveAchievements([...achievements, { ...formState, id: Date.now() }])
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this achievement?')) {
      saveAchievements(achievements.filter(a => a.id !== id))
    }
  }

  const filtered = achievements.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 relative">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
        <div className="relative w-full sm:w-64">
          <input 
            type="text" 
            placeholder="Search achievements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-sm text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-amber-500"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
        >
          <Plus size={16} />
          <span>New Achievement</span>
        </button>
      </div>

      {/* Grid of Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(achievement => (
          <div key={achievement.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 hover:border-amber-500/30 transition-colors group">
            
            <div className="flex justify-between items-start mb-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl shadow-glow">
                {achievement.icon}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(achievement)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(achievement.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-white mb-1">{achievement.title}</h3>
            <p className="text-sm text-slate-400 mb-4 h-10">{achievement.description}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
              <div className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-md text-xs font-bold">
                <Award size={14} />
                +{achievement.xp} XP
              </div>
              <div className="text-xs text-slate-400 font-medium">
                Unlocked by <span className="text-slate-200">{achievement.unlockedBy}</span> users
              </div>
            </div>
            
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full p-8 text-center text-slate-400">
            No achievements found.
          </div>
        )}
      </div>
      
      {/* Edit/Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-[#1e2333] border border-slate-700 shadow-2xl rounded-2xl w-full max-w-md p-6"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-700/50 pb-4 pr-8">
                {editingItem ? 'Edit' : 'Create'} Achievement
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-slate-400 text-xs font-semibold uppercase">Title</label>
                  <input 
                    type="text" 
                    value={formState.title || ''} 
                    onChange={(e) => setFormState({...formState, title: e.target.value})}
                    className="w-full px-3 py-2 bg-[#151928] border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 text-white outline-none"
                    placeholder="Enter title..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 text-xs font-semibold uppercase">Description</label>
                  <textarea 
                    value={formState.description || ''} 
                    onChange={(e) => setFormState({...formState, description: e.target.value})}
                    className="w-full px-3 py-2 bg-[#151928] border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 text-white outline-none min-h-[80px]"
                    placeholder="Short description..."
                  />
                </div>
                <div className="flex gap-4">
                  <div className="space-y-1 flex-1">
                    <label className="text-slate-400 text-xs font-semibold uppercase">Icon (Emoji)</label>
                    <input 
                      type="text" 
                      value={formState.icon || ''} 
                      onChange={(e) => setFormState({...formState, icon: e.target.value})}
                      className="w-full px-3 py-2 bg-[#151928] border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 text-white outline-none"
                    />
                  </div>
                  <div className="space-y-1 flex-1">
                    <label className="text-slate-400 text-xs font-semibold uppercase">XP Reward</label>
                    <input 
                      type="number" 
                      value={formState.xp || ''} 
                      onChange={(e) => setFormState({...formState, xp: parseInt(e.target.value, 10) || 0})}
                      className="w-full px-3 py-2 bg-[#151928] border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex space-x-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
