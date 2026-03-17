import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ShaderBackground from './ShaderBackground'
import { SystemAudio } from '../services/audioService'

const BOOT_LINES = [
    { text: 'Mounting workspace...', delay: 0 },
    { text: 'Syncing repositories...', delay: 150 },
    { text: 'Loading modules...', delay: 300 },
    { text: 'Authenticating session...', delay: 450 },
    { text: 'All systems operational.', delay: 600, bold: true },
]

export default function LoaderScreen({ onComplete, user }) {
    const [isBooted, setIsBooted] = useState(false)
    const [lines, setLines] = useState([])
    const [progress, setProgress] = useState(0)
    const [showSystem, setShowSystem] = useState(false)
    const [exiting, setExiting] = useState(false)

    const welcomeName = user?.name || 'Operator'

    const handleBoot = () => {
        setIsBooted(true)
        SystemAudio.startAmbience()
    }

    // Unified boot sequence
    useEffect(() => {
        if (!isBooted) return;

        let active = true;
        const timers = [];

        // Progress bar and audio sweep logic
        const duration = 600;
        const startTime = Date.now();
        
        const tick = () => {
            if (!active) return;
            const elapsed = Date.now() - startTime;
            const p = Math.min(elapsed / duration, 1);
            const currentProgress = Math.round(p * 100);
            
            setProgress(currentProgress);
            SystemAudio.updateSweep(currentProgress);
            
            if (p < 1) requestAnimationFrame(tick);
            else setShowSystem(true);
        };
        requestAnimationFrame(tick);

        // Boot lines sequence
        BOOT_LINES.forEach((line) => {
            const t = setTimeout(() => {
                if (active) {
                    setLines(prev => [...prev, line]);
                    SystemAudio.playDataTick();
                }
            }, line.delay);
            timers.push(t);
        });

        // Exit sequence
        const exitTimer = setTimeout(() => {
            if (active) {
                setExiting(true);
                SystemAudio.stopAmbience();
                const completeTimer = setTimeout(onComplete, 400);
                timers.push(completeTimer);
            }
        }, 1800);
        timers.push(exitTimer);

        return () => {
            active = false;
            timers.forEach(clearTimeout);
        };
    }, [isBooted, onComplete]);

    return (
        <AnimatePresence mode="wait">
            {!isBooted ? (
                <motion.div
                    key="boot-trigger"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[60]"
                >
                    <ShaderBackground />

                    {/* Top Left Logo */}
                    <div className="fixed top-8 left-8 z-[70]">
                        <motion.img 
                            src="/logo.png" 
                            alt="AIRIS Logo" 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="h-16 w-auto object-contain"
                            style={{ mixBlendMode: 'screen' }}
                        />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative z-10 flex flex-col items-center translate-y-12"
                    >
                        {/* Outer Glow Pulse */}
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.6, 0.3]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute inset-0 bg-[#FF0D99]/10 blur-3xl rounded-full"
                        />

                        <motion.h1
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mb-1 font-mono text-2xl tracking-[1.5em] text-white uppercase pl-[1.5em]"
                        >
                            A I R I S
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mb-10 font-mono text-[9px] font-bold tracking-[1.2em] text-white uppercase pl-[1.2em]"
                        >
                            AI Research & Innovation Society
                        </motion.p>

                        <motion.button
                            onClick={handleBoot}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className="group relative px-12 py-5 border border-white/20 hover:border-[#FF0D99] rounded-full overflow-hidden transition-all duration-100 backdrop-blur-xl bg-black/40"
                        >
                            <span className="relative z-10 font-mono text-[11px] font-bold tracking-[0.5em] text-white uppercase transition-colors duration-300">
                                INITIALISE LINK
                            </span>

                            {/* Hover Fill */}
                            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity duration-100" />

                            {/* Inner Shine */}
                            <div className="absolute -inset-4 bg-white/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                        </motion.button>

                    </motion.div>
                </motion.div>
            ) : !exiting ? (
                <motion.div
                    key="loader"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.03 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 select-none"
                >
                    <div className="mb-10 text-center">
                        <p className="font-mono text-[10px] tracking-[0.3em] text-white/30 uppercase mb-1">
                            Tech Club Portal
                        </p>
                        <h1 className="text-4xl font-bold tracking-tight text-white">
                            AIRIS
                        </h1>
                    </div>

                    <div className="w-[340px] mb-8 space-y-1.5">
                        {lines.map((line, i) => (
                            <motion.p
                                key={i}
                                initial={{ opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                                className={`font-mono text-[11px] tracking-wider ${line.bold ? 'text-white font-semibold' : 'text-white/40'}`}
                            >
                                <span className="text-white/20 mr-2">›</span>
                                {line.text}
                            </motion.p>
                        ))}
                    </div>

                    <div className="w-[340px] mb-3">
                        <div className="h-[1px] bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-[#FF0D99]"
                                animate={{ width: `${progress}%` }}
                                transition={{ ease: 'linear', duration: 0.05 }}
                            />
                        </div>
                    </div>

                    <p className="font-mono text-[10px] text-white/25 tracking-widest">
                        {progress}%
                    </p>

                    <AnimatePresence>
                        {showSystem && (
                            <motion.div
                                key="online"
                                initial={{ opacity: 0, scale: 0.94 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="absolute inset-0 flex flex-col items-center justify-center bg-black"
                            >
                                <motion.p
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05, duration: 0.3 }}
                                    className="font-mono text-[10px] tracking-[0.35em] text-white/40 uppercase mb-2"
                                >
                                    System Online
                                </motion.p>
                                <motion.h2
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15, duration: 0.35 }}
                                    className="text-3xl font-bold text-[#FF0D99] tracking-tight"
                                >
                                    Welcome, {welcomeName}.
                                </motion.h2>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            ) : null}
        </AnimatePresence>
    )
}
