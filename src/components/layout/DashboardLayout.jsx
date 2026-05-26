import { useState, useEffect } from 'react'
import Header from './Header'
import { Grid3X3, BarChart3, Settings, Users, LogOut, ChevronRight, ShieldAlert } from 'lucide-react'

export default function DashboardLayout({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme')
      return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
    return false
  })
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  // Sync class on documentElement
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDarkMode])

  const navigationItems = [
    { name: 'Dashboard', icon: Grid3X3, active: true },
    { name: 'Analytics', icon: BarChart3, active: false },
    { name: 'Team Planning', icon: Users, active: false },
    { name: 'System Alerts', icon: ShieldAlert, active: false },
    { name: 'Settings', icon: Settings, active: false },
  ]

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100 flex flex-col">
      {/* Top Header */}
      <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Collapsible Sidebar */}
        <aside
          className={`border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 transition-all duration-300 flex flex-col justify-between ${
            isSidebarOpen ? 'w-64' : 'w-16'
          }`}
        >
          {/* Nav Items */}
          <div className="py-6 flex flex-col gap-1">
            {navigationItems.map((item, index) => {
              const Icon = item.icon
              return (
                <button
                  key={index}
                  className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    item.active
                      ? 'bg-indigo-50 text-indigo-655 dark:bg-indigo-950/50 dark:text-indigo-400'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-250'
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {isSidebarOpen && <span className="truncate">{item.name}</span>}
                </button>
              )
            })}
          </div>

          {/* Sidebar Toggle & Logout */}
          <div className="p-4 border-t border-slate-150 dark:border-slate-850 flex flex-col gap-2">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 p-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            >
              {isSidebarOpen ? 'Collapse Menu' : <ChevronRight className="h-4 w-4" />}
            </button>
            
            <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20 transition-all duration-200">
              <LogOut className="h-5 w-5 shrink-0" />
              {isSidebarOpen && <span>Sign Out</span>}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6">
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
