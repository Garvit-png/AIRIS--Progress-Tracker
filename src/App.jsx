import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import LoaderScreen from './components/LoaderScreen'
import Dashboard from './components/Dashboard'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProtectedRoute from './components/ProtectedRoute'

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
  
  useEffect(() => {
    // Force permanent dark mode
    document.documentElement.setAttribute('data-theme', 'dark')
  }, [])

  if (phase === 'loading') {
    const sessionUser = AuthService.getSession()
    return <LoaderScreen onComplete={() => setPhase('app')} user={sessionUser} />
  }

  return (
    <Router>
      <div
        className={`w-full h-full text-white overflow-hidden relative transition-colors duration-500`}
        style={{ background: 'var(--bg)', color: 'var(--text)' }}
      >
        <ErrorBoundary>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardWrapper />
                </ProtectedRoute>
              } 
            />
            {/* Redirect root to dashboard (which will redirect to login if needed) */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            {/* Catch all redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </Router>
  )
}

function DashboardWrapper() {
  const user = AuthService.getSession()
  return <Dashboard user={user} />
}
