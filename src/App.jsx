import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import config from './config'
import { AuthService } from './services/authService'

// Essential Components
import LoaderScreen from './components/LoaderScreen'
import ProtectedRoute from './components/ProtectedRoute'
import SecurityShield from './components/SecurityShield'

// Route-level Code Splitting for performance
const Dashboard = React.lazy(() => import('./components/Dashboard'))
const LoginPage = React.lazy(() => import('./pages/LoginPage'))
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'))
const AdminPanel = React.lazy(() => import('./pages/AdminPanel'))
const EmailVerification = React.lazy(() => import('./pages/EmailVerification'))
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'))
const ProjectPage = React.lazy(() => import('./pages/ProjectPage'))
const PendingApproval = React.lazy(() => import('./components/PendingApproval'))
const SkeletonDashboard = React.lazy(() => import('./components/SkeletonDashboard'))

// Admin route protector
function AdminRoute({ children }) {
  const user = AuthService.getSession()
  const hasAccess = user?.isAdmin || user?.role?.toLowerCase() === 'admin'
  if (!hasAccess) return <Navigate to="/dashboard" replace />
  return children
}

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
        <div className="p-4 border border-pink-500/50 rounded bg-pink-500/5">
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
  const [isVerifying, setIsVerifying] = useState(true)
    useEffect(() => {
        // Force permanent dark mode
        document.documentElement.setAttribute('data-theme', 'dark')

        const checkAuth = async () => {
            // Background Warmup: Wake up the backend immediately (especially useful on Render free tier)
            fetch(`${config.API_BASE_URL}/auth/me`).catch(() => {});

            const token = AuthService.getToken()
            const sessionUser = AuthService.getSession()

            // FAST-PATH: If we have a local session, show the UI immediately.
            // Verification will happen in the background.
            if (token && sessionUser) {
                setIsVerifying(false);
            }

            if (token) {
                try {
                    const user = await AuthService.getCurrentUser()
                    if (!user) {
                        AuthService.logout()
                    }
                } catch (err) {
                    AuthService.logout()
                }
            }
            
            // Final check for new users (who don't have a fast-path session)
            setIsVerifying(false)
        }

        checkAuth()

    // Single Tab Enforcement: Listen for redirect requests from other tabs
    const channel = new BroadcastChannel('airis_auth_channel');
    channel.onmessage = (event) => {
      if (event.data.type === 'CHECK_EXISTING_TAB') {
        channel.postMessage({ type: 'TAB_EXISTS' });
      } else if (event.data.type === 'REDIRECT_TO_RESET') {
        // Redirection logic
        window.focus();
        window.location.href = `/reset-password/${event.data.token}`;
      }
    };

    return () => channel.close();
  }, [])

  const handleLoaderComplete = React.useCallback(() => {
    setPhase('app')
  }, [])

  const sessionUser = AuthService.getSession()

  if (phase === 'loading') {
    return <LoaderScreen onComplete={handleLoaderComplete} user={sessionUser} />
  }

  // Optimistic entry: if we have a session, show the app while verifying in background
  if (isVerifying && !sessionUser) {
    return <SkeletonDashboard />
  }

  return (
    <GoogleOAuthProvider clientId={config.GOOGLE_CLIENT_ID}>
      <SecurityShield>
        <Router>
          <div
            className={`w-full h-full text-white overflow-hidden relative transition-colors duration-500`}
            style={{ background: 'var(--bg)', color: 'var(--text)' }}
          >
            <ErrorBoundary>
              <React.Suspense fallback={<SkeletonDashboard />}>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/verify-email/:token" element={<EmailVerification />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  <Route path="/pending" element={<PendingApproval />} />
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <DashboardWrapper />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/project/:id" 
                    element={
                      <ProtectedRoute>
                        <ProjectPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute>
                        <AdminRoute>
                          <AdminPanel />
                        </AdminRoute>
                      </ProtectedRoute>
                    } 
                  />
                  {/* Redirect root to dashboard (which will redirect to login if needed) */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  {/* Catch all redirect to dashboard */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </React.Suspense>
            </ErrorBoundary>
          </div>
        </Router>
      </SecurityShield>
    </GoogleOAuthProvider>
  )
}

function DashboardWrapper() {
  const user = AuthService.getSession()
  return <Dashboard user={user} />
}
