import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthService } from '../services/authService';
import Logo from '../components/Logo';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState('idle'); // idle, processing, success, error, redirecting
    const [message, setMessage] = useState('');

    React.useEffect(() => {
        const channel = new BroadcastChannel('airis_auth_channel');
        let timer;

        // Listen for "TAB_EXISTS" response
        channel.onmessage = (event) => {
            if (event.data.type === 'TAB_EXISTS') {
                // If another tab exists, redirect it and close this one
                setStatus('redirecting');
                channel.postMessage({ type: 'REDIRECT_TO_RESET', token });
                
                // Give a tiny buffer for message to send before closing
                setTimeout(() => {
                    window.close();
                    // Fallback if window.close() is blocked (which it often is for non-script-opened tabs)
                    setStatus('idle');
                    setMessage('Please check your other AIRIS tab.');
                }, 500);
            }
        };

        // Probe for other tabs
        channel.postMessage({ type: 'CHECK_EXISTING_TAB' });

        return () => channel.close();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setStatus('error');
            setMessage('Password must be at least 6 characters');
            return;
        }

        setStatus('processing');
        try {
            await AuthService.resetPassword(token, password);
            setStatus('success');
            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setStatus('error');
            setMessage(err.message || 'Failed to reset password. Link may be expired.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[var(--bg)]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm"
            >
                <div className="mb-10 text-center">
                    <Logo size="md" />
                </div>

                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <p className="font-mono text-[9px] tracking-[0.3em] uppercase opacity-40">Security Protocol</p>
                        <h1 className="text-2xl font-bold tracking-tight uppercase text-white">Reset Password</h1>
                    </div>

                    <div className="p-8 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm">
                        {status === 'redirecting' ? (
                            <div className="space-y-4 text-center">
                                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
                                <p className="font-mono text-[11px] uppercase tracking-widest text-white">Already Open</p>
                                <p className="font-mono text-[9px] text-white/40 leading-relaxed uppercase">
                                    Transferring session to your active terminal...
                                </p>
                            </div>
                        ) : status === 'success' ? (
                            <div className="space-y-4 text-center">
                                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                                    <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="font-mono text-[11px] uppercase tracking-widest text-white">Password Updated</p>
                                <p className="font-mono text-[9px] text-white/40 leading-relaxed uppercase">
                                    Your password has been successfully reset. Redirecting to terminal...
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="font-mono text-[9px] uppercase tracking-widest opacity-30 mb-1.5 block">New Password</label>
                                    <input
                                        type="password"
                                        autoFocus
                                        placeholder="Min 6 characters"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-white/30 transition-all font-mono text-white"
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); if(status === 'error') setStatus('idle'); }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="font-mono text-[9px] uppercase tracking-widest opacity-30 mb-1.5 block">Confirm Password</label>
                                    <input
                                        type="password"
                                        placeholder="Repeat new password"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-white/30 transition-all font-mono text-white"
                                        value={confirmPassword}
                                        onChange={(e) => { setConfirmPassword(e.target.value); if(status === 'error') setStatus('idle'); }}
                                        required
                                    />
                                </div>

                                {status === 'error' && (
                                    <p className="font-mono text-[9px] text-red-500 uppercase tracking-widest text-center">
                                        {message}
                                    </p>
                                )}

                                <button 
                                    disabled={status === 'processing'}
                                    className="w-full py-3 bg-white text-black font-bold text-[10px] uppercase tracking-widest rounded-lg hover:invert transition-all disabled:opacity-50"
                                >
                                    {status === 'processing' ? 'Updating...' : 'Reset Password'}
                                </button>
                                
                                <Link 
                                    to="/login" 
                                    className="block text-center font-mono text-[9px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors mt-4"
                                >
                                    Return to Login
                                </Link>
                            </form>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
