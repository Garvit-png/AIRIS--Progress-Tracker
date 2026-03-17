import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthService } from '../services/authService'

export default function LoginGate({ onLogin }) {
    const [step, setStep] = useState('email') // email, password, setup
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [year, setYear] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleEmailSubmit = (e) => {
        e.preventDefault()
        setError('')
        if (!email.trim()) return

        if (AuthService.isEmailApproved(email)) {
            if (AuthService.isPasswordSet(email)) {
                setStep('password')
            } else {
                setStep('setup')
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
            if (step === 'setup') {
                if (!name.trim() || !password.trim() || !year.trim()) {
                    setError('ALL FIELDS REQUIRED')
                    setIsLoading(false)
                    return
                }
                AuthService.registerUser(email, { password, name, year })
                AuthService.setSession(email)
                onLogin(AuthService.getUserData(email))
            } else {
                if (AuthService.verifyPassword(email, password)) {
                    AuthService.setSession(email)
                    onLogin(AuthService.getUserData(email))
                } else {
                    setError('INVALID CREDENTIALS')
                    setIsLoading(false)
                }
            }
        }, 800)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[var(--bg)]">
            {/* Top Left Logo */}
            <div className="fixed top-8 left-8 z-[70]">
                <motion.img 
                    src="/logo.png" 
                    alt="AIRIS Logo" 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="h-16 w-auto object-contain"
                    style={{ mixBlendMode: 'screen' }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm"
            >
                <div className="mb-8 space-y-2 text-center">
                    <p className="font-mono text-[9px] tracking-[0.3em] uppercase opacity-40">System Restricted Access</p>
                    <h1 className="text-2xl font-bold tracking-tight">AIRIS TERMINAL</h1>
                </div>

                <AnimatePresence mode="wait">
                    {step === 'email' ? (
                        <motion.form
                            key="email"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            onSubmit={handleEmailSubmit}
                            className="space-y-4"
                        >
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
                                <p className="mt-2 font-mono text-[8px] opacity-20 uppercase">Testing: admin@airis.tech or garvitgandhi0313@gmail.com</p>
                            </div>
                            <button className="w-full py-3 bg-white text-black font-bold text-[10px] uppercase tracking-widest rounded-lg hover:invert transition-all">
                                Verify Identity
                            </button>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="password"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            onSubmit={handlePasswordSubmit}
                            className="space-y-4"
                        >
                            <div className="space-y-4">
                                <div className="flex justify-between items-baseline mb-1.5">
                                    <label className="font-mono text-[9px] uppercase tracking-widest opacity-30">
                                        {step === 'setup' ? 'Create Your Account' : 'Identity Verification'}
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setStep('email')}
                                        className="font-mono text-[8px] uppercase opacity-40 hover:opacity-100"
                                    >
                                        Change Email
                                    </button>
                                </div>

                                {step === 'password' && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center font-mono text-[10px] text-white/60 mb-2"
                                    >
                                        Welcome back, {AuthService.getUserData(email)?.name}.
                                    </motion.p>
                                )}

                                {step === 'setup' && (
                                    <>
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-white/30 transition-all"
                                            value={name}
                                            onChange={(e) => { setName(e.target.value); setError(''); }}
                                        />
                                        <select
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-white/30 transition-all appearance-none"
                                            value={year}
                                            onChange={(e) => { setYear(e.target.value); setError(''); }}
                                            style={{ color: year ? 'var(--text)' : 'rgba(255,255,255,0.3)' }}
                                        >
                                            <option value="" disabled>Select Year</option>
                                            <option value="1">Year 1</option>
                                            <option value="2">Year 2</option>
                                            <option value="3">Year 3</option>
                                            <option value="4">Year 4</option>
                                        </select>
                                    </>
                                )}

                                <input
                                    type="password"
                                    autoFocus
                                    placeholder={step === 'setup' ? "Create Password" : "Password"}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-white/30 transition-all"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                />
                            </div>
                            <button
                                disabled={isLoading}
                                className="w-full py-3 bg-white text-black font-bold text-[10px] uppercase tracking-widest rounded-lg hover:invert transition-all disabled:opacity-50"
                            >
                                {isLoading ? 'Processing...' : step === 'setup' ? 'Initialize Profile' : 'Access System'}
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>

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
