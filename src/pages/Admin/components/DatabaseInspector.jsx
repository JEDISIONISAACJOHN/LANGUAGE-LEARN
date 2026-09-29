import { useState, useEffect } from 'react'
import { Database, Table, RefreshCw, FileText } from 'lucide-react'
import { useAuth } from '../../../services/auth'

export default function DatabaseInspector() {
  const { getAllUsers } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const allUsers = await getAllUsers()
      setUsers(allUsers || [])
      setLoading(false)
    }
    loadData()
  }, [getAllUsers])

  const tables = [
    { name: 'languages', count: 6 },
    { name: 'learners', count: users.length },
    { name: 'courses', count: 6 },
    { name: 'topics', count: 24 },
    { name: 'lessons', count: 120 },
    { name: 'assessments', count: users.filter(u => u.hasCompletedAssessment).length },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1e2333] border border-slate-700/50 rounded-xl p-4 flex flex-col items-center justify-center">
          <span className="text-slate-400 text-sm font-medium mb-1 uppercase tracking-wider">Total Tables</span>
          <span className="text-2xl font-bold text-white">{tables.length}</span>
        </div>
        <div className="bg-[#1e2333] border border-slate-700/50 rounded-xl p-4 flex flex-col items-center justify-center">
          <span className="text-slate-400 text-sm font-medium mb-1 uppercase tracking-wider">Total Rows (Mock)</span>
          <span className="text-2xl font-bold text-emerald-400">181</span>
        </div>
        <div className="bg-[#1e2333] border border-slate-700/50 rounded-xl p-4 flex flex-col items-center justify-center">
          <span className="text-slate-400 text-sm font-medium mb-1 uppercase tracking-wider">Database Size</span>
          <span className="text-2xl font-bold text-amber-400">540.00 KB</span>
        </div>
        <div className="bg-[#1e2333] border border-slate-700/50 rounded-xl p-4 flex flex-col items-center justify-center">
          <span className="text-slate-400 text-sm font-medium mb-1 uppercase tracking-wider">Database Engine</span>
          <span className="text-lg font-bold text-indigo-400">Supabase / Local</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="bg-[#1e2333] border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700/50 bg-[#151928] flex items-center space-x-2">
            <Database className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Database Tables ({tables.length})</span>
          </div>
          <div className="py-2">
            {tables.map((t) => (
              <button
                key={t.name}
                className={`w-full px-4 py-2 flex items-center justify-between text-sm ${t.name === 'learners' ? 'bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500' : 'text-slate-300 hover:bg-slate-800/30'}`}
              >
                <div className="flex items-center space-x-2">
                  <Table className="w-4 h-4" />
                  <span>{t.name}</span>
                </div>
                <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full">{t.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Data View */}
        <div className="lg:col-span-3 bg-[#1e2333] border border-slate-700/50 rounded-xl overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between bg-[#151928]">
            <div className="flex items-center space-x-3">
              <Table className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-semibold text-white">Table: learners</h3>
            </div>
            <button className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors text-sm font-medium px-3 py-1.5 bg-slate-800 rounded-lg">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Data</span>
            </button>
          </div>
          
          <div className="p-4 bg-slate-800/30 border-b border-slate-700/50">
            <p className="text-xs text-slate-400 flex items-center"><FileText className="w-3 h-3 mr-1" /> Showing {users.length} of {users.length} entries</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#151928] text-xs uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-700/50">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Hashed Password</th>
                  <th className="px-6 py-4">Full Name</th>
                  <th className="px-6 py-4">Age Range</th>
                  <th className="px-6 py-4">Preferred Lang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-400">Loading data...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-400">No data found in table.</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-slate-400 max-w-[100px] truncate" title={user.id}>{user.id}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-mono">••••••••••••••</td>
                      <td className="px-6 py-4 text-sm text-slate-200">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{user.ageRange || 'NULL'}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{user.preferredLanguage || 'en'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
