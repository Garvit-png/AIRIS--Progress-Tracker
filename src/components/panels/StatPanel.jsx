import React from 'react'

export default function StatPanel() {
    return (
        <div
            className="h-full rounded-xl p-5 flex flex-col gap-5 transition-all duration-500"
            style={{
                backgroundColor: 'var(--panel-bg)',
                border: '1px solid var(--border)',
                color: 'var(--text)'
            }}
        >
            <div>
                <p className="font-mono text-[9px] tracking-[0.22em] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>AIRIS Core</p>
                <h2 className="text-sm font-semibold uppercase tracking-tight" style={{ color: 'var(--text)' }}>System Metrics</h2>
            </div>

            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/5 rounded-lg min-h-[200px]">
                <p className="font-mono text-[10px] uppercase tracking-widest opacity-20">Metrics Offline</p>
            </div>
        </div>
    )
}
