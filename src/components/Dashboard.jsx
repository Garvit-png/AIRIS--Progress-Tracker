import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import WorkCalendar from './panels/WorkCalendar'
import DayDetail from './panels/DayDetail'
import MonthlySummary from './panels/MonthlySummary'
import MembersList from './panels/MembersList'
import AdminPanel from '../pages/AdminPanel'
import { AuthService } from '../services/authService'
import { Camera, X, Upload, Save, User as UserIcon } from 'lucide-react'

export default function Dashboard({ user: initialUser }) {
    const [user, setUser] = useState(initialUser)
    const [headerVisible, setHeaderVisible] = useState(false)
    const [activeView, setActiveView] = useState('Dashboard')
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [tasks, setTasks] = useState([])
    const [tasksLoading, setTasksLoading] = useState(false)
    
    // Profile Modal State
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
    const [editName, setEditName] = useState(user?.name || '')
    const [editPfp, setEditPfp] = useState(user?.profilePicture || '')
    const [isUpdating, setIsUpdating] = useState(false)
    const fileInputRef = useRef(null)

    React.useEffect(() => {
        setHeaderVisible(true);
        if (activeView === 'Tasks') {
            fetchMyTasks();
        }
    }, [activeView]);

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
                const MAX_WIDTH = 400;
                const MAX_HEIGHT = 400;
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
                // Compress to JPEG for smallest size
                resolve(canvas.toDataURL('image/jpeg', 0.6));
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
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
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
                            <button 
                                onClick={() => setIsProfileModalOpen(false)}
                                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-black/40 border border-pink-500/20 flex items-center justify-center text-white/80 hover:text-white transition-all"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="px-8 pb-10 -mt-12 relative z-10">
                            <div className="flex flex-col items-center text-center">
                                <div className="relative group mb-6">
                                    <div className="w-24 h-24 rounded-3xl bg-[#1a1a1a] border-4 border-[#121212] flex items-center justify-center overflow-hidden shadow-2xl ring-1 ring-pink-500/20">
                                        {editPfp ? (
                                            <img src={editPfp} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <UserIcon size={40} className="text-white/50" />
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-0 right-0 w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-lg hover:bg-pink-600 transition-all transform hover:scale-110"
                                    >
                                        <Camera size={16} />
                                    </button>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>

                                <div className="w-full space-y-6">
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-mono text-pink-400 uppercase tracking-[0.3em]">Identity Designation</p>
                                        <input 
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            placeholder="Enter full name"
                                            className="w-full bg-white/[0.03] border border-pink-500/20 rounded-xl px-5 py-3.5 text-sm font-mono focus:border-pink-500/50 outline-none transition-all text-white"
                                        />
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        <button 
                                            onClick={() => setIsProfileModalOpen(false)}
                                            className="flex-1 py-3.5 bg-white/5 border border-pink-500/20 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/90 hover:text-white hover:bg-white/10 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handleProfileUpdate}
                                            disabled={isUpdating}
                                            className="flex-2 flex items-center justify-center gap-2 px-8 py-3.5 bg-pink-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-pink-600 transition-all disabled:opacity-50"
                                        >
                                            {isUpdating ? 'Synchronizing...' : (
                                                <>
                                                    <Save size={14} />
                                                    Update Registry
                                                </>
                                            )}
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
                        <button
                            onClick={() => setIsProfileModalOpen(true)}
                            className="w-full py-3 border border-pink-500/30 text-pink-400 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-pink-500/5 transition-all mb-2"
                        >
                            Edit Profile Details
                        </button>
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

        if (activeView === 'Members') {
            return (
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <MembersList />
                </div>
            )
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
                            <div className="animate-pulse space-y-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl border border-white/5" />)}
                            </div>
                        ) : tasks.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl">
                                <div className="p-4 bg-white/5 rounded-full mb-4">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-white/20">
                                        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                                    </svg>
                                </div>
                                <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">No Pending Assignments</p>
                            </div>
                        ) : (
                            tasks.map(task => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={task.id}
                                    className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl hover:border-pink-500/20 transition-all group"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-sm font-semibold text-white">{task.title}</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-tighter ${
                                                    task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                                    task.status === 'in-progress' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                                    'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                }`}>
                                                    {task.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-white/60 line-clamp-2">{task.description}</p>
                                            {task.attachment && (
                                                <div className="mt-2 text-[10px] font-mono">
                                                    <span className="text-white/30 mr-2 uppercase tracking-widest">Attachment:</span>
                                                    <a 
                                                        href={AuthService.getAttachmentUrl(task.attachment.path)}
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-pink-400 hover:text-white font-bold underline underline-offset-2"
                                                    >
                                                        {task.attachment.name.toUpperCase()}
                                                    </a>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-4 text-[9px] font-mono text-white/30 uppercase tracking-widest">
                                                <span>From: {task.senderName}</span>
                                                {task.deadline && <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {task.status !== 'completed' && (
                                                <>
                                                    {task.status === 'pending' && (
                                                        <button 
                                                            onClick={() => handleUpdateTaskStatus(task.id, 'in-progress')}
                                                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold uppercase tracking-widest text-white/80 hover:bg-pink-500 hover:text-white transition-all shadow-xl"
                                                        >
                                                            Start Task
                                                        </button>
                                                    )}
                                                    {task.status === 'in-progress' && (
                                                        <button 
                                                            onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                                                            className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-[9px] font-bold uppercase tracking-widest text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-xl"
                                                        >
                                                            Mark Done
                                                        </button>
                                                    )}
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

        if (activeView === 'Approvals') {
            return (
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <AdminPanel isEmbedded={true} />
                </div>
            )
        }

        return (
            <div className="flex flex-col gap-6 max-w-7xl mx-auto">
                <MonthlySummary currentMonth={currentMonth} />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left: Calendar */}
                    <div className="lg:col-span-5 xl:col-span-4 sticky top-0">
                        <WorkCalendar
                            selectedDate={selectedDate}
                            onDateSelect={setSelectedDate}
                            currentMonth={currentMonth}
                            setCurrentMonth={setCurrentMonth}
                        />
                    </div>

                    {/* Right: Day Detail */}
                    <div className="lg:col-span-7 xl:col-span-8 min-h-[600px]">
                        <DayDetail selectedDate={selectedDate} />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-full w-full overflow-hidden transition-colors duration-500" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
            <Sidebar 
                user={user} 
                activeView={activeView} 
                setActiveView={setActiveView} 
                onProfileClick={() => setIsProfileModalOpen(true)}
            />

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
                        <span className="font-mono text-[10px] hidden sm:inline opacity-90" style={{ color: 'var(--text)' }}>/ Workspace Console</span>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                            <p className="text-[9px] font-mono uppercase opacity-80 tracking-widest">Active Session</p>
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

            <ProfileModal />
        </div>
    )
}
