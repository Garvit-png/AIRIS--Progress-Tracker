import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthService } from '../services/authService';
import { Search, UserPlus, Shield, X, Check, ShieldAlert, Clock, Mail, GraduationCap, UserCheck, ShieldCheck } from 'lucide-react';
import Logo from '../components/Logo';
import AdminPortalGate from '../components/AdminPortalGate';

const AdminPanel = ({ isEmbedded = false }) => {
    const [emails, setEmails] = useState([]);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [approvedUsers, setApprovedUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('pending'); // pending, whitelist, history, tasks
    const [tasks, setTasks] = useState([]);
    const [newEmail, setNewEmail] = useState('');
    const [whitelistRole, setWhitelistRole] = useState('Member');
    const [whitelistIsAdmin, setWhitelistIsAdmin] = useState(false);
    const [useCollegeDomain, setUseCollegeDomain] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    
    // Portal Security
    const [isUnlocked, setIsUnlocked] = useState(sessionStorage.getItem('admin_portal_unlocked') === 'true');
    const [isGateOpen, setIsGateOpen] = useState(!isUnlocked && !isEmbedded);

    const COLLEGE_DOMAIN = '@nst.rishihood.edu.in';

    useEffect(() => {
        if (activeTab === 'whitelist') {
            fetchEmails();
        } else if (activeTab === 'history') {
            fetchApprovedUsers();
        } else if (activeTab === 'tasks') {
            fetchTasks();
        } else {
            fetchPendingUsers();
        }
    }, [activeTab]);

    const fetchEmails = async () => {
        setIsLoading(true);
        try {
            const data = await AuthService.getApprovedEmails();
            setEmails(data);
        } catch (error) {
            showMsg('Failed to load whitelist', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPendingUsers = async () => {
        setIsLoading(true);
        try {
            const data = await AuthService.getPendingUsers();
            setPendingUsers(data);
        } catch (error) {
            showMsg('Failed to load pending requests', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchApprovedUsers = async () => {
        setIsLoading(true);
        try {
            const data = await AuthService.getApprovedUsers();
            setApprovedUsers(data);
        } catch (error) {
            showMsg('Failed to load approval history', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTasks = async () => {
        setIsLoading(true);
        try {
            const data = await AuthService.getAllTasks();
            setTasks(data);
        } catch (error) {
            showMsg('Failed to load tasks', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const showMsg = (text, type = 'info') => {
        setMessage({ text: text.toUpperCase(), type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleApproveEmail = async (e) => {
        e.preventDefault();
        if (!newEmail.trim()) return;

        let finalEmail = newEmail.trim();
        if (useCollegeDomain && !finalEmail.includes('@')) {
            finalEmail += COLLEGE_DOMAIN;
        }

        setActionLoading(true);
        try {
            await AuthService.approveEmail(finalEmail, whitelistRole, whitelistIsAdmin);
            showMsg('IDENTITY PRE-AUTHORIZED', 'success');
            setNewEmail('');
            setWhitelistRole('Member');
            setWhitelistIsAdmin(false);
            fetchEmails();
        } catch (error) {
            showMsg(error.message, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRevokeEmail = async (email) => {
        if (!window.confirm(`REVOKE PRE-AUTHORIZATION FOR ${email}?`)) return;

        setActionLoading(true);
        try {
            await AuthService.revokeEmail(email);
            showMsg('PRE-AUTHORIZATION REVOKED', 'success');
            fetchEmails();
        } catch (error) {
            showMsg(error.message, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUserApproval = async (userId, status, role = 'Member', isAdmin = false) => {
        setActionLoading(true);
        try {
            await AuthService.updateUserStatus(userId, status, role, isAdmin);
            showMsg(status === 'pending' ? 'USER ACCESS REVOKED' : `USER ${status.toUpperCase()} AS ${role.toUpperCase()}`, 'success');
            fetchPendingUsers();
            fetchApprovedUsers();
        } catch (error) {
            showMsg(error.message, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length === 1) return name.charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    const filteredEmails = useMemo(() => {
        return emails.filter(item => 
            item.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [emails, searchQuery]);

    const filteredPending = useMemo(() => {
        return pendingUsers.filter(user => 
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [pendingUsers, searchQuery]);

    const filteredApproved = useMemo(() => {
        return approvedUsers.filter(user => 
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [approvedUsers, searchQuery]);

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => 
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            task.targetEmail.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [tasks, searchQuery]);

    const stats = {
        total: activeTab === 'whitelist' ? emails.length : (activeTab === 'history' ? approvedUsers.length : pendingUsers.length),
        totalOverall: approvedUsers.length
    };

    return (
        <div className={`${isEmbedded ? 'pb-12' : 'min-h-screen bg-[#050505] selection:bg-pink-500/30'} text-slate-200 font-sans`}>
            {/* Security Gate for non-embedded view */}
            {!isEmbedded && (
                <AdminPortalGate 
                    isOpen={isGateOpen} 
                    onClose={() => window.location.href = '/dashboard'} 
                    onUnlock={() => {
                        setIsUnlocked(true);
                        setIsGateOpen(false);
                        sessionStorage.setItem('admin_portal_unlocked', 'true');
                    }} 
                />
            )}

            {(!isUnlocked && !isEmbedded) ? (
                <div className="min-h-screen flex items-center justify-center">
                    <p className="font-mono text-[10px] uppercase tracking-[0.5em] animate-pulse">Waiting for Authorization...</p>
                </div>
            ) : (
                <>
                    {/* Professional Background */}
            {!isEmbedded && (
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-pink-900/10 blur-[120px] rounded-full opacity-50" />
                    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-900/10 blur-[120px] rounded-full opacity-50" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
                </div>
            )}

            <div className={`relative z-10 mx-auto ${isEmbedded ? '' : 'max-w-7xl px-6 py-8 md:py-12'}`}>
                {/* Header Section */}
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-pink-500/10 pb-10">
                    <div className="space-y-4">
                        <Logo size="sm" showSubtitle={false} className="!items-start opacity-90" />
                        <div>
                            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
                                Approvals <span className="text-white/90 font-normal">Portal</span>
                            </h1>
                            <p className="text-white/90 text-sm mt-1 font-mono uppercase tracking-wider">Access Rights Management System</p>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="flex gap-3">
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="px-6 py-4 bg-white/[0.03] border border-pink-500/10 rounded-2xl backdrop-blur-md min-w-[140px]"
                        >
                            <p className="text-[10px] font-mono text-white/80 uppercase tracking-widest mb-1">
                                {activeTab === 'pending' ? 'Pending' : (activeTab === 'history' ? 'Approved' : 'Pre-Auth')}
                            </p>
                            <p className="text-2xl font-bold text-white tracking-tight">{stats.total}</p>
                        </motion.div>
                        
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="px-6 py-4 bg-pink-500/5 border border-pink-500/10 rounded-2xl backdrop-blur-md min-w-[140px]"
                        >
                            <p className="text-[10px] font-mono text-pink-400/90 uppercase tracking-widest mb-1">Total Members</p>
                            <p className="text-2xl font-bold text-pink-500 tracking-tight">{stats.totalOverall}</p>
                        </motion.div>

                    </div>
                </header>

                {/* Tab Switcher */}
                <div className="flex gap-2 mb-8 p-1.5 bg-pink-500/5 rounded-2xl w-fit border border-pink-500/20 backdrop-blur-xl">
                    <button 
                        onClick={() => setActiveTab('pending')}
                        className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                            activeTab === 'pending' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-white/75 hover:text-white/90'
                        }`}
                    >
                        Pending
                    </button>
                    <button 
                        onClick={() => setActiveTab('whitelist')}
                        className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                            activeTab === 'whitelist' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-white/75 hover:text-white/90'
                        }`}
                    >
                        Pre-Auth
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                            activeTab === 'history' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-white/75 hover:text-white/90'
                        }`}
                    >
                        History
                    </button>
                    <button 
                        onClick={() => setActiveTab('tasks')}
                        className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                            activeTab === 'tasks' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-white/75 hover:text-white/90'
                        }`}
                    >
                        Tasks
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Sidebar Controls */}
                    <div className="lg:col-span-4 space-y-6">
                        <section className="p-1 bg-gradient-to-br from-white/10 to-transparent rounded-[2rem]">
                            <div className="p-8 bg-[#0a0a0a] rounded-[1.9rem] backdrop-blur-3xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-600/5 blur-3xl -mr-16 -mt-16 group-hover:bg-pink-600/10 transition-all duration-500" />
                                
                                <div className="relative z-10 space-y-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-pink-500/5 rounded-lg border border-pink-500/20">
                                            {activeTab === 'pending' ? <Clock className="w-4 h-4 text-amber-400" /> : (activeTab === 'history' ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <UserPlus className="w-4 h-4 text-pink-400" />)}
                                        </div>
                                        <h2 className="text-sm font-semibold text-white tracking-wide">
                                            {activeTab === 'pending' ? 'Approval Queue' : (activeTab === 'history' ? 'Audit History' : 'Pre-Authorize Identity')}
                                        </h2>
                                    </div>

                                    {activeTab === 'tasks' ? (
                                        <form onSubmit={async (e) => {
                                            e.preventDefault();
                                            const targetEmail = e.target.targetEmail.value;
                                            const title = e.target.title.value;
                                            const description = e.target.description.value;
                                            const deadline = e.target.deadline.value;
                                            
                                            setActionLoading(true);
                                            try {
                                                const file = e.target.file.files[0];
                                                await AuthService.sendTask({ targetEmail, title, description, deadline }, file);
                                                showMsg('TASK DISPATCHED SUCCESSFULLY', 'success');
                                                e.target.reset();
                                                fetchTasks();
                                            } catch (error) {
                                                showMsg(error.message, 'error');
                                            } finally {
                                                setActionLoading(false);
                                            }
                                        }} className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Target Email</label>
                                                <input 
                                                    name="targetEmail"
                                                    required
                                                    type="email"
                                                    placeholder="user@example.com"
                                                    className="w-full bg-black/40 border border-pink-500/20 rounded-xl px-4 py-3 text-xs outline-none text-white focus:border-pink-500/50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Task Title</label>
                                                <input 
                                                    name="title"
                                                    required
                                                    type="text"
                                                    placeholder="Assigned responsibility..."
                                                    className="w-full bg-black/40 border border-pink-500/20 rounded-xl px-4 py-3 text-xs outline-none text-white focus:border-pink-500/50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Description</label>
                                                <textarea 
                                                    name="description"
                                                    rows="3"
                                                    placeholder="Detailed instructions..."
                                                    className="w-full bg-black/40 border border-pink-500/20 rounded-xl px-4 py-3 text-xs outline-none text-white focus:border-pink-500/50 resize-none"
                                                ></textarea>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Deadline</label>
                                                <input 
                                                    name="deadline"
                                                    type="date"
                                                    className="w-full bg-black/40 border border-pink-500/20 rounded-xl px-4 py-3 text-xs outline-none text-white focus:border-pink-500/50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Attachment (PDF/Image)</label>
                                                <input 
                                                    name="file"
                                                    type="file"
                                                    accept=".pdf,image/*"
                                                    className="w-full bg-black/40 border border-pink-500/20 rounded-xl px-4 py-3 text-[10px] outline-none text-white focus:border-pink-500/50 file:bg-pink-500/10 file:border-0 file:text-pink-500 file:text-[9px] file:font-bold file:uppercase file:px-3 file:py-1 file:rounded-md file:mr-4 hover:file:bg-pink-500/20"
                                                />
                                            </div>
                                            <button
                                                className="w-full py-4 bg-pink-500 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-pink-600 active:scale-[0.98] transition-all shadow-lg shadow-pink-500/20"
                                            >
                                                Dispatch Task
                                            </button>
                                        </form>
                                    ) : activeTab === 'whitelist' ? (
                                        <form onSubmit={handleApproveEmail} className="space-y-6">
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center px-1">
                                                    <label className="text-[11px] font-medium text-white/80 uppercase tracking-wider">Email/Roll No</label>
                                                    <button 
                                                        type="button"
                                                        onClick={() => setUseCollegeDomain(!useCollegeDomain)}
                                                        className={`flex items-center gap-2 px-2 py-1 rounded-md transition-all border ${
                                                            useCollegeDomain ? 'bg-pink-500/10 border-pink-500/20 text-pink-400' : 'bg-white/5 border-white/10 text-white/90'
                                                        }`}
                                                    >
                                                        <GraduationCap className="w-3 h-3" />
                                                        <span className="text-[9px] font-bold uppercase tracking-tighter">College Domain</span>
                                                    </button>
                                                </div>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder={useCollegeDomain ? "username" : "full-email@domain.com"}
                                                        className={`w-full bg-black/60 border rounded-xl px-5 py-4 text-sm font-mono outline-none transition-all text-white placeholder:text-slate-700 ${
                                                            useCollegeDomain ? 'border-pink-500/30 focus:border-pink-500/60 pr-32' : 'border-pink-500/10 focus:border-pink-500/30'
                                                        }`}
                                                        value={newEmail}
                                                        onChange={(e) => setNewEmail(e.target.value)}
                                                    />
                                                    {useCollegeDomain && (
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-pink-400/50 select-none bg-pink-500/5 px-2 py-1 rounded border border-pink-500/10">
                                                            {COLLEGE_DOMAIN}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                                    <div className="flex-1">
                                                        <select
                                                            className="w-full bg-black/40 border border-pink-500/10 rounded-xl px-4 py-3 text-[10px] font-mono text-white/80 outline-none focus:border-pink-500/30 transition-all uppercase tracking-widest cursor-pointer"
                                                            value={whitelistRole}
                                                            onChange={(e) => setWhitelistRole(e.target.value)}
                                                        >
                                                            <option value="Member">Member</option>
                                                            <option value="Core Member">Core Member</option>
                                                            <option value="President">President</option>
                                                            <option value="Coordinator">Coordinator</option>
                                                            <option value="Lead">Lead</option>
                                                        </select>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setWhitelistIsAdmin(!whitelistIsAdmin)}
                                                        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all border ${
                                                            whitelistIsAdmin ? 'bg-pink-500/20 border-pink-500/40 text-pink-400' : 'bg-white/5 border-white/10 text-white/40'
                                                        }`}
                                                    >
                                                        <Shield className={`w-3.5 h-3.5 ${whitelistIsAdmin ? 'text-pink-400' : 'opacity-40'}`} />
                                                        <span className="text-[9px] font-bold uppercase tracking-widest">
                                                            {whitelistIsAdmin ? 'ADMIN PRIVILEGE: ON' : 'ADMIN: OFF'}
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                            <button
                                                disabled={actionLoading}
                                                className="w-full py-4 bg-white text-black font-bold text-[11px] uppercase tracking-[0.2em] rounded-xl hover:bg-pink-500 hover:text-white active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl"
                                            >
                                                {actionLoading ? 'VERIFYING...' : 'GRANT PRE-AUTH'}
                                            </button>
                                        </form>
                                    ) : activeTab === 'history' ? (
                                        <div className="space-y-4 font-mono text-[10px] text-white/95 leading-relaxed">
                                            <p>// AUDIT LOG:</p>
                                            <p>All finalized entries are logged here for verification.</p>
                                            <p className="text-emerald-500/60">Status: ALL SYSTEMS NOMINAL</p>
                                        </div>
                                    ) : (
                                        <div className="py-12 flex flex-col items-center justify-center border border-dashed border-pink-500/10 rounded-2xl">
                                            <ShieldAlert className="w-8 h-8 text-white/5 mb-2" />
                                            <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">Queue Active</p>
                                        </div>
                                    )}

                                    <AnimatePresence>
                                        {message.text && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0 }}
                                                className={`p-4 rounded-xl font-mono text-[10px] text-center tracking-widest border ${
                                                    message.type === 'error' ? 'border-red-500/20 bg-red-500/5 text-red-500' : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500'
                                                }`}
                                            >
                                                {message.text}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* Request List (Right) */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/90 group-focus-within:text-white transition-colors" />
                            <input 
                                type="text"
                                placeholder={
                                    activeTab === 'pending' ? "Search pending requests..." : 
                                    (activeTab === 'history' ? "Search approval history..." : "Filter pre-authorized identities...")
                                }
                                className="w-full bg-[#0a0a0a]/80 border border-pink-500/10 rounded-2xl py-4 pl-14 pr-6 text-sm outline-none focus:border-pink-500/30 focus:bg-pink-500/[0.02] transition-all font-sans backdrop-blur-xl placeholder:text-slate-700"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="space-y-3 min-h-[500px]">
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-24 bg-white/[0.02] border border-pink-500/10 rounded-2xl animate-pulse" />
                                    ))}
                                </div>
                            ) : (activeTab === 'pending' ? filteredPending : (activeTab === 'history' ? filteredApproved : (activeTab === 'tasks' ? filteredTasks : filteredEmails))).length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center py-32 space-y-4 rounded-3xl border border-dashed border-pink-500/10"
                                >
                                    <div className="p-4 bg-white/5 rounded-full border border-white/5">
                                        <ShieldCheck className="w-8 h-8 text-slate-800" />
                                    </div>
                                    <p className="font-mono text-[11px] text-slate-600 uppercase tracking-[0.3em]">No Pending Transfers</p>
                                </motion.div>
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {(activeTab === 'pending' ? filteredPending : (activeTab === 'history' ? filteredApproved : (activeTab === 'tasks' ? filteredTasks : filteredEmails))).map((item) => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            key={item._id || item.email}
                                            className="group relative flex items-center justify-between p-5 bg-[#0a0a0a] border border-pink-500/10 rounded-2xl hover:border-pink-500/30 transition-all duration-300"
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className="hidden sm:flex items-center justify-center w-12 h-12 bg-white/[0.03] rounded-xl border border-pink-500/10 group-hover:border-pink-500/40 transition-colors">
                                                    {activeTab === 'tasks' ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className={`px-3 py-1.5 rounded-lg border text-[8px] font-bold uppercase tracking-widest ${
                                                            item.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                                            item.status === 'in-progress' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                                                            'bg-amber-500/10 border-amber-500/20 text-amber-500'
                                                        }`}>
                                                            {item.status}
                                                        </div>
                                                        <div className="text-[10px] font-mono text-white/40">
                                                            To: {item.targetEmail}
                                                        </div>
                                                        {item.attachment && (
                                                            <a 
                                                                href={AuthService.getAttachmentUrl(item.attachment.path)}
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="ml-2 text-[8px] font-bold text-pink-400 hover:text-white underline underline-offset-2"
                                                            >
                                                                VIEW ATTACHMENT
                                                            </a>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center overflow-hidden">
                                                        {item.profilePicture ? (
                                                            <img src={item.profilePicture} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-white/40">
                                                                {activeTab === 'whitelist' ? '??' : getInitials(item.name || item.email)}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                                                            {activeTab === 'pending' ? item.name : (activeTab === 'history' ? item.name : item.email)}
                                                        </p>
                                                        {activeTab === 'pending' && (
                                                            <span className="px-2 py-0.5 rounded-full bg-amber-500/5 border border-amber-500/20 text-[8px] font-bold uppercase tracking-tighter text-amber-500/60">
                                                                Pending Verification
                                                            </span>
                                                        )}
                                                        {activeTab === 'whitelist' && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="px-2 py-0.5 rounded-lg bg-pink-500/5 border border-pink-500/10 text-[8px] font-bold uppercase tracking-wider text-pink-400/80">
                                                                    {item.role || 'Member'}
                                                                </span>
                                                                {item.isAdmin && (
                                                                    <Shield className="w-3 h-3 text-pink-500/50" />
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1.5 opacity-50">
                                                        <span className="font-mono text-[9px] uppercase tracking-widest flex items-center gap-1.5">
                                                            <Mail className="w-3 h-3" />
                                                            {activeTab === 'pending' ? item.email : (activeTab === 'history' ? item.email : `Whitelisted: ${new Date(item.createdAt).toLocaleDateString()}`)}
                                                            {activeTab === 'pending' && (
                                                                <>
                                                                    <span className="mx-1">•</span>
                                                                    <GraduationCap className="w-3 h-3" />
                                                                    Batch {item.year || 'N/A'}
                                                                </>
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                {activeTab === 'pending' ? (
                                                    <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl">
                                                        <select 
                                                            id={`role-${item._id}`}
                                                            className="bg-transparent text-[8px] font-mono text-white/80 outline-none px-2 py-0.5 border-r border-white/10"
                                                            defaultValue="Member"
                                                        >
                                                            <option value="Member">Member</option>
                                                            <option value="Core Member">Core Member</option>
                                                            <option value="President">Pres</option>
                                                            <option value="General Secretary">GS</option>
                                                            <option value="Joint Secretary">JS</option>
                                                            <option value="Admin">Admin</option>
                                                        </select>
                                                        <button
                                                            onClick={() => {
                                                                const roleSelection = document.getElementById(`role-${item._id}`).value;
                                                                handleUserApproval(item._id, 'approved', roleSelection, roleSelection === 'Admin');
                                                            }}
                                                            className="flex items-center gap-1.5 px-3 py-1 text-[8px] font-bold uppercase tracking-widest text-pink-400 hover:text-white transition-all"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleUserApproval(item._id, 'rejected')}
                                                            className="p-1 px-2 border-l border-white/10 text-white/20 hover:text-red-500 transition-all"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ) : activeTab === 'history' ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                            <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/95">Approved {item.role}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                if(window.confirm(`Revoke access for ${item.name} and send back to pending queue?`)) {
                                                                    handleUserApproval(item._id, 'pending', 'Member', false);
                                                                }
                                                            }}
                                                            title="Revoke Access"
                                                            className="p-2.5 rounded-xl border border-pink-500/10 text-slate-600 hover:text-amber-500 hover:bg-amber-500/5 hover:border-amber-500/20 transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleRevokeEmail(item.email)}
                                                        className="p-2.5 rounded-xl border border-pink-500/10 text-slate-600 hover:text-red-400 hover:bg-red-400/5 hover:border-red-400/20 transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {actionLoading && (
                <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm cursor-wait" />
            )}
                </>
            )}
        </div>
    );
};

// Simple Fallback Icon for missing UserAlert
const UserAlert = (props) => (
    <svg 
        {...props} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="12" />
        <line x1="19" y1="16" x2="19.01" y2="16" />
    </svg>
);

export default AdminPanel;
