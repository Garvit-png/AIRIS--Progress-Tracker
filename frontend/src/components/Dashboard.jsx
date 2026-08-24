import React, { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import WorkCalendar from './panels/WorkCalendar'
import DayDetail from './panels/DayDetail'
import MonthlySummary from './panels/MonthlySummary'
import MembersList from './panels/MembersList'
import AdminPanel from '../pages/AdminPanel'
import AdminPortalGate from './AdminPortalGate'
import ChatPanel from './panels/ChatPanel'
import GroupPortal from './panels/GroupPortal'
import { AuthService } from '../services/authService'
import { Camera, X, Upload, Save, User as UserIcon, Lock, Unlock, AlertTriangle, Github, ChevronRight } from 'lucide-react'

export default function Dashboard({ user: initialUser }) {
    const [user, setUser] = useState(initialUser)
    const [headerVisible, setHeaderVisible] = useState(false)
    const [activeView, setActiveView] = useState('Dashboard')
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [tasks, setTasks] = useState([])
    const [tasksLoading, setTasksLoading] = useState(false)
    const [groups, setGroups] = useState(AuthService.cache.getStale('groups') || [])
    const [groupsLoading, setGroupsLoading] = useState(false)
    
    // Profile Modal State
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
    const [editName, setEditName] = useState(user?.name || '')
    const [editPfp, setEditPfp] = useState(user?.profilePicture || '')
    const [isUpdating, setIsUpdating] = useState(false)
    const fileInputRef = useRef(null)

    // Admin Portal Security State
    const [isPortalUnlocked, setIsPortalUnlocked] = useState(sessionStorage.getItem('admin_portal_unlocked') === 'true')
    const [isGateOpen, setIsGateOpen] = useState(false)
    const [pendingView, setPendingView] = useState(null)

    // Priority Task Logic
    const priorityTask = useMemo(() => {
        return tasks.find(t => t.isPriority && t.status !== 'completed');
    }, [tasks]);

    useEffect(() => {
        setHeaderVisible(true);
        
        // Sync user state with props from App
        if (initialUser) {
            setUser(initialUser);
            setEditName(initialUser.name || '');
            setEditPfp(initialUser.profilePicture || '');
        }

        // Fetch tasks for priority detection and task view
        fetchMyTasks();
        fetchMyGroups();
    }, [initialUser, activeView]);

    const handleViewChange = (view) => {
        const restrictedViews = ['Approvals', 'AdminTasks'];
        const isAdmin = user?.isAdmin || ['president', 'general secretary', 'admin'].includes(user?.role?.toLowerCase());

        if (isAdmin && restrictedViews.includes(view) && !isPortalUnlocked) {
            setPendingView(view);
            setIsGateOpen(true);
        } else {
            setActiveView(view);
        }
    };

    const handlePortalUnlock = () => {
        setIsPortalUnlocked(true);
        sessionStorage.setItem('admin_portal_unlocked', 'true');
        setIsGateOpen(false);
        if (pendingView) {
            setActiveView(pendingView);
            setPendingView(null);
        }
    };

    const handleLockPortal = () => {
        setIsPortalUnlocked(false);
        sessionStorage.removeItem('admin_portal_unlocked');
        if (['Approvals', 'AdminTasks'].includes(activeView)) {
            setActiveView('Dashboard');
        }
    };

    const fetchMyTasks = async () => {
        setTasksLoading(true);
        try {
            const data = await AuthService.getMyTasks();
            setTasks(data);
        } catch (error) {
            console.error('Failed to load tasks:', error);
        } finally {
            setTasksLoading(false);
        }
    };

    const handleUpdateTaskStatus = async (taskId, status) => {
        try {
            await AuthService.updateTaskStatus(taskId, status);
            fetchMyTasks();
        } catch (error) {
            alert(error.message);
        }
    };

    const fetchMyGroups = async () => {
        // If we already have stale data, don't show a blocking loader
        if (groups.length === 0) setGroupsLoading(true);
        try {
            // getGroups now checks cache internally (2 min TTL)
            const data = await AuthService.getGroups();
            setGroups(data);
        } catch (error) {
            console.error('Failed to load groups:', error);
        } finally {
            setGroupsLoading(false);
        }
    };

    const handleLogout = () => {
        AuthService.logout()
        window.location.reload()
    }

    const compressImage = (base64) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 128;
                const MAX_HEIGHT = 128;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.5));
            };
        });
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onloadend = async () => {
            const compressed = await compressImage(reader.result);
            setEditPfp(compressed)
        }
        reader.readAsDataURL(file)
    }

    const handleProfileUpdate = async (e) => {
        e.preventDefault()
        setIsUpdating(true)
        try {
            const updatedUser = await AuthService.updateProfile({
                name: editName,
                profilePicture: editPfp
            })
            setUser(updatedUser)
            setIsProfileModalOpen(false)
        } catch (error) {
            alert(error.message)
        } finally {
            setIsUpdating(false)
        }
    }

    const ProfileModal = () => (
        <AnimatePresence>
            {isProfileModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setIsProfileModalOpen(false)}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-[#121212] border border-pink-500/20 rounded-[2rem] overflow-hidden shadow-2xl"
                    >
                        <div className="h-32 bg-gradient-to-br from-pink-600/20 to-transparent relative">
                            <button onClick={() => setIsProfileModalOpen(false)} className="absolute top-6 right-6 w-8 h-8 rounded-full bg-black/40 border border-pink-500/20 flex items-center justify-center text-white/80 hover:text-white transition-all">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="px-8 pb-10 -mt-12 relative z-10">
                            <div className="flex flex-col items-center text-center">
                                <div className="relative group mb-6">
                                    <div className="w-24 h-24 rounded-3xl bg-[#1a1a1a] border-4 border-[#121212] flex items-center justify-center overflow-hidden shadow-2xl ring-1 ring-pink-500/20">
                                        {editPfp ? <img src={editPfp} alt="Preview" className="w-full h-full object-cover" /> : <UserIcon size={40} className="text-white/50" />}
                                    </div>
                                    <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-lg hover:bg-pink-600 transition-all transform hover:scale-110">
                                        <Camera size={16} />
                                    </button>
                                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                                </div>
                                <div className="w-full space-y-6">
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-mono text-pink-400 uppercase tracking-[0.3em]">Identity Designation</p>
                                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-white/[0.03] border border-pink-500/20 rounded-xl px-5 py-3.5 text-sm font-mono focus:border-pink-500/50 outline-none transition-all text-white" />
                                    </div>
                                    <div className="pt-4 flex gap-3">
                                        <button onClick={() => setIsProfileModalOpen(false)} className="flex-1 py-3.5 bg-white/5 border border-pink-500/20 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/90 hover:text-white transition-all">Cancel</button>
                                        <button onClick={handleProfileUpdate} disabled={isUpdating} className="flex-2 px-8 py-3.5 bg-pink-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-pink-600 transition-all disabled:opacity-50">
                                            {isUpdating ? 'Synchronizing...' : 'Update Registry'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )

    function renderView() {
        if (activeView === 'Groups') {
            return (
                <div className="max-w-7xl mx-auto px-1 sm:px-4">
                    <GroupPortal />
                </div>
            )
        }

        if (activeView === 'Settings') {
            return (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl p-6 text-sm max-w-2xl mx-auto" style={{ backgroundColor: 'var(--panel-bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                    <p className="font-mono text-[9px] tracking-widest uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Configuration</p>
                    <h2 className="text-base font-semibold mb-4">Account Settings</h2>
                    <div className="space-y-4">
                        <div className="py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                            <p className="text-[10px] opacity-90 uppercase mb-1">Authenticated As</p>
                            <p className="font-mono text-sm">{user?.email}</p>
                        </div>
                        <button onClick={() => setIsProfileModalOpen(true)} className="w-full py-3 border border-pink-500/30 text-pink-400 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-pink-500/5 transition-all mb-2">Edit Profile Details</button>
                        <button onClick={handleLogout} className="w-full py-3 border border-red-500/30 text-red-500 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/5 transition-all">Log Out / Terminate Session</button>
                        {(user?.isAdmin || ['president', 'general secretary', 'admin'].includes(user?.role?.toLowerCase())) && (
                            <div className="pt-6 mt-6 border-t border-pink-500/10">
                                <p className="text-[9px] font-mono text-pink-400 uppercase tracking-[0.3em] mb-4">Security Protocol</p>
                                <button onClick={isPortalUnlocked ? handleLockPortal : () => handleViewChange('Approvals')} className={`w-full py-3 border flex items-center justify-center gap-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${isPortalUnlocked ? 'border-amber-500/30 text-amber-500 hover:bg-amber-500/5' : 'border-pink-500/30 text-pink-400 hover:bg-pink-500/5'}`}>
                                    {isPortalUnlocked ? <><Lock size={14} /> Lock Admin Portal</> : <><Unlock size={14} /> Unlock Admin Portal</>}
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            )
        }

        if (activeView === 'Members') {
            return <div className="max-w-7xl mx-auto px-4 sm:px-6"><MembersList /></div>
        }

        if (activeView === 'Tasks') {
            return (
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">Active Responsibilities</h2>
                            <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] mt-1">Registry of Assigned Tasks</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {tasksLoading ? (
                            <div className="animate-pulse space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl border border-white/5" />)}</div>
                        ) : tasks.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl">
                                <div className="p-4 bg-white/5 rounded-full mb-4"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-white/20"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg></div>
                                <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">No Pending Assignments</p>
                            </div>
                        ) : (
                            tasks.map(task => (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={task.id} className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl hover:border-pink-500/20 transition-all group">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-sm font-semibold text-white">{task.title}</h3>
                                                {task.isPriority && <span className="px-2 py-0.5 rounded-md bg-pink-500 text-white text-[8px] font-bold uppercase animate-pulse">Priority</span>}
                                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-tighter ${task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : task.status === 'in-progress' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>{task.status}</span>
                                            </div>
                                            <p className="text-xs text-white/60 line-clamp-2">{task.description}</p>
                                            <div className="flex items-center gap-4 text-[9px] font-mono text-white/30 uppercase tracking-widest">
                                                <span>From: {task.senderName}</span>
                                                {task.deadline && <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {task.status !== 'completed' && (
                                                <>
                                                    {task.status === 'pending' && <button onClick={() => handleUpdateTaskStatus(task.id, 'in-progress')} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold uppercase text-white hover:bg-pink-500 hover:text-white transition-all">Start Task</button>}
                                                    {task.status === 'in-progress' && <button onClick={() => handleUpdateTaskStatus(task.id, 'completed')} className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-[9px] font-bold uppercase text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all">Mark Done</button>}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            )
        }

        if (activeView === 'Chat') {
            return <div className="max-w-7xl mx-auto px-4 sm:px-6"><ChatPanel /></div>
        }

        if (activeView === 'Approvals') {
            return <div className="max-w-7xl mx-auto px-4 sm:px-6"><AdminPanel isEmbedded={true} initialTab="pending" /></div>
        }

        if (activeView === 'AdminTasks') {
            return <div className="max-w-7xl mx-auto px-4 sm:px-6"><AdminPanel isEmbedded={true} initialTab="tasks" /></div>
        }

        return (
            <div className="flex flex-col gap-6 max-w-7xl mx-auto">
                <AnimatePresence>
                    {priorityTask && activeView === 'Dashboard' && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="w-full p-1 bg-gradient-to-r from-pink-500/20 via-pink-500/40 to-pink-500/20 rounded-[2rem] border border-pink-500/50 shadow-2xl shadow-pink-500/10 mb-4">
                            <div className="bg-[#0a0a0a] rounded-[1.8rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-3xl -mr-10 -mt-10 animate-pulse" />
                                <div className="flex items-center gap-5 relative z-10">
                                    <div className="w-14 h-14 bg-pink-500 flex items-center justify-center rounded-2xl shadow-lg shadow-pink-500/20"><AlertTriangle className="text-white" size={28} /></div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-mono text-pink-500 font-bold uppercase tracking-[0.3em]">SYSTEM PRIORITY DIRECTIVE</p>
                                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">{priorityTask.title}</h2>
                                        <p className="text-xs text-white/60 font-mono tracking-tight">{priorityTask.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 relative z-10 shrink-0">
                                    <div className="text-right hidden sm:block"><p className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Dispatched By</p><p className="text-[11px] font-bold text-white uppercase">{priorityTask.senderName}</p></div>
                                    <button onClick={() => handleUpdateTaskStatus(priorityTask.id, 'completed')} className="px-8 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-pink-500 hover:text-white transition-all shadow-xl">Acknowledge & Complete</button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* My Active Projects / Squads Section */}
                {groups.length > 0 && activeView === 'Dashboard' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-[10px] font-mono text-white/30 uppercase tracking-[0.3em]">Project Squads</h3>
                            <button onClick={() => setActiveView('Groups')} className="text-[9px] font-bold text-pink-500 uppercase tracking-widest hover:text-white transition-all">View All Intelligence</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {groups.slice(0, 3).map(group => (
                                <motion.div 
                                    whileHover={{ y: -2 }}
                                    key={group._id} 
                                    onClick={() => setActiveView('Groups')}
                                    className="p-5 bg-white/[0.03] border border-white/10 rounded-2xl cursor-pointer hover:border-pink-500/30 transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-500">
                                            <Github size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white group-hover:text-pink-400 transition-colors">{group.name}</h4>
                                            <p className="text-[9px] font-mono text-white/30 uppercase mt-0.5">{group.members?.length || 0} Members assigned</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-white/10 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6"><div className="w-full"><MonthlySummary currentMonth={currentMonth} /></div></div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-4 xl:col-span-3 sticky top-0"><WorkCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} /></div>
                    <div className="lg:col-span-8 xl:col-span-9 min-h-[600px]"><DayDetail selectedDate={selectedDate} /></div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen w-full overflow-hidden transition-colors duration-500" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
            <Sidebar user={user} activeView={activeView} setActiveView={handleViewChange} isPortalUnlocked={isPortalUnlocked} onProfileClick={() => setIsProfileModalOpen(true)} />
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <motion.header initial={{ opacity: 0, y: -12 }} animate={headerVisible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="flex items-center justify-between px-4 sm:px-6 py-0 h-[48px] min-h-[48px] border-b backdrop-blur-sm transition-colors duration-500 flex-shrink-0" style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(var(--bg-rgb), 0.6)' }}>
                    <div className="flex items-baseline gap-2 min-w-0"><h1 className="text-[11px] font-bold tracking-[0.2em] uppercase truncate" style={{ color: 'var(--text)' }}>{activeView}</h1><span className="font-mono text-[9px] hidden sm:inline opacity-40" style={{ color: 'var(--text)' }}>/ workspace console</span></div>
                    <div className="flex items-center gap-3 flex-shrink-0"><div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/5 text-white/40 text-[9px] font-bold uppercase tracking-wider"><span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" /><span>Active session</span></div></div>
                </motion.header>
                <div className="flex-1 overflow-y-auto p-3 sm:p-5 custom-scrollbar"><AnimatePresence mode="wait"><motion.div key={activeView} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, position: 'absolute' }} transition={{ duration: 0.18, ease: 'easeOut' }} className="w-full">{renderView()}</motion.div></AnimatePresence></div>
            </div>
            <ProfileModal />
            <AdminPortalGate isOpen={isGateOpen} onClose={() => setIsGateOpen(false)} onUnlock={handlePortalUnlock} />
        </div>
    )
}
