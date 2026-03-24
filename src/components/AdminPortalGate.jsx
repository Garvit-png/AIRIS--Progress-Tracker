import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthService } from '../services/authService';
import { Shield, Lock, KeyRound, X, ArrowRight } from 'lucide-react';

const PIN_LENGTH = 4;

export default function AdminPortalGate({ isOpen, onClose, onUnlock }) {
    const [status, setStatus] = useState('checking'); // checking, setup-1, setup-2, setup-3, enter-pin
    const [pins, setPins] = useState(['', '', '', '']);
    const [setupPins, setSetupPins] = useState({ first: '', second: '', third: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef([]);

    useEffect(() => {
        if (isOpen) {
            checkStatus();
        } else {
            resetState();
        }
    }, [isOpen]);

    const resetState = () => {
        setPins(['', '', '', '']);
        setSetupPins({ first: '', second: '', third: '' });
        setError('');
        setLoading(false);
    };

    const checkStatus = async () => {
        try {
            const data = await AuthService.getPortalStatus();
            setStatus(data.isSet ? 'enter-pin' : 'setup-1');
        } catch (err) {
            setError('Failed to reach security server');
        }
    };

    const handlePinChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        
        const newPins = [...pins];
        newPins[index] = value.slice(-1);
        setPins(newPins);
        setError('');

        if (value && index < PIN_LENGTH - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !pins[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    useEffect(() => {
        if (pins.every(p => p !== '')) {
            const timer = setTimeout(() => {
                handleSubmit();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [pins]);

    const handleSubmit = async () => {
        const pinString = pins.join('');
        setLoading(true);
        setError('');

        try {
            if (status === 'setup-1') {
                setSetupPins(prev => ({ ...prev, first: pinString }));
                setStatus('setup-2');
                setPins(['', '', '', '']);
                inputRefs.current[0]?.focus();
            } else if (status === 'setup-2') {
                if (pinString !== setupPins.first) {
                    setError('PINs do not match. Restarting setup...');
                    setStatus('setup-1');
                    setSetupPins({ first: '', second: '', third: '' });
                } else {
                    setSetupPins(prev => ({ ...prev, second: pinString }));
                    setStatus('setup-3');
                }
                setPins(['', '', '', '']);
                inputRefs.current[0]?.focus();
            } else if (status === 'setup-3') {
                if (pinString !== setupPins.first) {
                    setError('Verification failed. Restarting setup...');
                    setStatus('setup-1');
                    setSetupPins({ first: '', second: '', third: '' });
                } else {
                    await AuthService.setupPortalPassword(pinString);
                    setStatus('enter-pin');
                }
                setPins(['', '', '', '']);
                inputRefs.current[0]?.focus();
            } else if (status === 'enter-pin') {
                await AuthService.verifyPortalPassword(pinString);
                onUnlock();
            }
        } catch (err) {
            setError(err.message || 'Verification failed');
            setPins(['', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const getInstruction = () => {
        switch (status) {
            case 'setup-1': return 'Create 4-Digit Security PIN';
            case 'setup-2': return 'Confirm Security PIN';
            case 'setup-3': return 'Final Verification';
            case 'enter-pin': return 'Enter Admin Security PIN';
            default: return 'Authorizing...';
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                    onClick={onClose}
                />
                
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-sm bg-[#0A0A0A] border border-white/10 rounded-[40px] shadow-2xl p-10"
                >
                    {/* Minimalist Brading */}
                    <div className="flex flex-col items-center text-center mb-12">
                        <div className="w-20 h-20 bg-pink-500/10 rounded-[32px] flex items-center justify-center mb-8 border border-pink-500/20 shadow-[0_0_30px_rgba(255,13,153,0.1)]">
                            {status.includes('setup') ? (
                                <KeyRound className="text-pink-500" size={36} />
                            ) : (
                                <Lock className="text-pink-500" size={36} />
                            )}
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-white mb-3">
                            {getInstruction()}
                        </h2>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                            <Shield size={10} className="text-pink-500" />
                            <span className="text-white/30 text-[9px] font-mono uppercase tracking-[0.2em]">
                                Level 4 Clearance
                            </span>
                        </div>
                    </div>

                    {/* PIN Input blocks */}
                    <div className="flex justify-center gap-4 mb-12">
                        {pins.map((pin, i) => (
                            <motion.input
                                key={i}
                                ref={el => inputRefs.current[i] = el}
                                type="password"
                                inputMode="numeric"
                                value={pin}
                                onChange={(e) => handlePinChange(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                disabled={loading}
                                className={`w-14 h-20 bg-white/[0.03] border ${pin ? 'border-pink-500/50 bg-pink-500/5' : 'border-white/10'} rounded-2xl text-center text-3xl font-bold text-white outline-none transition-all focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 disabled:opacity-50`}
                                initial={false}
                                animate={pin ? { scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] } : {}}
                                transition={{ duration: 0.2 }}
                            />
                        ))}
                    </div>

                    {/* Feedback Messages */}
                    <div className="h-10 mb-8 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            {error ? (
                                <motion.div 
                                    key="error"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="text-red-500 text-[10px] font-mono uppercase tracking-[0.2em] text-center"
                                >
                                    {error}
                                </motion.div>
                            ) : loading ? (
                                <motion.div 
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-2 text-pink-500/60 font-mono text-[9px] uppercase tracking-[0.3em] animate-pulse"
                                >
                                    Engaging Security Handshake
                                </motion.div>
                            ) : status.includes('setup') ? (
                                <motion.div 
                                    key="setup-progress"
                                    className="flex gap-2"
                                >
                                    {[1, 2, 3].map(step => (
                                        <div 
                                            key={step}
                                            className={`h-1.5 rounded-full transition-all duration-500 ${
                                                status === `setup-${step}` ? 'w-8 bg-pink-500' : 'w-2 bg-white/10'
                                            }`}
                                        />
                                    ))}
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </div>

                    {/* Exit Action */}
                    <div className="text-center">
                        <button 
                            onClick={onClose}
                            className="text-white/20 hover:text-white/60 text-[10px] font-mono uppercase tracking-[0.4em] transition-all hover:tracking-[0.5em]"
                        >
                            Decline Access
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
