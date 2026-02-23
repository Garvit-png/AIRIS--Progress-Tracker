import React from 'react'
import { motion } from 'framer-motion'

export default function ActivityLog({ events }) {
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
                <p className="font-mono text-[9px] tracking-[0.22em] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Live Feed</p>
                <h2 className="text-sm font-semibold uppercase tracking-tight">System Activity</h2>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
                {!events || events.length === 0 ? (
                    <p className="font-mono text-[10px] italic uppercase tracking-widest text-center mt-10" style={{ color: 'var(--text-muted)' }}>NO SIGNAL DETECTED</p>
                ) : (
                    events.map((event, i) => (
                        <div key={event.id || i} className="flex flex-col gap-1 border-b pb-2 last:border-0" style={{ borderColor: 'var(--border)' }}>
                            <div className="flex justify-between items-center">
                                <span className={`font-mono text-[8px] uppercase tracking-widest transition-colors duration-500 ${event.type === 'PushEvent' ? 'text-green-500/70' :
                                    event.type === 'CreateEvent' ? 'text-blue-500/70' :
                                        'opacity-40'
                                    }`}>
                                    {event.type?.replace('Event', '') || 'SIGNAL'}
                                </span>
                                <span className="font-mono text-[8px]" style={{ color: 'var(--text-muted)' }}>{event.time}</span>
                            </div>
                            <p className="font-mono text-[10px] leading-relaxed uppercase transition-colors duration-500" style={{ color: 'var(--text)' }}>
                                <span className="opacity-20 mr-1.5">{'>'}</span>{event.message}
                            </p>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-4 pt-3 border-t flex items-center justify-between transition-colors duration-500" style={{ borderColor: 'var(--border)' }}>
                <span className="font-mono text-[8px] uppercase" style={{ color: 'var(--text-muted)' }}>Encryption: AES-256</span>
                <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            </div>
        </div>
    )
}
