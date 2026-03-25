import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AuthService } from '../services/authService'

const NAV = [
    {
        label: 'Dashboard',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
                <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
        ),
    },
    {
        label: 'GitHub',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
        ),
    },
    {
        label: 'Tasks',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
        ),
    },
    {
        label: 'Learning',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
            </svg>
        ),
    },
    {
        label: 'Analytics',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
        ),
    },
    {
        label: 'Chat',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
    },
]

export default function Sidebar({ user, activeView, setActiveView, isPortalUnlocked, onProfileClick }) {
    const [collapsed, setCollapsed] = useState(false)
    const [sidebarWidth, setSidebarWidth] = useState(210)
    const [isResizing, setIsResizing] = useState(false)
    const [isAdminExpanded, setIsAdminExpanded] = useState(false)
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
            className={`h-screen flex flex-col bg-[#050505] border-r border-white/5 overflow-hidden flex-shrink-0 relative z-10 select-none ${isResizing ? 'cursor-col-resize' : ''}`}
            style={{ width: sidebarWidth }}
        >
            {/* Drag Handle */}
            <div
                onMouseDown={startResizing}
                className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-pink-500/20 active:bg-pink-500/40 z-50 transition-colors"
            />

            {/* User Profile Section */}
            <div className="p-3">
                <button 
                    onClick={onProfileClick}
                    className="w-full flex items-center gap-2.5 p-1.5 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/[0.05] hover:border-white/10 transition-all group group/profile"
                >
                    <div className="w-8 h-8 rounded-lg bg-pink-500 flex items-center justify-center text-white font-bold text-[10px] shadow-lg shadow-pink-500/10 overflow-hidden group-hover/profile:scale-105 transition-transform shrink-0">
                        {user?.profilePicture ? (
                            <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            initials
                        )}
                    </div>
                    <div className="flex flex-col min-w-0 text-left">
                        <span className="text-white font-bold text-[11px] truncate leading-tight uppercase tracking-tight">{user?.name || user?.email.split('@')[0]}</span>
                        <span className="text-pink-500/60 text-[8px] font-black uppercase tracking-widest leading-none mt-0.5">{user?.role || 'Member'}</span>
                    </div>
                </button>
            </div>

            {/* Navigation List */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                {NAV.map((item) => (
                    <button
                        key={item.label}
                        onClick={() => setActiveView(item.label)}
                        className={`w-full group flex items-center gap-3 px-6 py-2.5 rounded-xl transition-all duration-300 ${
                          activeView === item.label 
                            ? 'bg-pink-500/10 text-pink-500 shadow-[0_4px_12px_rgba(255,45,120,0.1)] border border-pink-500/20'
                            : 'bg-transparent text-white/40 hover:text-white/80 hover:bg-white/[0.03]'
                        }`}
                    >
                        <span className={`${activeView === item.label ? 'text-pink-500' : 'text-white/40 group-hover:text-white/60'} transition-colors`}>
                            {item.icon}
                        </span>
                        <span className="text-sm font-bold tracking-tight">{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Bottom Section - Pinned to absolute footer */}
            <div className="mt-auto pb-6 space-y-2">
                <div className="px-4 space-y-2">
                    {/* Settings */}
                    <button
                        onClick={() => setActiveView('Settings')}
                        className={`w-full group flex items-center gap-3 px-6 py-2.5 rounded-xl transition-all duration-300 ${
                            activeView === 'Settings'
                            ? 'bg-pink-500/10 text-pink-500 border border-pink-500/20 shadow-[0_4px_12px_rgba(255,45,120,0.1)]'
                            : 'bg-white/[0.02] text-white/40 border border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                        }`}
                    >
                        <span className={`${activeView === 'Settings' ? 'text-pink-500' : 'text-white/40 group-hover:text-white/60'} transition-colors`}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </span>
                        <span className="text-[11px] font-bold tracking-tight">Settings</span>
                    </button>

                    {/* System Admin Group */}
                    {(user?.isAdmin || user?.role?.toLowerCase() === 'admin') && (
                        <div className="space-y-1">
                            <button
                                onClick={() => setIsAdminExpanded(!isAdminExpanded)}
                                className={`w-full flex items-center justify-between px-6 py-3 rounded-2xl text-left transition-all duration-300 border ${
                                    activeView === 'Approvals' || activeView === 'Members' || activeView === 'AdminTasks'
                                    ? 'bg-pink-500/10 border-pink-500/30 text-pink-500 shadow-[0_4px_12px_rgba(255,45,120,0.1)]'
                                    : 'bg-white/[0.02] border-white/5 text-pink-500/80 hover:bg-white/[0.04] hover:border-white/10'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="flex-shrink-0">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                    </span>
                                    <span className="text-[11px] font-bold tracking-tight uppercase">System admin</span>
                                </div>
                                <motion.span
                                    animate={{ rotate: isAdminExpanded ? 90 : 0 }}
                                    className="text-pink-500/40"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-2.5 h-2.5">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </motion.span>
                            </button>

                            <AnimatePresence>
                                {isAdminExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden px-2 space-y-1"
                                    >
                                        <button
                                            onClick={() => setActiveView('Approvals')}
                                            className={`w-full flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                                                activeView === 'Approvals' ? 'text-pink-500 bg-pink-500/5' : 'text-white/30 hover:text-white/60 hover:bg-white/5'
                                            }`}
                                        >
                                            <div className={`w-1 h-1 rounded-full ${activeView === 'Approvals' ? 'bg-pink-500 shadow-[0_0_8px_rgba(255,13,153,0.4)]' : 'bg-white/10'}`} />
                                            Approvals
                                        </button>
                                        <button
                                            onClick={() => setActiveView('Members')}
                                            className={`w-full flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                                                activeView === 'Members' ? 'text-pink-500 bg-pink-500/5' : 'text-white/30 hover:text-white/60 hover:bg-white/5'
                                            }`}
                                        >
                                            <div className={`w-1 h-1 rounded-full ${activeView === 'Members' ? 'bg-pink-500 shadow-[0_0_8px_rgba(255,13,153,0.4)]' : 'bg-white/10'}`} />
                                            Members
                                        </button>
                                        <button
                                            onClick={() => setActiveView('AdminTasks')}
                                            className={`w-full flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                                                activeView === 'AdminTasks' ? 'text-pink-500 bg-pink-500/5' : 'text-white/30 hover:text-white/60 hover:bg-white/5'
                                            }`}
                                        >
                                            <div className={`w-1 h-1 rounded-full ${activeView === 'AdminTasks' ? 'bg-pink-500 shadow-[0_0_8px_rgba(255,13,153,0.4)]' : 'bg-white/10'}`} />
                                            Admin Tasks
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Logout button */}
                <div className="pt-2 mx-4 border-t border-white/5">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/[0.02] border border-white/5 text-white/40 hover:text-white/80 hover:bg-white/[0.04] hover:border-white/10 transition-all group"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span className="text-[11px] font-bold tracking-tight">Session exit</span>
                    </button>
                </div>
            </div>
        </motion.aside>
    )
}
