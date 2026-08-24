import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthService } from '../services/authService';

export default function EmailVerification() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verify = async () => {
            try {
                const data = await AuthService.verifyEmail(token);
                setStatus('success');
                setMessage(data.message);
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } catch (err) {
                setStatus('error');
                setMessage(err.message || 'Verification failed. Link may be expired.');
            }
        };

        if (token) {
            verify();
        }
    }, [token, navigate]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[var(--bg)]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm text-center space-y-6"
            >
                <div className="space-y-2">
                    <p className="font-mono text-[9px] tracking-[0.3em] uppercase opacity-80">Security Protocol</p>
                    <h1 className="text-2xl font-bold tracking-tight uppercase">Identity Verification</h1>
                </div>

                <div className="p-8 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm">
                    {status === 'verifying' && (
                        <div className="space-y-4">
                            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
                            <p className="font-mono text-[10px] uppercase tracking-widest text-white/90">Decrypting Verification Token...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                                <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="font-mono text-[11px] uppercase tracking-widest text-white">Verification Complete</p>
                            <p className="font-mono text-[9px] text-white/80 leading-relaxed uppercase">
                                Your identity has been confirmed. Redirecting to terminal...
                            </p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <p className="font-mono text-[11px] uppercase tracking-widest text-red-500">Access Denied</p>
                            <p className="font-mono text-[9px] text-white/80 leading-relaxed uppercase">
                                {message}
                            </p>
                            <Link 
                                to="/login" 
                                className="block mt-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-mono text-[9px] uppercase tracking-widest transition-all"
                            >
                                Return to Terminal
                            </Link>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
