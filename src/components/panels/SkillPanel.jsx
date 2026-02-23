import React from 'react'
import { motion } from 'framer-motion'

export default function SkillPanel() {
    const SKILLS = ['React', 'Tailwind', 'Motion', 'Node.js']
    return (
        <div
            className="h-full rounded-xl p-5 flex flex-col transition-all duration-500"
            style={{
                backgroundColor: 'var(--panel-bg)',
                border: '1px solid var(--border)',
                color: 'var(--text)'
            }}
        >
            <div className="mb-4">
                <p className="font-mono text-[9px] tracking-[0.22em] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Intelligence</p>
                <h2 className="text-sm font-semibold uppercase tracking-tight">Skills Matrix</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 flex-1">
                {SKILLS.map((skill, i) => (
                    <div
                        key={skill}
                        className="rounded-lg p-3 transition-all duration-500"
                        style={{ border: '1px solid var(--border)', backgroundColor: 'rgba(var(--accent-rgb), 0.03)' }}
                    >
                        <p className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>{skill}</p>
                        <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(var(--text-rgb), 0.1)' }}>
                            <motion.div
                                className="h-full"
                                style={{ backgroundColor: 'var(--text)' }}
                                initial={{ width: 0 }}
                                animate={{ width: '80%' }}
                                transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
