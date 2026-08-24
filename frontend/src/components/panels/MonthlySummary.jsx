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
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">MONTHLY REPORT</p>
                    <h2 className="text-xl font-bold tracking-tight text-white">Performance Metrics</h2>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-pink-500/20 rounded-lg">
                    <BarChart3 size={14} className="text-pink-400" />
                    <span className="text-[10px] font-mono text-white uppercase tracking-widest">{format(currentMonth, 'MMMM yyyy')}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    label="Days active"
                    value={stats.activeDays}
                    icon={<Zap size={14} />}
                    accentColor="border-amber-500"
                    iconColor="text-amber-500"
                />
                <StatCard
                    label="Tasks completed"
                    value={stats.completedTasks}
                    icon={<Target size={14} />}
                    accentColor="border-emerald-500"
                    iconColor="text-emerald-500"
                />
                <StatCard
                    label="Proofs verified"
                    value={stats.proofsUploaded}
                    icon={<FileCheck size={14} />}
                    accentColor="border-pink-500"
                    iconColor="text-pink-500"
                />
                <StatCard
                    label="Efficiency"
                    value={`${stats.efficiency}%`}
                    icon={<Trophy size={14} />}
                    accentColor="border-blue-500"
                    iconColor="text-blue-500"
                />
            </div>

            {/* Monthly Progress Bar */}
            <div className="p-5 rounded-2xl bg-[#111113] border border-white/5">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Mission efficiency</span>
                    <span className="text-base font-mono font-bold text-white">{stats.efficiency}%</span>
                </div>
                <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    {/* Ticks */}
                    <div className="absolute inset-0 flex justify-between px-[25%] pointer-events-none">
                        <div className="w-[1px] h-full bg-white/10" />
                        <div className="w-[1px] h-full bg-white/10" />
                    </div>
                    <div className="absolute inset-x-[50%] h-full w-[1px] bg-white/10 pointer-events-none" />
                    
                    <motion.div
                        initial={{ width: '4px' }}
                        animate={{ width: `calc(${stats.efficiency}% + 4px)` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-[#FF2D78] shadow-[0_0_15px_rgba(255,45,120,0.3)] rounded-full"
                    />
                </div>
                <p className="mt-4 text-[10px] text-white/30">
                    Calculated based on completed objectives vs total planned work for {format(currentMonth, 'MMMM')}.
                </p>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, accentColor, iconColor }) {
    return (
        <div className={`p-4 rounded-xl bg-[#111113] border border-white/5 border-l-[3px] ${accentColor} flex flex-col gap-3 group transition-all`}>
            <div className={`${iconColor} opacity-50 group-hover:opacity-100 transition-opacity`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] text-white/40 mb-1">{label}</p>
                <p className="text-2xl font-semibold tracking-tight text-white">{value}</p>
            </div>
        </div>
    );
}
