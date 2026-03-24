import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AuthService } from '../services/authService'

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
        label: 'Chat',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
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

export default function Sidebar({ user, activeView, setActiveView, isPortalUnlocked, onProfileClick }) {
    const [collapsed, setCollapsed] = useState(false)
    const [sidebarWidth, setSidebarWidth] = useState(260)
    const [isResizing, setIsResizing] = useState(false)
    const sidebarRef = useRef(null)
    const navigate = useNavigate()

    const startResizing = useCallback((e) => {
        setIsResizing(true)
    }, [])

    const stopResizing = useCallback(() => {
        setIsResizing(false)
    }, [])

    const resize = useCallback((e) => {
        if (isResizing) {
            const newWidth = e.clientX
            if (newWidth > 200 && newWidth < 500) {
                setSidebarWidth(newWidth)
                if (collapsed && newWidth > 220) setCollapsed(false)
            }
        }
    }, [isResizing, collapsed])

    useEffect(() => {
        window.addEventListener('mousemove', resize)
        window.addEventListener('mouseup', stopResizing)
        return () => {
            window.removeEventListener('mousemove', resize)
            window.removeEventListener('mouseup', stopResizing)
        }
    }, [resize, stopResizing])

    // Helper for avatar initials
    const initials = user?.name 
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() 
        : user?.email ? user.email[0].toUpperCase() : '??';

    const handleLogout = () => {
        AuthService.logout()
        navigate('/login', { replace: true })
    }

    return (
        <motion.aside
            ref={sidebarRef}
            animate={{ width: collapsed ? 90 : sidebarWidth }}
            transition={isResizing ? { duration: 0 } : { duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="h-full flex flex-col border-r overflow-hidden flex-shrink-0 relative z-10 transition-colors duration-500 select-none"
            style={{
                backgroundColor: 'var(--sidebar-bg)',
                borderColor: 'var(--border)',
                color: 'var(--text)'
            }}
        >
            {/* Resize Handle */}
            <div
                onMouseDown={startResizing}
                className={`absolute right-0 top-0 bottom-0 w-1 cursor-col-resize z-50 transition-colors ${isResizing ? 'bg-pink-500/50' : 'hover:bg-pink-500/20'}`}
            />

            {/* Profile Header (Top Left) */}
            <div className={`flex items-center gap-3 ${collapsed ? 'px-3' : 'px-4'} py-6 border-b min-h-[85px] transition-all duration-500`} style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onProfileClick}
                        className="w-10 h-10 rounded-2xl border border-pink-500/20 flex items-center justify-center font-bold text-xs bg-white/5 uppercase overflow-hidden flex-shrink-0 shadow-lg shadow-pink-500/5"
                    >
                        {user?.profilePicture ? (
                            <img src={user.profilePicture} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            <span style={{ color: 'var(--text)' }}>{initials}</span>
                        )}
                    </motion.button>
                    
                    <AnimatePresence mode="wait">
                        {!collapsed && (
                            <motion.div 
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="flex flex-col items-start min-w-0 overflow-hidden whitespace-nowrap"
                            >
                                <p className="text-sm font-bold truncate tracking-tight w-full">{user?.name || user?.email.split('@')[0]}</p>
                                <p 
                                    className="text-[9px] font-mono uppercase tracking-[0.2em] truncate"
                                    style={{ 
                                        color: (user?.isAdmin || user?.role?.toLowerCase() === 'admin') ? '#FF0D99' : 'var(--text)',
                                        opacity: (user?.isAdmin || user?.role?.toLowerCase() === 'admin') ? 1 : 0.7 
                                    }}
                                >
                                    {user?.role || 'Member'}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1 rounded-lg hover:bg-white/10 transition-all text-white/90 hover:text-white"
                    title={collapsed ? "Expand" : "Collapse"}
                >
                    <svg 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2.5" 
                        className={`w-4 h-4 transition-transform duration-500 ${collapsed ? 'rotate-180' : ''}`}
                    >
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto custom-scrollbar">
                {NAV.map(item => (
                    <button
                        key={item.label}
                        onClick={() => setActiveView(item.label)}
                        className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-left transition-all duration-150 group relative border shadow-lg shadow-pink-500/0 hover:shadow-pink-500/5 ${activeView === item.label
                                ? 'bg-white/[0.08] border-white/20'
                                : 'bg-transparent border-transparent hover:bg-white/[0.04] hover:border-white/10'
                            }`}
                        style={{ color: 'var(--text)' }}
                    >
                        <span className="flex-shrink-0">{item.icon}</span>
                        <AnimatePresence mode="wait">
                            {!collapsed && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-sm font-medium overflow-hidden whitespace-nowrap"
                                >
                                    {item.label}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                ))}

                {/* Admin Specific */}
                {(user?.isAdmin || user?.role?.toLowerCase() === 'admin') && (
                    <div className="pt-4 mt-4 border-t border-pink-500/20">
                        {!collapsed && (
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.85 }}
                                className="px-4 mb-2 font-mono text-[8px] uppercase tracking-[0.3em]"
                            >
                                System Admin
                            </motion.p>
                        )}
                        
                        {!isPortalUnlocked ? (
                            <button
                                onClick={() => setActiveView('Approvals')}
                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-300 group relative border shadow-[0_0_20px_rgba(255,13,153,0.15)] hover:shadow-[0_0_25px_rgba(255,13,153,0.3)] ${
                                    activeView === 'Approvals'
                                    ? 'bg-[#FF0D99] border-[#FF0D99] text-white'
                                    : 'bg-[#FF0D99]/10 border-[#FF0D99]/30 text-[#FF0D99] hover:bg-[#FF0D99] hover:text-white'
                                }`}
                            >
                                <span className="flex-shrink-0">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </span>
                                <AnimatePresence mode="wait">
                                    {!collapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: 'auto' }}
                                            exit={{ opacity: 0, width: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="text-xs font-black uppercase tracking-widest overflow-hidden whitespace-nowrap"
                                        >
                                            Admin Portal
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </button>
                        ) : (
                            <div className="space-y-1">
                                <button
                                    onClick={() => setActiveView('Approvals')}
                                    className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-left transition-all duration-150 group relative border shadow-lg shadow-pink-500/0 hover:shadow-pink-500/5 ${activeView === 'Approvals'
                                            ? 'bg-pink-500/[0.08] border-pink-500/30'
                                            : 'bg-transparent border-transparent hover:bg-pink-500/[0.04] hover:border-pink-500/20'
                                        }`}
                                    style={{ 
                                        color: '#FF0D99', 
                                        opacity: activeView === 'Approvals' ? 1 : 0.6 
                                    }}
                                >
                                    <span className="flex-shrink-0">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                                            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                                            <path d="m9 14 2 2 4-4" />
                                        </svg>
                                    </span>
                                    <AnimatePresence mode="wait">
                                        {!collapsed && (
                                            <motion.span
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: 'auto' }}
                                                exit={{ opacity: 0, width: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="text-sm font-medium overflow-hidden whitespace-nowrap"
                                            >
                                                Approvals
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </button>
                                <button
                                    onClick={() => setActiveView('Members')}
                                    className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-left transition-all duration-150 group relative border shadow-lg shadow-pink-500/0 hover:shadow-pink-500/5 ${activeView === 'Members'
                                            ? 'bg-pink-500/[0.08] border-pink-500/30'
                                            : 'bg-transparent border-transparent hover:bg-pink-500/[0.04] hover:border-pink-500/20'
                                        }`}
                                    style={{ 
                                        color: '#FF0D99', 
                                        opacity: activeView === 'Members' ? 1 : 0.6 
                                    }}
                                >
                                    <span className="flex-shrink-0">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                        </svg>
                                    </span>
                                    <AnimatePresence mode="wait">
                                        {!collapsed && (
                                            <motion.span
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: 'auto' }}
                                                exit={{ opacity: 0, width: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="text-sm font-medium overflow-hidden whitespace-nowrap"
                                            >
                                                Members
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </nav>

            {/* Logout Footer */}
            <div className="px-4 py-4 border-t flex items-center justify-center" style={{ borderColor: 'var(--border)' }}>
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-3 py-2 rounded-lg bg-red-500/5 border border-red-500/10 text-red-500/85 hover:text-red-500 hover:bg-red-500/10 transition-all text-[10px] font-bold uppercase tracking-widest"
                    title="Logout"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <AnimatePresence mode="wait">
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.2 }}
                                className="whitespace-nowrap overflow-hidden"
                            >
                                Session Exit
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </motion.aside>
    )
}
