import { useState, useEffect } from 'react'
import { Search, Info, X, Edit2, Save, Trash2, ShieldAlert } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../../services/auth'

export default function LearnerManagement({ onDataChange, refreshTrigger }) {
  const { getAllUsers, adminUpdateUser, adminDeleteUser } = useAuth()
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({})

  const loadUsers = async () => {
    const allUsers = await getAllUsers()
    setUsers(allUsers || [])
    setLoading(false)
  }

  useEffect(() => {
    loadUsers()
  }, [getAllUsers, refreshTrigger])

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTargetTrack = (u) => {
    if (!u.learningLanguage) return 'None'
    const names = { hi: 'Hindi', kn: 'Kannada', mr: 'Marathi', ta: 'Tamil', te: 'Telugu', bn: 'Bengali' }
    return names[u.learningLanguage] || u.learningLanguage.toUpperCase()
  }

  const getCefrLevel = (level) => {
    const levels = {
      beginner: 'A0 (Beginner)',
      intermediate: 'B1 (Intermediate)',
      advanced: 'C1 (Advanced)'
    }
    return levels[level] || 'A0 (Beginner)'
  }

  const openModal = (user) => {
    setSelectedUser(user)
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      level: user.level || 'beginner',
      xp: user.xp || 0,
      streak: user.streak || 0,
      learningLanguage: user.learningLanguage || ''
    })
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!selectedUser) return
    await adminUpdateUser(selectedUser.id, {
      name: editForm.name,
      role: editForm.role,
      level: editForm.level,
      xp: parseInt(editForm.xp, 10) || 0,
      streak: parseInt(editForm.streak, 10) || 0,
      learningLanguage: editForm.learningLanguage
    })
    setIsEditing(false)
    loadUsers() // refresh list
    if (onDataChange) onDataChange()
    
    // Update local selected state just to reflect changes instantly without re-opening
    setSelectedUser(prev => ({...prev, ...editForm, xp: parseInt(editForm.xp, 10) || 0, streak: parseInt(editForm.streak, 10) || 0}))
  }

  const handleDelete = async () => {
    if (!selectedUser) return
    if (confirm(`Are you sure you want to delete ${selectedUser.email}? This cannot be undone.`)) {
      await adminDeleteUser(selectedUser.id)
      setSelectedUser(null)
      loadUsers()
      if (onDataChange) onDataChange()
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search learners by name or email address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#1e2333] border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white outline-none transition-all placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1e2333] border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/50">
          <h3 className="text-lg font-semibold text-white">
            Registered Learners Directory ({filteredUsers.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#151928] text-xs uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-700/50">
              <tr>
                <th className="px-6 py-4">Learner Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Target Track</th>
                <th className="px-6 py-4">CEFR Level</th>
                <th className="px-6 py-4">Predicted Score</th>
                <th className="px-6 py-4">XP / Streak</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-slate-400">Loading learners...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-slate-400">No learners found.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-200">{user.name}</td>
                    <td className="px-6 py-4 text-slate-400">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md text-xs font-semibold">
                        {getTargetTrack(user)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{getCefrLevel(user.level)}</td>
                    <td className="px-6 py-4 text-emerald-400 font-medium">
                      {user.assessmentScore ? `${user.assessmentScore}%` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-amber-400 font-medium">
                      {user.xp} XP / {user.streak}d
                    </td>
                    <td className="px-6 py-4 text-slate-300 uppercase text-xs font-bold tracking-wider">
                      {user.role}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button 
                          onClick={() => openModal(user)}
                          className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg inline-flex items-center space-x-1"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={async () => {
                            if (confirm(`Are you sure you want to delete ${user.email}? This cannot be undone.`)) {
                              await adminDeleteUser(user.id)
                              loadUsers()
                            }
                          }}
                          className="text-slate-400 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-lg inline-flex items-center space-x-1"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect/Edit Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-[#1e2333] border border-slate-700 shadow-2xl rounded-2xl w-full max-w-md p-6"
            >
              <button 
                onClick={() => setSelectedUser(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center justify-between mb-6 border-b border-slate-700/50 pb-4 pr-8">
                <h3 className="text-xl font-bold text-white">
                  {isEditing ? 'Edit Profile' : 'Learner Profile'}: {selectedUser.name}
                </h3>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="text-indigo-400 hover:text-indigo-300 transition-colors p-1 bg-indigo-400/10 rounded">
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="space-y-4 text-sm">
                {isEditing ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-slate-400 text-xs font-semibold uppercase">Name</label>
                      <input 
                        type="text" 
                        value={editForm.name} 
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="w-full px-3 py-2 bg-[#151928] border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 text-xs font-semibold uppercase">Email (Read Only)</label>
                      <input 
                        type="email" 
                        value={editForm.email} 
                        disabled
                        className="w-full px-3 py-2 bg-black/30 border border-slate-700 rounded-lg text-slate-500 outline-none cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 text-xs font-semibold uppercase">Target Language Code</label>
                      <select 
                        value={editForm.learningLanguage} 
                        onChange={(e) => setEditForm({...editForm, learningLanguage: e.target.value})}
                        className="w-full px-3 py-2 bg-[#151928] border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white outline-none"
                      >
                        <option value="">None</option>
                        <option value="hi">Hindi</option>
                        <option value="kn">Kannada</option>
                        <option value="ta">Tamil</option>
                        <option value="te">Telugu</option>
                        <option value="mr">Marathi</option>
                        <option value="bn">Bengali</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 text-xs font-semibold uppercase">Level</label>
                      <select 
                        value={editForm.level} 
                        onChange={(e) => setEditForm({...editForm, level: e.target.value})}
                        className="w-full px-3 py-2 bg-[#151928] border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white outline-none"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 text-xs font-semibold uppercase">Role</label>
                      <select 
                        value={editForm.role} 
                        onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                        className="w-full px-3 py-2 bg-[#151928] border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white outline-none"
                      >
                        <option value="learner">Learner</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 text-xs font-semibold uppercase">XP</label>
                      <input 
                        type="number" 
                        value={editForm.xp} 
                        onChange={(e) => setEditForm({...editForm, xp: e.target.value})}
                        className="w-full px-3 py-2 bg-[#151928] border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 text-xs font-semibold uppercase">Streak (Days)</label>
                      <input 
                        type="number" 
                        value={editForm.streak} 
                        onChange={(e) => setEditForm({...editForm, streak: e.target.value})}
                        className="w-full px-3 py-2 bg-[#151928] border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white outline-none"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Email</span>
                      <span className="text-white font-medium">{selectedUser.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Target Language</span>
                      <span className="text-white font-medium">{getTargetTrack(selectedUser)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">CEFR Benchmark</span>
                      <span className="text-white font-medium">{getCefrLevel(selectedUser.level)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Role</span>
                      <span className="text-white font-medium capitalize">{selectedUser.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Predicted Proficiency</span>
                      <span className="text-emerald-400 font-medium">{selectedUser.assessmentScore ? `${selectedUser.assessmentScore}%` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Lessons Completed</span>
                      <span className="text-white font-medium">{selectedUser.completedLessons?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current XP</span>
                      <span className="text-amber-400 font-medium">{selectedUser.xp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Streak</span>
                      <span className="text-orange-400 font-medium">{selectedUser.streak} Days</span>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-8 flex space-x-3">
                {isEditing ? (
                  <>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSave}
                      className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => setSelectedUser(null)}
                      className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors"
                    >
                      Close Profile
                    </button>
                    <button 
                      onClick={handleDelete}
                      className="py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-medium rounded-xl transition-colors flex items-center justify-center border border-red-500/20"
                      title="Delete User"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
