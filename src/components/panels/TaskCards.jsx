import React from 'react'
import { motion } from 'framer-motion'
import Panel from './Panel'

const TASKS = [
    { name: 'Build AI Recommendation Engine', tag: 'AI', pct: 72, active: true, due: 'Feb 25' },
    { name: 'Integrate GitHub Actions CI/CD', tag: 'DEV', pct: 44, active: false, due: 'Mar 1' },
    { name: 'Complete ML Specialization', tag: 'LEARN', pct: 61, active: false, due: 'Mar 10' },
    { name: 'Refactor API Gateway Layer', tag: 'DEV', pct: 88, active: true, due: 'Feb 24' },
]

export default function TaskCards() {
    return (
        <Panel eyebrow="Sprint Tracker" title="Active Tasks"
            action={
                <button
                    className="font-mono text-[9px] border rounded px-2 py-1 transition-all"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                >
                    + New
                </button>
            }
        >
            <div className="flex flex-col gap-2">
                {TASKS.map((task, i) => (
                    <div
                        key={i}
                        className={`rounded-lg p-3 border transition-all duration-500`}
                        style={{
                            borderColor: task.active ? 'rgba(var(--accent-rgb), 0.2)' : 'var(--border)',
                            backgroundColor: task.active ? 'rgba(var(--accent-rgb), 0.04)' : 'transparent'
                        }}
                    >
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-xs font-medium leading-snug" style={{ color: 'var(--text)' }}>{task.name}</p>
                            <span
                                className={`font-mono text-[8px] px-1.5 py-0.5 rounded border flex-shrink-0 transition-colors duration-500`}
                                style={{
                                    borderColor: 'var(--border)',
                                    color: task.active ? 'var(--text)' : 'var(--text-muted)',
                                    backgroundColor: task.active ? 'rgba(var(--accent-rgb), 0.1)' : 'transparent'
                                }}
                            >
                                {task.tag}
                            </span>
                        </div>
                        {/* Progress bar */}
                        <div className="h-[2px] rounded-full overflow-hidden mb-1.5" style={{ backgroundColor: 'rgba(var(--text-rgb), 0.08)' }}>
                            <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: 'var(--text)' }}
                                initial={{ width: 0 }}
                                animate={{ width: `${task.pct}%` }}
                                transition={{ delay: 0.4 + i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                            />
                        </div>
                        <div className="flex justify-between">
                            <span className="font-mono text-[9px]" style={{ color: 'var(--text-muted)' }}>{task.pct}%</span>
                            <span className="font-mono text-[9px]" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>Due {task.due}</span>
                        </div>
                    </div>
                ))}
            </div>
        </Panel>
    )
}
