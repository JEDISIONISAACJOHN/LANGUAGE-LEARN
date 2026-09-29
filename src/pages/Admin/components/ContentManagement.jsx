import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Book, Plus, Edit2, Trash2, Globe, Languages, ChevronDown, CheckCircle2, PlayCircle, X, Save } from 'lucide-react'
import { languages } from '../../../data/languages'

const INITIAL_COURSES = [
  { id: 1, title: 'Basics 1', type: 'Vocabulary', items: 12, status: 'published' },
  { id: 2, title: 'Greetings', type: 'Conversation', items: 8, status: 'published' },
  { id: 3, title: 'Travel Essentials', type: 'Phrasebook', items: 15, status: 'published' },
  { id: 4, title: 'At the Restaurant', type: 'Roleplay', items: 10, status: 'draft' },
]

const INITIAL_STORIES = [
  { id: 1, title: 'The Lost Auto Rickshaw', level: 'Beginner', duration: '5 min', status: 'published' },
  { id: 2, title: 'A Day in the Market', level: 'Intermediate', duration: '8 min', status: 'published' },
  { id: 3, title: 'Festival of Colors', level: 'Beginner', duration: '6 min', status: 'draft' },
]

export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState('courses')
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0].id)
  
  const [courses, setCourses] = useState([])
  const [stories, setStories] = useState([])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null) // null = create new
  const [formState, setFormState] = useState({})

  useEffect(() => {
    const localCourses = localStorage.getItem('bharatlingo_admin_courses')
    const localStories = localStorage.getItem('bharatlingo_admin_stories')
    
    if (localCourses) setCourses(JSON.parse(localCourses))
    else setCourses(INITIAL_COURSES)
    
    if (localStories) setStories(JSON.parse(localStories))
    else setStories(INITIAL_STORIES)
  }, [])

  const saveCourses = (newCourses) => {
    setCourses(newCourses)
    localStorage.setItem('bharatlingo_admin_courses', JSON.stringify(newCourses))
  }

  const saveStories = (newStories) => {
    setStories(newStories)
    localStorage.setItem('bharatlingo_admin_stories', JSON.stringify(newStories))
  }

  const handleOpenModal = (item = null) => {
    setEditingItem(item)
    if (item) {
      setFormState(item)
    } else {
      if (activeTab === 'courses') {
        setFormState({ title: '', type: 'Vocabulary', items: 10, status: 'draft' })
      } else if (activeTab === 'stories') {
        setFormState({ title: '', level: 'Beginner', duration: '5 min', status: 'draft' })
      }
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (activeTab === 'courses') {
      if (editingItem) {
        saveCourses(courses.map(c => c.id === editingItem.id ? { ...formState, id: c.id } : c))
      } else {
        saveCourses([...courses, { ...formState, id: Date.now() }])
      }
    } else if (activeTab === 'stories') {
      if (editingItem) {
        saveStories(stories.map(s => s.id === editingItem.id ? { ...formState, id: s.id } : s))
      } else {
        saveStories([...stories, { ...formState, id: Date.now() }])
      }
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      if (activeTab === 'courses') {
        saveCourses(courses.filter(c => c.id !== id))
      } else if (activeTab === 'stories') {
        saveStories(stories.filter(s => s.id !== id))
      }
    }
  }

  const tabs = [
    { id: 'courses', label: 'Courses & Lessons', icon: Book },
    { id: 'stories', label: 'Interactive Stories', icon: PlayCircle },
    { id: 'languages', label: 'Language Tracks', icon: Globe },
  ]

  return (
    <div className="space-y-6 relative">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-4 rounded-xl">
        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-indigo-500 text-white' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
        
        <div className="flex items-center gap-3">
          {activeTab !== 'languages' && (
            <div className="relative">
              <select 
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="appearance-none bg-slate-900 border border-slate-700 text-white text-sm rounded-lg pl-10 pr-8 py-2 focus:outline-none focus:border-indigo-500 w-48"
              >
                {languages.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
              <Languages className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>
          )}
          
          {activeTab !== 'languages' && (
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              <Plus size={16} />
              <span>Create New</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden min-h-[400px]">
        
        {activeTab === 'courses' && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900/50">
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Lesson Title</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Items</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course, i) => (
                <tr key={course.id} className="border-b border-slate-700/50 hover:bg-slate-800/80 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                        {i + 1}
                      </div>
                      <span className="font-semibold text-slate-200">{course.title}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-400 text-sm">{course.type}</td>
                  <td className="p-4 text-slate-400 text-sm">{course.items} words/phrases</td>
                  <td className="p-4">
                    {course.status === 'published' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                        <CheckCircle2 size={12} /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenModal(course)} className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(course.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">No courses available. Click "Create New" to add one.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'stories' && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900/50">
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Story Title</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Level</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Est. Duration</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stories.map(story => (
                <tr key={story.id} className="border-b border-slate-700/50 hover:bg-slate-800/80 transition-colors">
                  <td className="p-4 font-semibold text-slate-200">{story.title}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-slate-900 rounded border border-slate-700 text-xs text-slate-300">
                      {story.level}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 text-sm">{story.duration}</td>
                  <td className="p-4">
                    {story.status === 'published' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                        <CheckCircle2 size={12} /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenModal(story)} className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(story.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {stories.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">No stories available. Click "Create New" to add one.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'languages' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {languages.map(lang => (
              <div key={lang.id} className="bg-slate-900 rounded-xl p-5 border border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{lang.flag}</div>
                  <div>
                    <h4 className="font-bold text-slate-200">{lang.name}</h4>
                    <p className="text-xs text-slate-400">{lang.script}</p>
                  </div>
                </div>
              </div>
            ))}
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
                {editingItem ? 'Edit' : 'Create'} {activeTab === 'courses' ? 'Course' : 'Story'}
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-slate-400 text-xs font-semibold uppercase">Title</label>
                  <input 
                    type="text" 
                    value={formState.title || ''} 
                    onChange={(e) => setFormState({...formState, title: e.target.value})}
                    className="w-full px-3 py-2 bg-[#151928] border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white outline-none"
                    placeholder="Enter title..."
                  />
                </div>

                {activeTab === 'courses' ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-slate-400 text-xs font-semibold uppercase">Type</label>
                      <select 
                        value={formState.type || ''} 
                        onChange={(e) => setFormState({...formState, type: e.target.value})}
                        className="w-full px-3 py-2 bg-[#151928] border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white outline-none"
                      >
                        <option value="Vocabulary">Vocabulary</option>
                        <option value="Conversation">Conversation</option>
                        <option value="Phrasebook">Phrasebook</option>
                        <option value="Roleplay">Roleplay</option>
                        <option value="Grammar">Grammar</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 text-xs font-semibold uppercase">Number of Items</label>
                      <input 
                        type="number" 
                        value={formState.items || ''} 
                        onChange={(e) => setFormState({...formState, items: parseInt(e.target.value, 10) || 0})}
                        className="w-full px-3 py-2 bg-[#151928] border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white outline-none"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label className="text-slate-400 text-xs font-semibold uppercase">Level</label>
                      <select 
                        value={formState.level || ''} 
                        onChange={(e) => setFormState({...formState, level: e.target.value})}
                        className="w-full px-3 py-2 bg-[#151928] border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white outline-none"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 text-xs font-semibold uppercase">Est. Duration</label>
                      <input 
                        type="text" 
                        value={formState.duration || ''} 
                        onChange={(e) => setFormState({...formState, duration: e.target.value})}
                        className="w-full px-3 py-2 bg-[#151928] border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white outline-none"
                        placeholder="e.g. 5 min"
                      />
                    </div>
                  </>
                )}
                
                <div className="space-y-1">
                  <label className="text-slate-400 text-xs font-semibold uppercase">Status</label>
                  <select 
                    value={formState.status || ''} 
                    onChange={(e) => setFormState({...formState, status: e.target.value})}
                    className="w-full px-3 py-2 bg-[#151928] border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
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
                  className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center space-x-2"
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
