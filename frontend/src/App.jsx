import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import Landing     from './pages/Landing.jsx'
import Login       from './pages/Login.jsx'
import Signup      from './pages/Signup.jsx'
import Navbar      from './components/Navbar.jsx'
import InspectMode from './components/InspectMode.jsx'
import AIBuilder   from './components/AIBuilder.jsx'
import CodeEditor  from './components/CodeEditor.jsx'
import Toast       from './components/Toast.jsx'
import { useToast } from './hooks/useToast.js'

function AppShell() {
  const [mode, setMode] = useState('inspect')
  const { toast, showToast } = useToast()

  // ── Dark mode ──────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => localStorage.getItem('devlens-theme') || 'light')
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('devlens-theme', theme)
  }, [theme])
  const toggleTheme = (val) => {
    if (val) { setTheme(val); return }
    setTheme(t => t === 'dark' ? 'light' : 'dark')
  }

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const h = e => {
      if (!e.metaKey && !e.ctrlKey) return
      switch (e.key.toLowerCase()) {
        case 'i': e.preventDefault(); setMode('inspect'); showToast('🔍', 'Inspector'); break
        case 'b': e.preventDefault(); setMode('builder'); showToast('🤖', 'AI Builder'); break
        case 'e': e.preventDefault(); setMode('editor');  showToast('</>', 'Code Editor'); break
        case 'd': e.preventDefault(); toggleTheme(); break
        default: break
      }
    }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [theme])

  return (
    <div className="app-shell">
      <Navbar
        mode={mode}
        setMode={setMode}
        showToast={showToast}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <div style={{ overflow:'hidden', display:'flex', flexDirection:'column', height:'100%' }}>
        {mode === 'inspect' && <InspectMode showToast={showToast} />}
        {mode === 'builder' && <AIBuilder   showToast={showToast} />}
        {mode === 'editor'  && <CodeEditor  showToast={showToast} />}
      </div>
      <Toast icon={toast.icon} message={toast.message} visible={toast.visible} />
    </div>
  )
}

function Router() {
  const { user } = useAuth()
  const [page, setPage] = useState('landing')
  if (user) return <AppShell />
  if (page === 'login')  return <Login  onSwitch={() => setPage('signup')} onSuccess={() => setPage('app')} onBack={() => setPage('landing')} />
  if (page === 'signup') return <Signup onSwitch={() => setPage('login')}  onSuccess={() => setPage('app')} onBack={() => setPage('landing')} />
  return <Landing onLogin={() => setPage('login')} onSignup={() => setPage('signup')} />
}

export default function App() {
  return <AuthProvider><Router /></AuthProvider>
}