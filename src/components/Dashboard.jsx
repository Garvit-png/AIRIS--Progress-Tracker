import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import TaskCards from './panels/TaskCards'
import StatPanel from './panels/StatPanel'
import Timeline from './panels/Timeline'
import SkillPanel from './panels/SkillPanel'
import ActivityLog from './panels/ActivityLog'
import { AuthService } from '../services/authService'

export default function Dashboard({ user, theme, toggleTheme }) {
    const [headerVisible, setHeaderVisible] = useState(false)
    const [activeView, setActiveView] = useState('Dashboard')

    React.useEffect(() => {
        setTimeout(() => setHeaderVisible(true), 80)
    }, [])

    const handleLogout = () => {
        AuthService.logout()
        window.location.reload()
    }

    function renderView() {
        if (activeView === 'Settings') {
            return (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl p-6 text-sm" style={{ backgroundColor: 'var(--panel-bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                    <p className="font-mono text-[9px] tracking-widest uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Configuration</p>
                    <h2 className="text-base font-semibold mb-4">Account Settings</h2>
                    <div className="space-y-4">
                        <div className="py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                            <p className="text-[10px] opacity-40 uppercase mb-1">Authenticated As</p>
                            <p className="font-mono text-sm">{user?.email}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full py-3 border border-red-500/30 text-red-500 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/5 transition-all"
                        >
                            Log Out / Terminate Session
                        </button>
                    </div>
                </motion.div>
            )
        }

        // Default: Pure local dashboard without GitHub dependency
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
                <div className="col-span-1 lg:col-span-2">
                    <TaskCards />
                </div>
                <div className="col-span-1">
                    <StatPanel stats={{ streak: 12, ranking: '92nd' }} />
                </div>
                <div className="col-span-1">
                    <Timeline />
                </div>
                <div className="col-span-1">
                    <SkillPanel />
                </div>
                <div className="col-span-1 md:col-span-1 lg:col-span-1">
                    <ActivityLog events={[]} />
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-full w-full overflow-hidden transition-colors duration-500" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
            <Sidebar activeView={activeView} setActiveView={setActiveView} />

            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <motion.header
                    initial={{ opacity: 0, y: -12 }}
                    animate={headerVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center justify-between px-4 sm:px-6 py-0 h-[60px] min-h-[60px] border-b backdrop-blur-sm transition-colors duration-500 flex-shrink-0"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(var(--bg-rgb), 0.6)' }}
                >
                    <div className="flex items-baseline gap-2 min-w-0">
                        <h1 className="text-sm font-semibold tracking-widest uppercase truncate" style={{ color: 'var(--text)' }}>{activeView}</h1>
                        <span className="font-mono text-[10px] hidden sm:inline" style={{ color: 'var(--text-muted)' }}>/ {user?.email.split('@')[0]}</span>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full border hover:scale-110 active:scale-95 transition-all duration-300"
                            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                        >
                            {theme === 'dark' ? (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
                            )}
                        </button>

                        <div className="flex items-center gap-3 pl-3 border-l" style={{ borderColor: 'var(--border)' }}>
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] font-bold uppercase leading-none">{user?.email.split('@')[0]}</p>
                                <p className="text-[9px] font-mono uppercase mt-0.5 opacity-40">System Access</p>
                            </div>
                            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center font-bold text-[10px] bg-white/5 uppercase">
                                {user?.email[0]}
                            </div>
                        </div>
                    </div>
                </motion.header>

                <div className="flex-1 overflow-y-auto p-3 sm:p-5 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeView}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, position: 'absolute' }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                            className="w-full"
                        >
                            {renderView()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
