import React, { useState, useEffect } from 'react';
import { workStore } from '../../services/workStore';
import { format } from 'date-fns';
import { Trophy, Target, FileCheck, Zap, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MonthlySummary({ currentMonth }) {
    const [stats, setStats] = useState(workStore.getMonthlyStats(
        currentMonth.getFullYear(),
        currentMonth.getMonth()
    ));

    useEffect(() => {
        return workStore.subscribe(() => {
            setStats(workStore.getMonthlyStats(
                currentMonth.getFullYear(),
                currentMonth.getMonth()
            ));
        });
    }, [currentMonth]);

    return (
        <div className="flex flex-col gap-10 p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] relative overflow-hidden backdrop-blur-md shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/5 blur-[150px] -mr-40 -mt-40" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-500/5 blur-[150px] -ml-40 -mb-40" />

            <div className="flex items-center justify-between relative z-10">
                <div className="flex flex-col gap-1">
                    <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-pink-500 font-black">MISSION STATUS</p>
                    <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none mt-1">Performance Metrics</h2>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-pink-500/10 border border-pink-500/20 rounded-xl">
                    <BarChart3 size={16} className="text-pink-500 animate-pulse" />
                    <span className="text-[11px] font-mono text-white/80 uppercase tracking-widest font-bold">{format(currentMonth, 'MMMM yyyy')}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                <StatCard
                    label="Days active"
                    value={stats.activeDays}
                    icon={<Zap size={18} />}
                    accentColor="border-amber-500"
                    iconColor="text-amber-500"
                />
                <StatCard
                    label="Tasks completed"
                    value={stats.completedTasks}
                    icon={<Target size={18} />}
                    accentColor="border-emerald-500"
                    iconColor="text-emerald-500"
                />
                <StatCard
                    label="Proofs verified"
                    value={stats.proofsUploaded}
                    icon={<FileCheck size={18} />}
                    accentColor="border-pink-500"
                    iconColor="text-pink-500"
                />
                <StatCard
                    label="Efficiency"
                    value={`${stats.efficiency}%`}
                    icon={<Trophy size={18} />}
                    accentColor="border-blue-500"
                    iconColor="text-blue-500"
                />
            </div>

            {/* Monthly Progress Bar */}
            <div className="p-8 rounded-3xl bg-white/[0.015] border border-white/5 relative z-10">
                <div className="flex justify-between items-end mb-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20">Operational Efficiency</span>
                        <p className="text-[10px] text-white/30 max-w-sm">Calculated based on objective completion for the current cycle.</p>
                    </div>
                    <span className="text-5xl font-mono font-bold text-white tracking-tighter">{stats.efficiency}%</span>
                </div>
                <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: '4px' }}
                        animate={{ width: `calc(${stats.efficiency}% + 4px)` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="h-full bg-pink-500 shadow-[0_0_20px_rgba(255,45,120,0.5)] rounded-full"
                    />
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, accentColor, iconColor }) {
    return (
        <div className={`p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 border-l-[6px] ${accentColor} flex flex-col gap-6 group transition-all hover:bg-white/[0.05] hover:scale-[1.02] min-h-[160px] relative overflow-hidden shadow-xl`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] blur-3xl group-hover:bg-white/[0.03] transition-all" />
            <div className={`${iconColor} opacity-40 group-hover:opacity-100 transition-opacity transform group-hover:scale-110 duration-500`}>
                {icon}
            </div>
            <div className="relative z-10">
                <p className="text-[11px] font-bold text-white/30 mb-2 uppercase tracking-widest">{label}</p>
                <p className="text-4xl font-black tracking-tighter text-white">{value}</p>
            </div>
        </div>
    );
}
