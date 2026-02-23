import React from 'react'
import { motion } from 'framer-motion'

export default function Timeline() {
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
                <p className="font-mono text-[9px] tracking-[0.22em] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Status</p>
                <h2 className="text-sm font-semibold uppercase tracking-tight">Timeline</h2>
            </div>

            <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1">
                {[1, 2, 3].map((_, i) => (
                    <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--text-muted)', opacity: 0.4 }} />
                            <div className="w-[1px] flex-1 my-1" style={{ backgroundColor: 'var(--border)' }} />
                        </div>
                        <div className="pb-4">
                            <p className="font-mono text-[10px]" style={{ color: 'var(--text-muted)', opacity: 0.4 }}>09:00 AM</p>
                            <p className="text-xs font-medium uppercase tracking-tight" style={{ color: 'var(--text)', opacity: 0.7 }}>System Initialization {i}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
