import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthService } from '../services/authService'
import { GoogleLogin } from '@react-oauth/google'
import Logo from '../components/Logo'

export default function LoginPage() {
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const navigate = useNavigate()
    const location = useLocation()
    const from = location.state?.from?.pathname || '/dashboard'

    // Already logged in → go straight to dashboard
    React.useEffect(() => {
        const user = AuthService.getSession()
        const token = AuthService.getToken()
        if (user && token) navigate(from, { replace: true })
    }, [from, navigate])

    const handleGoogleSuccess = async (credentialResponse) => {
        setError('')

        // Client-side domain check for instant feedback (backend enforces this too)
        try {
            const payload = JSON.parse(atob(credentialResponse.credential.split('.')[1]))
            if (!payload.email?.endsWith('@nst.rishihood.edu.in')) {
                setError('USE YOUR @NST.RISHIHOOD.EDU.IN COLLEGE ACCOUNT')
                return
            }
        } catch {
            // decode failed — let backend decide
        }

        setIsLoading(true)
        try {
            await AuthService.googleLogin(credentialResponse.credential)
            navigate(from, { replace: true })
        } catch (err) {
            setError(err.message.toUpperCase())
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleError = () => {
        setError(`GOOGLE AUTH FAILED — ADD "${window.location.origin}" TO GOOGLE CONSOLE ORIGINS`)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[var(--bg)]">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-xs flex flex-col items-center gap-10"
            >
                {/* Logo */}
                <div className="text-center">
                    <Logo size="lg" />
                </div>

                {/* Tagline */}
                <div className="text-center space-y-1">
                    <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-white/40">
                        NSTRU · AI/ML Club
                    </p>
                    <p className="font-mono text-[8px] uppercase tracking-widest text-white/20">
                        @nst.rishihood.edu.in accounts only
                    </p>
                </div>

                {/* Google Sign-In */}
                <div className="w-full flex flex-col items-center gap-4">
                    {isLoading ? (
                        <div className="flex items-center gap-2 py-3">
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
                            <span className="font-mono text-[9px] uppercase tracking-widest text-white/50">
                                Authenticating...
                            </span>
                        </div>
                    ) : (
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            theme="filled_black"
                            shape="pill"
                            size="large"
                            width="280"
                            text="signin_with"
                        />
                    )}
                </div>

                {/* Error */}
                <AnimatePresence>
                    {error && (
                        <motion.p
                            key="err"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-center font-mono text-[9px] text-red-400 uppercase tracking-widest leading-relaxed"
                        >
                            {error}
                        </motion.p>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}
