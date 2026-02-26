import React from 'react'

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

            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/5 rounded-lg">
                <p className="font-mono text-[10px] uppercase tracking-widest opacity-20">No Timeline Data</p>
            </div>
        </div>
    )
}
