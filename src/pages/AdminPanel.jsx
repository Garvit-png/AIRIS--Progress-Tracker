import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthService } from '../services/authService';
import { Search, UserPlus, Shield, X, ShieldCheck, Clock, UserCheck } from 'lucide-react';
import Logo from '../components/Logo';

const AdminPanel = () => {
    const [emails, setEmails] = useState([]);
    const [newEmail, setNewEmail] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

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

        setActionLoading(true);
        try {
            await AuthService.approveEmail(newEmail);
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
        <div className="min-h-screen bg-[#0d0d0d] text-white selection:bg-[#FF0D99]/30">
            {/* Immersive Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FF0D99]/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00F2FF]/5 blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 contrast-150" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 md:py-20">
                {/* Header Section */}
                <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-6">
                        <div className="flex justify-start">
                            <Logo size="sm" showSubtitle={false} className="items-start" />
                        </div>
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-7xl font-bold tracking-tighter"
                        >
                            ACCESS <span className="text-white/20 italic font-light">CONTROL</span>
                        </motion.h1>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl min-w-[140px]"
                        >
                            <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1">Total Identities</p>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl min-w-[140px]"
                        >
                            <p className="text-[10px] font-mono text-[#00F2FF] uppercase tracking-widest mb-1">Active Now</p>
                            <p className="text-2xl font-bold">{stats.newToday || 'Stable'}</p>
                        </motion.div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Control Panel (Left) */}
                    <div className="lg:col-span-4 space-y-8">
                        <section className="p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF0D99]/10 blur-3xl -mr-16 -mt-16 group-hover:bg-[#FF0D99]/20 transition-all duration-500" />
                            
                            <div className="relative z-10 space-y-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[#FF0D99]/20 rounded-lg">
                                        <UserPlus className="w-4 h-4 text-[#FF0D99]" />
                                    </div>
                                    <h2 className="font-mono text-[12px] uppercase tracking-[0.2em] font-bold">New Authorization</h2>
                                </div>

                                <form onSubmit={handleApprove} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="font-mono text-[9px] text-white/30 uppercase tracking-widest ml-1">Target Identifier</label>
                                        <input
                                            type="email"
                                            placeholder="IDENTIFIER@AIRIS.SYS"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm font-mono outline-none focus:border-[#FF0D99]/50 focus:ring-1 focus:ring-[#FF0D99]/20 transition-all text-white placeholder:text-white/10"
                                            value={newEmail}
                                            onChange={(e) => setNewEmail(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        disabled={actionLoading}
                                        className="w-full py-4 bg-white text-black font-bold text-[11px] uppercase tracking-[0.3em] rounded-xl hover:bg-[#FF0D99] hover:text-white active:scale-[0.98] transition-all disabled:opacity-50 shadow-2xl shadow-black/50"
                                    >
                                        {actionLoading ? 'PROCESSING...' : 'GRANT ACCESS'}
                                    </button>
                                </form>

                                <AnimatePresence>
                                    {message.text && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className={`p-4 rounded-xl font-mono text-[10px] text-center tracking-widest border backdrop-blur-md ${
                                                message.type === 'error' ? 'border-red-500/30 bg-red-500/10 text-red-400' : 'border-green-500/30 bg-green-500/10 text-green-400'
                                            }`}
                                        >
                                            {message.text}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </section>

                        <div className="p-6 border border-white/5 rounded-3xl bg-white/[0.02]">
                            <p className="font-mono text-[9px] text-white/20 leading-relaxed uppercase">
                                System Notice: All authorization grants are logged. Revoking access will immediately disable system entry for the target identifier.
                            </p>
                        </div>
                    </div>

                    {/* Registry (Right) */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                <input 
                                    type="text"
                                    placeholder="Filter authorized identities..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm outline-none focus:border-[#FF0D99]/30 focus:bg-white/[0.08] transition-all font-mono placeholder:text-white/20"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-3 min-h-[500px]">
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="h-20 bg-white/5 border border-white/5 rounded-2xl animate-pulse" />
                                    ))}
                                </div>
                            ) : filteredEmails.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center py-32 space-y-4 rounded-3xl border border-dashed border-white/10"
                                >
                                    <div className="p-4 bg-white/5 rounded-full">
                                        <ShieldCheck className="w-8 h-8 text-white/10" />
                                    </div>
                                    <p className="font-mono text-[11px] text-white/20 uppercase tracking-[0.3em]">No matching records found</p>
                                </motion.div>
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {filteredEmails.map((item, index) => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                            key={item.email}
                                            className="group relative flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-[#FF0D99]/30 hover:bg-white/[0.08] transition-all duration-300 backdrop-blur-sm"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="hidden sm:flex flex-col items-center justify-center p-3 bg-white/5 rounded-xl border border-white/5 group-hover:bg-[#FF0D99]/10 group-hover:border-[#FF0D99]/20 transition-colors">
                                                    <UserCheck className="w-4 h-4 text-white/40 group-hover:text-[#FF0D99]" />
                                                </div>
                                                <div>
                                                    <p className="text-lg font-bold tracking-tight text-white group-hover:text-[#FF0D99] transition-colors">{item.email}</p>
                                                    <div className="flex items-center gap-4 mt-1.5 opacity-40">
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="w-3 h-3" />
                                                            <span className="font-mono text-[9px] uppercase tracking-widest">
                                                                Authorized {new Date(item.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRevoke(item.email)}
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/0 hover:bg-red-500/10 text-white/5 hover:text-red-500 border border-transparent hover:border-red-500/20 transition-all font-mono text-[10px] uppercase tracking-widest active:scale-95"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                                <span className="hidden sm:inline">Revoke Access</span>
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Global Overlay for Loading states */}
            {actionLoading && (
                <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm cursor-wait pointer-events-auto" />
            )}
        </div>
    );
};

export default AdminPanel;
