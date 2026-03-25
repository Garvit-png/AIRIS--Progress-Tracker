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
    {
        label: 'Settings',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
                <circle cx="12" cy="12" r="3" />
                <path d="m19 9-4 4-4-4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m20.66 7-1.73 1" /><path d="m5.07 16-1.73 1" /><path d="m17.33 19 1.73 1" /><path d="m6.67 4-1.73 1" /><path d="m20.66 17 1.73-1" /><path d="m5.07 8 1.73-1" /><path d="m17.33 5-1.73-1" /><path d="m6.67 20-1.73-1" />
            </svg>
        ),
    },
]

export default function Sidebar({ user, activeView, setActiveView, isPortalUnlocked, onProfileClick }) {
    const [collapsed, setCollapsed] = useState(() => {
        return localStorage.getItem('sidebar_collapsed') === 'true'
    })
    const navigate = useNavigate()

    useEffect(() => {
        localStorage.setItem('sidebar_collapsed', collapsed)
    }, [collapsed])

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
            className="h-full flex flex-col bg-[#050505] border-r border-white/5 overflow-hidden flex-shrink-0 relative z-10"
            initial={false}
            animate={{ width: collapsed ? 60 : 200 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
        >
            {/* User Profile Section */}
            <div className={`p-3 ${collapsed ? 'px-2' : 'px-4'} pt-6 pb-4`}>
                <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} p-2 rounded-2xl transition-all`}>
                    <div 
                        onClick={onProfileClick}
                        className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-pink-500/20 cursor-pointer flex-shrink-0"
                    >
                        {initials}
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-white font-bold text-xs truncate leading-none mb-1">{user?.name || user?.email.split('@')[0]}</span>
                            <span className="text-pink-500 text-[9px] font-black uppercase tracking-wider">{user?.role || 'Member'}</span>
                        </div>
                    )}
                </div>
                
                {/* Toggle Button */}
                <button 
                    onClick={() => setCollapsed(!collapsed)}
                    className={`absolute top-4 right-2 p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all z-20 ${collapsed ? '-right-1 scale-75 opacity-0 group-hover:opacity-100' : ''}`}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`w-3.5 h-3.5 transition-transform ${collapsed ? 'rotate-180' : ''}`}>
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
            </div>

            {/* Navigation List */}
            <nav className="flex-1 px-2 space-y-1 overflow-y-auto custom-scrollbar">
                {NAV.map(item => (
                    <button
                        key={item.label}
                        onClick={() => setActiveView(item.label)}
                        className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'px-3'} py-3 rounded-xl text-left transition-all duration-200 group relative ${
                            activeView === item.label
                            ? 'bg-white/10 text-white'
                            : 'bg-transparent text-white/40 hover:text-white/80 hover:bg-white/[0.03]'
                        }`}
                        title={collapsed ? item.label : ''}
                    >
                        <span className={`${activeView === item.label ? 'text-white' : 'text-white/30 group-hover:text-white/60'} transition-colors flex-shrink-0`}>
                            {React.cloneElement(item.icon, { className: 'w-[18px] h-[18px]' })}
                        </span>
                        {!collapsed && (
                            <span className="text-[13px] font-semibold tracking-tight ml-3">{item.label}</span>
                        )}
                        {collapsed && activeView === item.label && (
                            <motion.div 
                                layoutId="active-indicator"
                                className="absolute left-0 w-1 h-6 bg-pink-500 rounded-r-full"
                            />
                        )}
                    </button>
                ))}

                {/* System Admin Section */}
                {(user?.isAdmin || user?.role?.toLowerCase() === 'admin') && (
                    <div className="pt-6 pb-2 space-y-3">
                        {!collapsed && (
                            <div className="px-3">
                                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">System Admin</span>
                            </div>
                        )}
                        
                        <button
                            onClick={() => setActiveView('Approvals')}
                            className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'px-3'} py-3 rounded-xl text-left transition-all duration-300 border ${
                                activeView === 'Approvals'
                                ? 'bg-pink-500/10 border-pink-500/30 text-pink-500'
                                : 'bg-pink-500/[0.03] border-pink-500/10 text-pink-500/60 hover:bg-pink-500/5 hover:border-pink-500/20'
                            }`}
                            title={collapsed ? 'Admin Portal' : ''}
                        >
                            <span className="flex-shrink-0">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[18px] h-[18px]">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </span>
                            {!collapsed && (
                                <span className="text-xs font-bold uppercase tracking-wider ml-3">Admin Portal</span>
                            )}
                        </button>
                    </div>
                )}
            </nav>

            {/* Footer Section */}
            <div className="p-2 border-t border-white/5 space-y-1">
                <button 
                    onClick={handleLogout}
                    className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'px-3'} py-3 rounded-xl bg-white/[0.02] border border-white/5 text-white/40 hover:text-white hover:bg-white/5 transition-all group`}
                    title={collapsed ? 'Session Exit' : ''}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[18px] h-[18px] opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    {!collapsed && (
                        <span className="text-xs font-bold uppercase tracking-wider ml-3">Session Exit</span>
                    )}
                </button>
            </div>
        </motion.aside>
    )
}
