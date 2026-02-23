import React, { useState } from 'react'
import { motion } from 'framer-motion'

const NAV = [
    {
        label: 'Dashboard',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
        ),
    },
    {
        label: 'GitHub',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
        ),
    },
    {
        label: 'Tasks',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
        ),
    },
    {
        label: 'Learning',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
        ),
    },
    {
        label: 'Analytics',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
            </svg>
        ),
    },
    {
        label: 'Settings',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
        ),
    },
]

export default function Sidebar({ activeView, setActiveView }) {
    const [collapsed, setCollapsed] = useState(false)

    return (
        <motion.aside
            animate={{ width: collapsed ? 64 : 220 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="h-full flex flex-col border-r overflow-hidden flex-shrink-0 relative z-10 transition-colors duration-500"
            style={{
                backgroundColor: 'var(--sidebar-bg)',
                borderColor: 'var(--border)',
                color: 'var(--text)'
            }}
        >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-4 border-b min-h-[60px]" style={{ borderColor: 'var(--border)' }}>
                <div className="w-7 h-7 rounded-full border flex items-center justify-center flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--text)' }} />
                </div>
                <motion.span
                    animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
                    transition={{ duration: 0.2 }}
                    className="font-semibold text-sm tracking-widest overflow-hidden whitespace-nowrap"
                >
                    AIRIS
                </motion.span>
                <button
                    onClick={() => setCollapsed(c => !c)}
                    className="ml-auto transition-colors flex-shrink-0 text-current opacity-30 hover:opacity-100"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                        {collapsed
                            ? <path d="M9 18l6-6-6-6" />
                            : <path d="M15 18l-6-6 6-6" />
                        }
                    </svg>
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
                {NAV.map(item => (
                    <button
                        key={item.label}
                        onClick={() => setActiveView(item.label)}
                        className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-left transition-all duration-150 group relative ${activeView === item.label
                                ? 'opacity-100'
                                : 'opacity-40 hover:opacity-80'
                            }`}
                        style={
                            activeView === item.label
                                ? {
                                    backgroundColor: 'rgba(255,255,255,0.08)',
                                    color: 'var(--text)',
                                    boxShadow: 'inset 2px 0 0 var(--text)'
                                }
                                : { color: 'var(--text)' }
                        }
                    >
                        <span className="flex-shrink-0">{item.icon}</span>
                        <motion.span
                            animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
                            transition={{ duration: 0.2 }}
                            className="text-sm font-medium overflow-hidden whitespace-nowrap"
                        >
                            {item.label}
                        </motion.span>
                    </button>
                ))}
            </nav>

            {/* User */}
            <div className="px-3 py-3 border-t flex items-center gap-3 min-h-[60px]" style={{ borderColor: 'var(--border)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}>
                    GG
                </div>
                <motion.div
                    animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden whitespace-nowrap"
                >
                    <p className="text-xs font-semibold">Garvit Gandhi</p>
                    <p className="text-[10px] font-mono opacity-35">Tech Lead</p>
                </motion.div>
            </div>
        </motion.aside>
    )
}
