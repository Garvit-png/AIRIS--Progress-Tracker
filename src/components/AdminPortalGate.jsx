import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldAlert, ShieldCheck, Lock, Unlock, ArrowRight, X } from 'lucide-react';
import { AuthService } from '../services/authService';

export default function AdminPortalGate({ isOpen, onClose, onUnlock }) {
    const [status, setStatus] = useState('checking'); // checking, set-password, enter-password
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            checkStatus();
        }
    }, [isOpen]);

    const checkStatus = async () => {
        setStatus('checking');
        try {
            const data = await AuthService.getPortalStatus();
            if (data.success) {
                setStatus(data.isSet ? 'enter-password' : 'set-password');
            } else {
                setError('Failed to reach security server');
            }
        } catch (err) {
            setError('Connection failed');
        }
    };

    const handleAction = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (status === 'set-password') {
                await AuthService.setupPortalPassword(password);
                setStatus('enter-password');
                setPassword('');
                // Let the user know they need to enter it now
            } else {
                await AuthService.verifyPortalPassword(password);
                onUnlock();
            }
        } catch (err) {
            setError(err.message || 'Action failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-md bg-[#0a0a0a] border border-pink-500/20 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(255,13,153,0.1)]"
                >
                    {/* Header Decorative */}
                    <div className="h-32 bg-gradient-to-br from-pink-600/10 via-transparent to-transparent relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20" style={{ 
                            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)',
                            backgroundSize: '24px 24px' 
                        }} />
                        <button 
                            onClick={onClose}
                            className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all z-10"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="px-8 pb-10 -mt-10 relative z-10 flex flex-col items-center text-center">
                        <div className={`w-20 h-20 rounded-3xl mb-6 flex items-center justify-center shadow-2xl ring-1 ring-white/10 transition-all duration-500 ${
                            status === 'checking' ? 'bg-white/5 border-white/20 animate-pulse' :
                            status === 'set-password' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                            'bg-pink-500/10 border-pink-500/20 text-pink-400'
                        }`}>
                            {status === 'checking' && <Shield size={32} />}
                            {status === 'set-password' && <ShieldAlert size={32} />}
                            {status === 'enter-password' && <Lock size={32} />}
                        </div>

                        <div className="space-y-2 mb-8">
                            <h2 className="text-xl font-bold text-white tracking-tight">
                                {status === 'checking' ? 'Security Handshake' :
                                 status === 'set-password' ? 'Initial Protocol Setup' : 'Restricted Access'}
                            </h2>
                            <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em]">
                                {status === 'checking' ? 'Verifying system integrity...' :
                                 status === 'set-password' ? 'Establish Master Portal Key' : 'Enter Admin Authorization Cipher'}
                            </p>
                        </div>

                        {status !== 'checking' && (
                            <form onSubmit={handleAction} className="w-full space-y-6">
                                <div className="space-y-2 relative">
                                    <input 
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={status === 'set-password' ? 'New Security Key' : 'Security Key'}
                                        autoFocus
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm font-mono text-center focus:border-pink-500/40 focus:ring-1 focus:ring-pink-500/20 outline-none transition-all text-white placeholder:text-white/20"
                                    />
                                    {error && (
                                        <motion.p 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-[9px] font-mono text-red-400 uppercase tracking-widest pt-2"
                                        >
                                            {error}
                                        </motion.p>
                                    )}
                                </div>

                                <button 
                                    type="submit"
                                    disabled={loading || !password}
                                    className="w-full h-14 bg-white text-black rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 transition-all hover:bg-pink-500 hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black group shadow-xl"
                                >
                                    {loading ? 'Processing...' : (
                                        <>
                                            {status === 'set-password' ? 'Initialize' : 'Authorize'}
                                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        <p className="mt-8 text-[8px] font-mono text-white/20 uppercase tracking-[0.3em]">
                            Secondary Authentication Layer Active
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
