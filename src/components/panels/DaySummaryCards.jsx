export default function DaySummaryCards({ data, completedCount }) {
    return (
        <div className="grid grid-cols-3 gap-8">
            <div className="p-8 rounded-[2rem] bg-white/5 border border-pink-500/10 flex flex-col gap-4 group hover:bg-white/[0.08] transition-all">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20 group-hover:text-pink-500/60 transition-colors">Total Tasks</p>
                <div className="flex items-end gap-2">
                    <span className="text-5xl font-black tracking-tighter leading-none">{data.tasks.length}</span>
                </div>
            </div>
            <div className="p-8 rounded-[2rem] bg-white/5 border border-pink-500/10 flex flex-col gap-4 group hover:bg-white/[0.08] transition-all">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20 group-hover:text-emerald-500/60 transition-colors">Completed</p>
                <div className="flex items-end gap-2">
                    <span className="text-5xl font-black tracking-tighter leading-none text-emerald-500 shadow-emerald-500/20">{completedCount}</span>
                </div>
            </div>
            <div className="p-8 rounded-[2rem] bg-white/5 border border-pink-500/10 flex flex-col gap-4 group hover:bg-white/[0.08] transition-all">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20 group-hover:text-pink-500/60 transition-colors">Proofs</p>
                <div className="flex items-end gap-2">
                    <span className="text-5xl font-black tracking-tighter leading-none text-pink-500 shadow-pink-500/20">{data.proofs.length}</span>
                </div>
            </div>
        </div>
    );
}
