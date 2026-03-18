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
        <div className="flex flex-col gap-6 p-1">
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/80">Monthly Report</p>
                    <h2 className="text-xl font-bold tracking-tight text-white/90">Performance Metrics</h2>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-pink-500/20 rounded-lg">
                    <BarChart3 size={14} className="text-pink-400" />
                    <span className="text-[10px] font-mono text-white/90 uppercase tracking-widest">{format(currentMonth, 'MMMM yyyy')}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    label="Days Active"
                    value={stats.activeDays}
                    icon={<Zap size={18} />}
                    color="text-yellow-400"
                    bg="bg-yellow-500/10"
                />
                <StatCard
                    label="Tasks Completed"
                    value={stats.completedTasks}
                    icon={<Target size={18} />}
                    color="text-green-400"
                    bg="bg-green-500/10"
                />
                <StatCard
                    label="Proofs Verified"
                    value={stats.proofsUploaded}
                    icon={<FileCheck size={18} />}
                    color="text-pink-400"
                    bg="bg-pink-500/10"
                />
                <StatCard
                    label="Efficiency"
                    value={`${stats.efficiency}%`}
                    icon={<Trophy size={18} />}
                    color="text-pink-400"
                    bg="bg-pink-500/10"
                />
            </div>

            {/* Monthly Progress Bar */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Mission Efficiency</span>
                    <span className="text-lg font-mono font-bold text-white/90">{stats.efficiency}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.efficiency}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-pink-500 to-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)]"
                    />
                </div>
                <p className="mt-3 text-[10px] text-white/20 italic">
                    Calculated based on completed objectives vs total planned work for {format(currentMonth, 'MMMM')}.
                </p>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color, bg }) {
    return (
        <div className={`p-4 rounded-xl ${bg} border border-white/5 flex flex-col gap-3 group hover:border-white/10 transition-all`}>
            <div className={`${color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                {icon}
            </div>
            <div>
                <p className="text-[9px] uppercase tracking-widest text-white/80 mb-0.5">{label}</p>
                <p className="text-2xl font-bold tracking-tight text-white/90">{value}</p>
            </div>
        </div>
    );
}
