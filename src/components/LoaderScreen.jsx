import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Waves } from './Waves'
import { SystemAudio } from '../services/audioService'

const BOOT_LINES = [
    { text: 'Mounting workspace...', delay: 0 },
    { text: 'Syncing repositories...', delay: 350 },
    { text: 'Loading modules...', delay: 680 },
    { text: 'Authenticating session...', delay: 1000 },
    { text: 'All systems operational.', delay: 1300, bold: true },
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

    // Show boot lines one by one
    useEffect(() => {
        if (!isBooted) return

        BOOT_LINES.forEach((line, i) => {
            setTimeout(() => {
                setLines(prev => [...prev, line])
                SystemAudio.playDataTick()
            }, line.delay)
        })

        // Progress bar fills over 1.5s
        const start = Date.now()
        const duration = 1500
        const tick = () => {
            const p = Math.min((Date.now() - start) / duration, 1)
            const currentProgress = Math.round(p * 100)
            setProgress(currentProgress)
            SystemAudio.updateSweep(currentProgress)
            if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)

        // Show "SYSTEM ONLINE" at 1.5s
        setTimeout(() => setShowSystem(true), 1500)

        // Start exit at 2.2s
        setTimeout(() => {
            setExiting(true)
            SystemAudio.stopAmbience() // Stop sound as we exit
            setTimeout(onComplete, 500)
        }, 2200)
    }, [isBooted, onComplete])

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
                    <Waves strokeColor="rgba(255,255,255,0.3)" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative z-10 flex flex-col items-center"
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
                            className="absolute inset-0 bg-white/10 blur-3xl rounded-full"
                        />

                        <motion.button
                            onClick={handleBoot}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="group relative px-12 py-5 border rounded-full overflow-hidden transition-all duration-500 backdrop-blur-xl bg-white/5"
                            style={{ borderColor: 'rgba(255,255,255,0.4)' }}
                        >
                            <span className="relative z-10 font-mono text-[11px] tracking-[0.5em] text-white uppercase group-hover:text-white transition-colors duration-300">
                                Initialize Link
                            </span>

                            {/* Hover Fill */}
                            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500" />

                            {/* Inner Shine */}
                            <div className="absolute -inset-4 bg-white/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        </motion.button>

                        <motion.h1
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-10 font-mono text-2xl tracking-[1.5em] text-white/40 uppercase pl-[1.5em]"
                        >
                            A I R I S
                        </motion.h1>

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
                                className="h-full bg-white"
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
                                    className="text-3xl font-bold text-white tracking-tight"
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
