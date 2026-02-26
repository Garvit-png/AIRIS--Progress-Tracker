import React, { useState, useEffect } from 'react'
import './index.css'
import LoaderScreen from './components/LoaderScreen'
import Dashboard from './components/Dashboard'
import LoginGate from './components/LoginGate'
import CustomCursor from './components/CustomCursor'
import { AuthService } from './services/authService'

// Simple render-crash catcher
function ErrorBoundary({ children }) {
  const [hasError, setHasError] = React.useState(false)
  const [errorInfo, setErrorInfo] = React.useState('')

  React.useEffect(() => {
    const handleError = (error) => {
      console.error('[App] Critical Render Error:', error)
      setHasError(true)
      setErrorInfo(error.message || 'Unknown Error')
    }
    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center bg-black">
        <div className="p-4 border border-red-500/50 rounded bg-red-500/5">
          <p className="font-mono text-xs text-red-500 uppercase tracking-widest mb-2 font-bold">Rendering Failure</p>
          <p className="font-mono text-[10px] text-white/50">{errorInfo}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-white text-black text-[10px] font-bold uppercase rounded-full"
        >
          Reset Session
        </button>
      </div>
    )
  }

  return children
}

export default function App() {
  const [phase, setPhase] = useState('loading') // loading -> app
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState(() => localStorage.getItem('airis-theme') || 'dark')

  useEffect(() => {
    localStorage.setItem('airis-theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    // Check for existing session
    const sessionUser = AuthService.getSession()
    if (sessionUser) {
      setUser(sessionUser)
    }
  }, [])

  const lastUser = AuthService.getLastUser()
  const displayUser = user || lastUser

  const handleLogin = (userData) => {
    console.log('[App] User logged in:', userData)
    setUser(userData)
  }

  return (
    <div
      className={`w-full h-full text-white overflow-hidden relative transition-colors duration-500`}
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      {phase === 'loading' ? (
        <LoaderScreen onComplete={() => setPhase('app')} user={displayUser} />
      ) : !user ? (
        <ErrorBoundary>
          <LoginGate onLogin={handleLogin} />
        </ErrorBoundary>
      ) : (
        <ErrorBoundary>
          <Dashboard
            user={user}
            theme={theme}
            toggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          />
        </ErrorBoundary>
      )}
      <CustomCursor />
    </div>
  )
}
