import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AuthService } from '../services/authService'
import Logo from '../components/Logo'

export default function RegisterPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const initialEmail = location.state?.email || ''

    const [email, setEmail] = useState(initialEmail)
    const [name, setName] = useState('')
    const [year, setYear] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isEmailSent, setIsEmailSent] = useState(false)

    useEffect(() => {
        if (!initialEmail) {
            navigate('/login')
        }
    }, [initialEmail, navigate])

    const handleRegister = async (e) => {
        e.preventDefault()
        setError('')

        if (!name.trim() || !password.trim() || !year.trim()) {
            setError('ALL FIELDS REQUIRED')
            return
        }

        setIsLoading(true)
        try {
            const data = await AuthService.register(name, email, password, year)
            setIsEmailSent(true)
        } catch (err) {
            setError(err.message.toUpperCase())
        } finally {
            setIsLoading(false)
        }
    }

    if (isEmailSent) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[var(--bg)]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-sm text-center space-y-6"
                >
                    <div className="space-y-2">
                        <p className="font-mono text-[9px] tracking-[0.3em] uppercase opacity-40">Registration Pending</p>
                        <h1 className="text-2xl font-bold tracking-tight uppercase">Verify Email</h1>
                    </div>

                    <div className="p-8 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm space-y-4">
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-6 h-6 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-white/60">Verification Link Sent</p>
                        <p className="font-mono text-[9px] text-white/30 leading-relaxed uppercase">
                            We've sent a secure link to <span className="text-white/60">{email}</span>. Click the link to complete your initialization.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="block w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg font-mono text-[9px] uppercase tracking-widest transition-all"
                        >
                            Return to Login
                        </button>
                    </div>
                </motion.div>
            </div>
        )
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

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-4">
                        <label className="font-mono text-[9px] uppercase tracking-widest opacity-30 block -mb-2">Account Setup</label>
                        
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-white/30 transition-all font-mono"
                            value={name}
                            onChange={(e) => { setName(e.target.value); setError(''); }}
                        />

                        <select
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-white/30 transition-all appearance-none font-mono"
                            value={year}
                            onChange={(e) => { setYear(e.target.value); setError(''); }}
                            style={{ color: year ? 'white' : 'rgba(255,255,255,0.3)' }}
                        >
                            <option value="" disabled>Select Year</option>
                            <option value="1">Year 1</option>
                            <option value="2">Year 2</option>
                            <option value="3">Year 3</option>
                            <option value="4">Year 4</option>
                        </select>

                        <input
                            type="password"
                            placeholder="Create Password"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-white/30 transition-all font-mono"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        />
                    </div>

                    <button
                        disabled={isLoading}
                        className="w-full py-3 bg-white text-black font-bold text-[10px] uppercase tracking-widest rounded-lg hover:invert transition-all disabled:opacity-50"
                    >
                        {isLoading ? 'Initializing...' : 'Complete Registration'}
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="w-full py-2 font-mono text-[9px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors"
                    >
                        Back to Login
                    </button>
                </form>

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
