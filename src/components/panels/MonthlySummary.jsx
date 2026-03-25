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
        <div className="flex flex-col gap-4 p-0">
            <div className="flex items-center justify-between px-1">
                <div className="flex flex-col">
                    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/30 border-b border-white/5 pb-1 mb-1">Monthly Report</p>
                    <h2 className="text-lg font-bold tracking-tight text-white/90">Performance Metrics</h2>
                </div>
                <div className="flex items-center gap-2 px-2 py-1 bg-white/[0.03] border border-white/10 rounded-lg">
                    <BarChart3 size={12} className="text-pink-500" />
                    <span className="text-[9px] font-mono text-white/60 uppercase tracking-widest">{format(currentMonth, 'MMMM yyyy')}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                    label="Days Active"
                    value={stats.activeDays}
                    target={20}
                    icon={<Zap size={14} />}
                    accentColor="border-amber-500/80"
                />
                <StatCard
                    label="Tasks Completed"
                    value={stats.completedTasks}
                    target={15}
                    icon={<Target size={14} />}
                    accentColor="border-green-500/80"
                />
                <StatCard
                    label="Proofs Verified"
                    value={stats.proofsUploaded}
                    target={10}
                    icon={<FileCheck size={14} />}
                    accentColor="border-pink-500/80"
                />
                <StatCard
                    label="Efficiency"
                    value={`${stats.efficiency}%`}
                    target={100}
                    icon={<Trophy size={14} />}
                    accentColor="border-blue-500/80"
                />
            </div>

            {/* Monthly Progress Bar */}
            <div className="p-4 rounded-xl bg-[#111113] border border-white/5 relative overflow-hidden group">
                <div className="flex justify-between items-end mb-3">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-1">Mission Efficiency</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-white leading-none">{stats.efficiency}%</span>
                            <span className="text-[10px] font-mono text-white/20 uppercase tracking-tighter">Current Cycle Status</span>
                        </div>
                    </div>
                </div>
                
                <div className="relative pt-4 pb-2">
                    {/* Track */}
                    <div className="h-[6px] w-full bg-white/[0.03] rounded-full overflow-hidden relative">
                        {/* Milestone Tick Marks */}
                        <div className="absolute inset-0 flex justify-between px-[1px]">
                            <div className="w-[1px] h-full bg-white/10 z-10" style={{ marginLeft: '25%' }} />
                            <div className="w-[1px] h-full bg-white/10 z-10" style={{ marginLeft: '50%' }} />
                            <div className="w-[1px] h-full bg-white/10 z-10" style={{ marginLeft: '75%' }} />
                        </div>
                        
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(4, stats.efficiency)}%` }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full bg-gradient-to-r from-pink-500 to-pink-500 relative shadow-[0_0_20px_rgba(255,45,120,0.3)]"
                        />
                    </div>
                    
                    {/* Milestone Labels */}
                    <div className="flex justify-between mt-2 px-0 text-[8px] font-mono text-white/10 uppercase tracking-tighter">
                        <span>0%</span>
                        <span className="ml-[22%]">25</span>
                        <span className="ml-[22%]">50</span>
                        <span className="ml-[22%]">75</span>
                        <span>100%</span>
                    </div>
                </div>

                <p className="mt-2 text-[10px] text-white/20 leading-relaxed max-w-md">
                    Calculated based on completed objectives vs total planned work for {format(currentMonth, 'MMMM')}.
                </p>
            </div>
        </div>
    );
}

function StatCard({ label, value, target, icon, accentColor }) {
    return (
        <div className={`p-3 rounded-lg bg-[#111113] border-l-4 ${accentColor} border-y border-r border-white/5 flex flex-col gap-2 transition-all hover:bg-white/[0.02]`}>
            <div className="text-white/20">
                {icon}
            </div>
            <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-white/30 mb-1">{label}</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-[28px] font-bold tracking-tight text-white leading-none">{value}</p>
                </div>
                <p className="text-[9px] font-mono text-white/20 mt-1 uppercase tracking-tighter">
                    0 <span className="mx-1">→</span> {target} target
                </p>
            </div>
        </div>
    );
}
