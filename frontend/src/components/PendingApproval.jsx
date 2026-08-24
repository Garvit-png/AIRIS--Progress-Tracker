import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AuthService } from '../services/authService'
import Logo from './Logo'

export default function PendingApproval() {
    const user = AuthService.getSession()
    const navigate = useNavigate()
    const [isChecking, setIsChecking] = React.useState(false)

    const checkStatus = async () => {
        setIsChecking(true)
        try {
            const data = await AuthService.getMe()
            if (data.status === 'approved') {
                // Update local storage
                localStorage.setItem('current_user', JSON.stringify(data))
                window.location.href = '/dashboard'
            }
        } catch (err) {
            console.error('Status check failed:', err)
        } finally {
            setIsChecking(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm text-center space-y-10"
            >
                <Logo size="lg" />

                <div className="space-y-4">
                    <h1 className="text-xl font-bold uppercase tracking-[0.2em] text-white">Approval Sent</h1>
                    <p className="font-mono text-[10px] text-white/40 leading-relaxed uppercase max-w-[240px] mx-auto">
                        Hi {user?.name?.split(' ')[0] || 'Operator'}, your access request is pending. 
                        Once approved, you'll be able to enter the workspace.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <button
                        onClick={checkStatus}
                        disabled={isChecking}
                        className="w-full py-4 bg-white text-black font-bold text-[10px] uppercase tracking-[0.3em] rounded-xl hover:invert transition-all disabled:opacity-50"
                    >
                        {isChecking ? 'Verifying...' : 'Check Status'}
                    </button>

                    <button
                        onClick={() => AuthService.logout()}
                        className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30 hover:text-white transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
