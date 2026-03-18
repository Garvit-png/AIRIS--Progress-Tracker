import React from 'react';

export default function DaySummaryCards({ data, completedCount }) {
    return (
        <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-white/5 border border-pink-500/10">
                <p className="text-[9px] uppercase tracking-widest text-white/95 mb-1">Tasks</p>
                <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold leading-none">{data.tasks.length}</span>
                </div>
            </div>
            <div className="p-4 rounded-xl bg-green-500/5 border border-pink-500/20">
                <p className="text-[9px] uppercase tracking-widest text-green-500/90 mb-1">Completed</p>
                <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold leading-none text-green-500">{completedCount}</span>
                </div>
            </div>
            <div className="p-4 rounded-xl bg-pink-500/5 border border-pink-500/20">
                <p className="text-[9px] uppercase tracking-widest text-pink-500/90 mb-1">Proofs</p>
                <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold leading-none text-pink-500">{data.proofs.length}</span>
                </div>
            </div>
        </div>
    );
}
