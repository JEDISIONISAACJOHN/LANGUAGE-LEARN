import { useLocation } from 'react-router-dom'
import AppSidebar from '../Navigation/AppSidebar'

export default function AppLayout({ children }) {
  const location = useLocation()
  
  // Exclude AppLayout on these routes (e.g. they handle their own immersive UI)
  const isExcluded = ['/', '/login', '/signup', '/onboarding'].includes(location.pathname) || location.pathname.startsWith('/lesson')

  if (isExcluded) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950">{children}</div>
  }

  return (
    <div className="flex min-h-[100dvh] bg-slate-50 dark:bg-slate-950 relative aurora-bg">
      <AppSidebar />
      {/* 
        Main Content Area 
        Top margin matches navbar height + padding on desktop. Small padding on mobile.
      */}
      <main className="flex-1 w-full pt-6 md:pt-28 pb-20 md:pb-8 min-h-[100dvh]">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6">
          {children}
        </div>
      </main>
    </div>
  )
}
