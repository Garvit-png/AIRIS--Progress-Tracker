import React from 'react'
import Panel from './Panel'

export default function TaskCards() {
    return (
        <Panel eyebrow="Sprint Tracker" title="Active Tasks">
            <div className="flex flex-col gap-2 min-h-[100px] items-center justify-center border-2 border-dashed border-white/5 rounded-lg">
                <p className="font-mono text-[10px] uppercase tracking-widest opacity-20">No Tasks Initialized</p>
            </div>
        </Panel>
    )
}
