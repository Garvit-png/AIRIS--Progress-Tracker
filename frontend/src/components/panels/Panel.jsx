import React from 'react'

// Base panel wrapper so all panels are visually consistent
export default function Panel({ eyebrow, title, children, action, className = '' }) {
    return (
        <div
            className={`h-full rounded-xl p-5 flex flex-col gap-4 transition-all duration-500 ${className}`}
            style={{
                backgroundColor: 'var(--panel-bg)',
                border: '1px solid var(--border)',
                color: 'var(--text)'
            }}
        >
            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                    {eyebrow && (
                        <p className="font-mono text-[9px] tracking-[0.22em] uppercase" style={{ color: 'var(--text-muted)' }}>{eyebrow}</p>
                    )}
                    <h2 className="text-sm font-semibold tracking-tight" style={{ color: 'var(--text)' }}>{title}</h2>
                </div>
                {action}
            </div>
            {children}
        </div>
    )
}
