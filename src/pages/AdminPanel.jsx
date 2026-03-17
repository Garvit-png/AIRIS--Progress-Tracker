import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthService } from '../services/authService';
import { Search, UserPlus, Shield, X, ShieldCheck, Clock, Mail, GraduationCap } from 'lucide-react';
import Logo from '../components/Logo';

const AdminPanel = () => {
    const [emails, setEmails] = useState([]);
    const [newEmail, setNewEmail] = useState('');
    const [useCollegeDomain, setUseCollegeDomain] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const COLLEGE_DOMAIN = '@nst.rishihood.edu.in';

    useEffect(() => {
        fetchEmails();
    }, []);

    const fetchEmails = async () => {
        try {
            const data = await AuthService.getApprovedEmails();
            setEmails(data);
        } catch (error) {
            showMsg('Failed to load whitelist', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const showMsg = (text, type = 'info') => {
        setMessage({ text: text.toUpperCase(), type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleApprove = async (e) => {
        e.preventDefault();
        if (!newEmail.trim()) return;

        let finalEmail = newEmail.trim();
        if (useCollegeDomain && !finalEmail.includes('@')) {
            finalEmail += COLLEGE_DOMAIN;
        }

        setActionLoading(true);
        try {
            await AuthService.approveEmail(finalEmail);
            showMsg('IDENTITY AUTHORIZED', 'success');
            setNewEmail('');
            fetchEmails();
        } catch (error) {
            showMsg(error.message, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRevoke = async (email) => {
        if (!window.confirm(`REVOKE ACCESS FOR ${email}?`)) return;

        setActionLoading(true);
        try {
            await AuthService.revokeEmail(email);
            showMsg('ACCESS PRIVILEGES REVOKED', 'success');
            fetchEmails();
        } catch (error) {
            showMsg(error.message, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const filteredEmails = useMemo(() => {
        return emails.filter(item => 
            item.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [emails, searchQuery]);

    const stats = {
        total: emails.length,
        newToday: emails.filter(e => {
            const date = new Date(e.createdAt);
            const today = new Date();
            return date.toDateString() === today.toDateString();
        }).length
    };

    return (
        <div className="min-h-screen bg-[#050505] text-slate-200 selection:bg-purple-500/30 font-sans">
            {/* Professional Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/10 blur-[120px] rounded-full opacity-50" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-900/10 blur-[120px] rounded-full opacity-50" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 md:py-12">
                {/* Header Section */}
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-10">
                    <div className="space-y-4">
                        <Logo size="sm" showSubtitle={false} className="!items-start opacity-90" />
                        <div>
                            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
                                Governance <span className="text-slate-500 font-normal">Console</span>
                            </h1>
                            <p className="text-slate-500 text-sm mt-1 font-mono uppercase tracking-wider">Access Rights Management System</p>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="px-5 py-3.5 bg-white/[0.03] border border-white/5 rounded-xl backdrop-blur-md"
                        >
                            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Authenticated</p>
                            <p className="text-xl font-bold text-white">{stats.total}</p>
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="px-5 py-3.5 bg-white/[0.03] border border-white/5 rounded-xl backdrop-blur-md"
                        >
                            <p className="text-[10px] font-mono text-purple-400 uppercase tracking-widest mb-1">New Sync</p>
                            <p className="text-xl font-bold text-white">{stats.newToday || 'N/A'}</p>
                        </motion.div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Control Panel (Left) */}
                    <div className="lg:col-span-4 space-y-6">
                        <section className="p-1 bg-gradient-to-br from-white/10 to-transparent rounded-[2rem]">
                            <div className="p-8 bg-[#0a0a0a] rounded-[1.9rem] backdrop-blur-3xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 blur-3xl -mr-16 -mt-16 group-hover:bg-purple-600/10 transition-all duration-500" />
                                
                                <div className="relative z-10 space-y-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                                            <UserPlus className="w-4 h-4 text-purple-400" />
                                        </div>
                                        <h2 className="text-sm font-semibold text-white tracking-wide">Grant Authorization</h2>
                                    </div>

                                    <form onSubmit={handleApprove} className="space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center px-1">
                                                <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Identity Identifier</label>
                                                <button 
                                                    type="button"
                                                    onClick={() => setUseCollegeDomain(!useCollegeDomain)}
                                                    className={`flex items-center gap-2 px-2 py-1 rounded-md transition-all border ${
                                                        useCollegeDomain ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-white/5 border-white/10 text-slate-500'
                                                    }`}
                                                >
                                                    <GraduationCap className="w-3 h-3" />
                                                    <span className="text-[9px] font-bold uppercase tracking-tighter">College Mode</span>
                                                </button>
                                            </div>
                                            
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder={useCollegeDomain ? "username" : "full-email@domain.com"}
                                                    className={`w-full bg-black/60 border rounded-xl px-5 py-4 text-sm font-mono outline-none transition-all text-white placeholder:text-slate-700 ${
                                                        useCollegeDomain ? 'border-purple-500/30 focus:border-purple-500/60 pr-32' : 'border-white/10 focus:border-white/30'
                                                    }`}
                                                    value={newEmail}
                                                    onChange={(e) => setNewEmail(e.target.value)}
                                                />
                                                {useCollegeDomain && (
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-purple-400/50 select-none bg-purple-500/5 px-2 py-1 rounded border border-purple-500/10">
                                                        {COLLEGE_DOMAIN}
                                                    </div>
                                                )}
                                            </div>
                                            {useCollegeDomain && (
                                                <p className="text-[10px] text-slate-500 italic px-1 font-mono">Just enter the college Roll No or ID prefix</p>
                                            )}
                                        </div>

                                        <button
                                            disabled={actionLoading}
                                            className="w-full py-4 bg-white text-black font-bold text-[11px] uppercase tracking-[0.2em] rounded-xl hover:bg-purple-500 hover:text-white active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl"
                                        >
                                            {actionLoading ? 'VERIFYING...' : 'AUTHORIZE ACCESS'}
                                        </button>
                                    </form>

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

                        <div className="p-6 border border-white/5 rounded-2xl bg-white/[0.01]">
                            <div className="flex gap-3 mb-4">
                                <Shield className="w-4 h-4 text-slate-500" />
                                <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Protocol Audit</h3>
                            </div>
                            <p className="text-[10px] text-slate-600 leading-relaxed font-mono">
                                // System Notice: All authorization events are cryptographically logged. Revocation is permanent until manually reinstated.
                            </p>
                        </div>
                    </div>

                    {/* Registry (Right) */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-6 z-20">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-white transition-colors" />
                                <input 
                                    type="text"
                                    placeholder="Filter authorized identities..."
                                    className="w-full bg-[#0a0a0a]/80 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm outline-none focus:border-white/10 focus:bg-white/[0.05] transition-all font-sans backdrop-blur-xl placeholder:text-slate-700"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 min-h-[500px]">
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="h-20 bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse" />
                                    ))}
                                </div>
                            ) : filteredEmails.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center py-32 space-y-4 rounded-3xl border border-dashed border-white/5"
                                >
                                    <div className="p-4 bg-white/5 rounded-full border border-white/5">
                                        <ShieldCheck className="w-8 h-8 text-slate-800" />
                                    </div>
                                    <p className="font-mono text-[11px] text-slate-600 uppercase tracking-[0.3em]">Vault is empty / No match</p>
                                </motion.div>
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {filteredEmails.map((item, index) => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            transition={{ duration: 0.2 }}
                                            key={item.email}
                                            className="group relative flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-black/40 rounded-xl border border-white/5 group-hover:border-purple-500/30 transition-colors">
                                                    <Mail className="w-4 h-4 text-slate-600 group-hover:text-purple-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{item.email}</p>
                                                    <div className="flex items-center gap-3 mt-1 opacity-40">
                                                        <span className="font-mono text-[9px] uppercase tracking-widest flex items-center gap-1.5">
                                                            <Clock className="w-3 h-3" />
                                                            Added {new Date(item.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRevoke(item.email)}
                                                className="p-2.5 rounded-xl border border-white/5 text-slate-600 hover:text-red-400 hover:bg-red-400/5 hover:border-red-400/20 transition-all opacity-0 group-hover:opacity-100"
                                                title="Revoke Permission"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
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
        </div>
    );
};

export default AdminPanel;
