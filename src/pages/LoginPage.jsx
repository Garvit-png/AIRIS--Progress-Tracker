import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AuthService } from '../services/authService'
import Logo from '../components/Logo'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [step, setStep] = useState('email') // email, password
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [userData, setUserData] = useState(null)
    const [resetSent, setResetSent] = useState(false)
    const [forgotMode, setForgotMode] = useState(false)
    
    const navigate = useNavigate()
    const location = useLocation()
    const from = location.state?.from?.pathname || "/dashboard"
    const user = AuthService.getSession()
    const token = AuthService.getToken()

    React.useEffect(() => {
        if (user && token) {
            navigate(from, { replace: true })
        }
    }, [user, token, navigate, from])

    const handleEmailSubmit = async (e) => {
        e.preventDefault()
        setError('')
        if (!email.trim()) return

        // We jump straight to password entry or Google login. 
        // Real validation now happens on the backend during the main handshake.
        setStep('password')
    }

    const handlePasswordSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            const data = await AuthService.login(email, password)
            navigate(from, { replace: true })
        } catch (err) {
            const message = err.message.toUpperCase()
            if (message.includes('PENDING APPROVAL')) {
                setError('ACCOUNT PENDING ADMIN APPROVAL')
            } else if (message.includes('NOT FOUND') || message.includes('INVALID')) {
                setError('INVALID CREDENTIALS')
            } else {
                setError(message)
            }
        } finally {
            setIsLoading(false)
        }
    }

// handleGoogleSuccess removed

    const handleForgotPassword = async (e) => {
        e.preventDefault()
        if (!email) {
            setError('EMAIL REQUIRED FOR RESET')
            return
        }
        setIsLoading(true)
        try {
            await AuthService.forgotPassword(email)
            setResetSent(true)
        } catch (err) {
            setError(err.message.toUpperCase())
        } finally {
            setIsLoading(false)
        }
    }

    const handleNewIdentity = () => {
        navigate('/register', { state: { email } })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[var(--bg)]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm"
            >
                <div className="mb-10 text-center">
                    <Logo size="md" />
                </div>

                {step === 'email' ? (
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                        <div>
                            <label className="font-mono text-[9px] uppercase tracking-widest opacity-70 mb-1.5 block">Approved Identifier</label>
                            <input
                                type="email"
                                autoFocus
                                placeholder="Enter your email"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-white/30 transition-all font-mono"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                            />
                            <p className="mt-2 font-mono text-[8px] opacity-60 uppercase text-center">
                                Use an approved email to proceed
                            </p>
                        </div>
                        <button 
                            disabled={isLoading}
                            className="w-full py-3 bg-white text-black font-bold text-[10px] uppercase tracking-widest rounded-lg hover:invert transition-all disabled:opacity-50"
                        >
                            {isLoading ? 'Verifying...' : 'Verify Identity'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div className="flex justify-between items-baseline mb-1.5">
                            <label className="font-mono text-[9px] uppercase tracking-widest opacity-70">Identity Verification</label>
                            <button
                                type="button"
                                onClick={() => setStep('email')}
                                className="font-mono text-[8px] uppercase opacity-80 hover:opacity-100"
                            >
                                Change Email
                            </button>
                        </div>
                        <p className="text-center font-mono text-[10px] text-white/90 mb-2">
                            Welcome, {email}
                        </p>
                        <input
                            type="password"
                            autoFocus
                            placeholder="Password"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-white/30 transition-all font-mono"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        />
                        <div className="space-y-2">
                            <button
                                disabled={isLoading}
                                className="w-full py-3 bg-white text-black font-bold text-[10px] uppercase tracking-widest rounded-lg hover:invert transition-all disabled:opacity-50"
                            >
                                {isLoading ? 'Processing...' : 'Access System'}
                            </button>
                            
                            <button
                                type="button"
                                onClick={handleNewIdentity}
                                className="w-full py-2 font-mono text-[9px] uppercase tracking-[0.2em] text-white/80 hover:text-white transition-colors"
                            >
                                No password? Register here
                            </button>
                        </div>
                    </form>
                )}

                {forgotMode ? (
                    <div className="mt-8 pt-8 border-t border-white/5 text-center transition-all">
                        {resetSent ? (
                            <p className="font-mono text-[9px] text-green-500 uppercase tracking-widest">
                                Reset link sent to your inbox
                            </p>
                        ) : (
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                disabled={isLoading}
                                className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/80 hover:text-white transition-colors"
                            >
                                {isLoading ? 'Sending...' : 'Request Password Reset'}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => { setForgotMode(false); setResetSent(false); }}
                            className="block w-full mt-4 font-mono text-[8px] uppercase opacity-20 hover:opacity-100"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                        <button
                            type="button"
                            onClick={() => setForgotMode(true)}
                            className="w-full font-mono text-[9px] uppercase tracking-[0.2em] text-white/80 hover:text-white transition-colors"
                        >
                            Forgot Password?
                        </button>
                        
                    </div>
                )}

                {error && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-6 text-center font-mono text-[9px] text-red-500 uppercase tracking-widest"
                    >
                        {error}
                    </motion.p>
                )}
            </motion.div>
        </div>
    )
}
