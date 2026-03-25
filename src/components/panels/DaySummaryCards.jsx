import React from 'react';

export default function DaySummaryCards({ data, completedCount }) {
    return (
        <div className="grid grid-cols-3 gap-3">
            <div className="p-3 pb-2 rounded-lg bg-[#111113] border-l-4 border-white/20 border-y border-r border-white/5 transition-all hover:bg-white/[0.02]">
                <p className="text-[10px] uppercase font-bold tracking-[0.08em] text-white/30 mb-1">Tasks</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-white leading-none">{data.tasks.length}</span>
                </div>
            </div>
            <div className="p-3 pb-2 rounded-lg bg-[#111113] border-l-4 border-[#1D9E75] border-y border-r border-white/5 transition-all hover:bg-white/[0.02]">
                <p className="text-[10px] uppercase font-bold tracking-[0.08em] text-[#1D9E75]/40 mb-1">Completed</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-[#1D9E75] leading-none">{completedCount}</span>
                </div>
            </div>
            <div className="p-3 pb-2 rounded-lg bg-[#111113] border-l-4 border-[#FF2D78] border-y border-r border-white/5 transition-all hover:bg-white/[0.02]">
                <p className="text-[10px] uppercase font-bold tracking-[0.08em] text-[#FF2D78]/40 mb-1">Proofs</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-[#FF2D78] leading-none">{data.proofs.length}</span>
                </div>
            </div>
        </div>
    );
}
