import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const STATS = [
    { label: 'Commits', target: 312, id: 'commits' },
    { label: 'PRs Merged', target: 47, id: 'prs' },
    { label: 'Study Hrs', target: 186, id: 'hours' },
    { label: 'AI Score', target: 863, id: 'score' },
]

function useCountUp(target, duration = 1200, delay = 0) {
    const [value, setValue] = useState(0)
    useEffect(() => {
        const t = setTimeout(() => {
            const start = Date.now()
            const tick = () => {
                const p = Math.min((Date.now() - start) / duration, 1)
                const ease = 1 - Math.pow(1 - p, 3)
                setValue(Math.round(target * ease))
                if (p < 1) requestAnimationFrame(tick)
            }
            requestAnimationFrame(tick)
        }, delay)
        return () => clearTimeout(t)
    }, [target, duration, delay])
    return value
}

function StatNum({ target, delay }) {
    const val = useCountUp(target, 1300, delay)
    return <>{val}</>
}

export default function StatPanel({ stats }) {
    const { totalStars = 0, repoCount = 0, followers = 0 } = stats || {}

    const displayStats = [
        { label: 'Total Stars', target: totalStars, id: 'stars' },
        { label: 'Repositories', target: repoCount, id: 'repos' },
        { label: 'Followers', target: followers, id: 'followers' },
    ]

    return (
        <div
            className="h-full rounded-xl p-5 flex flex-col gap-5 transition-all duration-500"
            style={{
                backgroundColor: 'var(--panel-bg)',
                border: '1px solid var(--border)',
                color: 'var(--text)'
            }}
        >
            {/* Mini core */}
            <div>
                <p className="font-mono text-[9px] tracking-[0.22em] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>AIRIS Core</p>
                <h2 className="text-sm font-semibold uppercase tracking-tight" style={{ color: 'var(--text)' }}>System Metrics</h2>
            </div>

            <div className="flex items-center justify-center py-4">
                <div className="relative w-20 h-20 flex items-center justify-center">
                    {/* Rings */}
                    {[80, 56, 36].map((size, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full"
                            style={{ width: size, height: size, border: '1px solid var(--border)' }}
                            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                            transition={{ duration: 6 + i * 4, repeat: Infinity, ease: 'linear' }}
                        />
                    ))}
                    {/* Core dot */}
                    <motion.div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: 'var(--text)', boxShadow: '0 0 15px rgba(var(--accent-rgb), 0.3)' }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 gap-3 flex-1">
                {displayStats.map((s, i) => (
                    <div
                        key={s.id}
                        className="rounded-lg p-4 flex flex-col gap-1 transition-all duration-500"
                        style={{
                            backgroundColor: 'rgba(var(--accent-rgb), 0.03)',
                            border: '1px solid var(--border)',
                            color: 'var(--text)'
                        }}
                    >
                        <span className="font-mono text-2xl font-bold tracking-tighter" style={{ color: 'var(--text)' }}>
                            <StatNum target={s.target} delay={300 + i * 150} />
                        </span>
                        <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                    </div>
                ))}
            </div>

            {/* Verification Status */}
            <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-green-500/50">
                            <path d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Sync Integrity</span>
                    </div>
                    <span className="font-mono text-[9px] text-green-500 font-bold tracking-widest uppercase">99.8%</span>
                </div>
                <div className="mt-2 h-[1px] rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                    <motion.div
                        className="h-full"
                        style={{ backgroundColor: 'var(--text)' }}
                        initial={{ width: 0 }}
                        animate={{ width: '99.8%' }}
                        transition={{ delay: 0.8, duration: 1.2 }}
                    />
                </div>
            </div>
        </div>
    )
}
