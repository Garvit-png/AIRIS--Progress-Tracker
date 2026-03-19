import React from 'react'
import { motion } from 'framer-motion'
import { AuthService } from '../services/authService'
import Logo from './Logo'

export default function PendingApproval() {
    const user = AuthService.getSession()

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md text-center space-y-8"
            >
                <div className="mb-4 flex justify-center">
                    <Logo size="md" />
                </div>

                <div className="space-y-4">
                    <div className="inline-block px-3 py-1 rounded-full border border-pink-500/30 bg-pink-500/5 mb-2">
                        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-pink-400">Account Restricted</p>
                    </div>
                    
                    <h1 className="text-xl font-bold uppercase tracking-tight text-white mb-2">Identity Verification in Progress</h1>
                    
                    <div className="space-y-1 py-4">
                        <p className="font-mono text-[11px] uppercase tracking-widest text-white/40 animate-pulse">request pending</p>
                        <p className="font-mono text-[13px] uppercase tracking-[0.3em] text-white/60 animate-pulse" style={{ animationDelay: '0.2s' }}>request pending</p>
                        <p className="font-mono text-[11px] uppercase tracking-widest text-white/40 animate-pulse" style={{ animationDelay: '0.4s' }}>request pending</p>
                    </div>

                    <p className="font-mono text-[9px] text-white/50 leading-relaxed uppercase max-w-[280px] mx-auto mt-4">
                        Hello, <span className="text-white/90">{user?.name}</span>. Your registration has been received. 
                        A system administrator will verify your credentials shortly.
                    </p>
                </div>

                <div className="pt-8 space-y-4">
                    <button
                        onClick={() => AuthService.logout()}
                        className="px-8 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-mono text-[9px] uppercase tracking-widest transition-all"
                    >
                        Sign Out
                    </button>
                    
                    <p className="font-mono text-[8px] opacity-30 uppercase">
                        Access will be granted automatically upon approval
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
