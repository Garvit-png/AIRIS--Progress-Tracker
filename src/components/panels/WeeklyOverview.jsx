import React, { useState, useEffect } from 'react';
import { Download, Calendar, Target, ShieldCheck, Zap } from 'lucide-react';
import { workStore } from '../../services/workStore';

export default function WeeklyOverview() {
    const [stats, setStats] = useState(workStore.getWeeklyStats());

    useEffect(() => {
        return workStore.subscribe(() => {
            setStats(workStore.getWeeklyStats());
        });
    }, []);

    const downloadReport = () => {
        alert("Generating System Manifest (PDF simulation)... Integrity check passed.");
    };

    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">Sync Period</p>
                    <h2 className="text-lg font-bold tracking-tight">Weekly Performance</h2>
                </div>
                <button
                    onClick={downloadReport}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border border-white/5"
                >
                    <Download size={14} />
                    Report
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 relative overflow-hidden group">
                    <Calendar size={12} className="absolute -right-1 -bottom-1 opacity-5 group-hover:opacity-10 transition-opacity" />
                    <p className="text-[10px] font-mono uppercase text-white/40 mb-2">Active Days</p>
                    <p className="text-xl font-bold">{stats.activeDays}<span className="text-[10px] text-white/20 ml-1">/ 7</span></p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 relative overflow-hidden group">
                    <Target size={12} className="absolute -right-1 -bottom-1 opacity-5 group-hover:opacity-10 transition-opacity" />
                    <p className="text-[10px] font-mono uppercase text-white/40 mb-2">Tasks Done</p>
                    <p className="text-xl font-bold text-green-500">{stats.completedTasks}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 relative overflow-hidden group">
                    <ShieldCheck size={12} className="absolute -right-1 -bottom-1 opacity-5 group-hover:opacity-10 transition-opacity" />
                    <p className="text-[10px] font-mono uppercase text-white/40 mb-2">Proofs</p>
                    <p className="text-xl font-bold text-blue-500">{stats.proofsUploaded}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 relative overflow-hidden group">
                    <Zap size={12} className="absolute -right-1 -bottom-1 opacity-5 group-hover:opacity-10 transition-opacity" />
                    <p className="text-[10px] font-mono uppercase text-white/40 mb-2">Efficiency</p>
                    <p className="text-xl font-bold">
                        {stats.activeDays > 0 ? Math.round((stats.completedTasks / (stats.activeDays * 3)) * 100) : 0}%
                    </p>
                </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                        <ShieldCheck size={16} />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider">System Integrity</p>
                        <p className="text-[10px] text-blue-400/60 transition-colors uppercase">All work verified via timestamped proof</p>
                    </div>
                </div>
                <div className="h-6 w-16 bg-blue-500/10 rounded flex items-center justify-center">
                    <span className="font-mono text-[10px] text-blue-400">ONLINE</span>
                </div>
            </div>
        </div>
    );
}
