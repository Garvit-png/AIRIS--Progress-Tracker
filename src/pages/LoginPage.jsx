import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AuthService } from '../services/authService'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [step, setStep] = useState('email') // email, password
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    
    const navigate = useNavigate()
    const location = useLocation()
    const from = location.state?.from?.pathname || "/dashboard"

    const handleEmailSubmit = async (e) => {
        e.preventDefault()
        setError('')
        if (!email.trim()) return

        setIsLoading(true)
        const isApproved = await AuthService.isEmailApproved(email)
        setIsLoading(false)

        if (isApproved) {
            if (AuthService.isPasswordSet(email)) {
                setStep('password')
            } else {
                // Redirect to registration if email is approved but not registered
                navigate('/register', { state: { email } })
            }
        } else {
            setError('ACCESS DENIED: IDENTITY NOT AUTHORIZED')
        }
    }

    const handlePasswordSubmit = (e) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        // Simulate network delay
        setTimeout(() => {
            if (AuthService.verifyPassword(email, password)) {
                AuthService.setSession(email)
                navigate(from, { replace: true })
            } else {
                setError('INVALID CREDENTIALS')
                setIsLoading(false)
            }
        }, 800)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[var(--bg)]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm"
            >
                <div className="mb-8 space-y-2 text-center">
                    <p className="font-mono text-[9px] tracking-[0.3em] uppercase opacity-40">System Restricted Access</p>
                    <h1 className="text-2xl font-bold tracking-tight">AIRIS TERMINAL</h1>
                </div>

                {step === 'email' ? (
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                        <div>
                            <label className="font-mono text-[9px] uppercase tracking-widest opacity-30 mb-1.5 block">Approved Identifier</label>
                            <input
                                type="email"
                                autoFocus
                                placeholder="Enter your email"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-white/30 transition-all font-mono"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                            />
                            <p className="mt-2 font-mono text-[8px] opacity-20 uppercase text-center">
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
                            <label className="font-mono text-[9px] uppercase tracking-widest opacity-30">Identity Verification</label>
                            <button
                                type="button"
                                onClick={() => setStep('email')}
                                className="font-mono text-[8px] uppercase opacity-40 hover:opacity-100"
                            >
                                Change Email
                            </button>
                        </div>
                        <p className="text-center font-mono text-[10px] text-white/60 mb-2">
                            Welcome back, {AuthService.getUserData(email)?.name}.
                        </p>
                        <input
                            type="password"
                            autoFocus
                            placeholder="Password"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-white/30 transition-all font-mono"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        />
                        <button
                            disabled={isLoading}
                            className="w-full py-3 bg-white text-black font-bold text-[10px] uppercase tracking-widest rounded-lg hover:invert transition-all disabled:opacity-50"
                        >
                            {isLoading ? 'Processing...' : 'Access System'}
                        </button>
                    </form>
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
