import React, { useState, useEffect } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths
} from 'date-fns';
import { ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { workStore } from '../../services/workStore';

export default function WorkCalendar({ selectedDate, onDateSelect, currentMonth, setCurrentMonth }) {
    const [workData, setWorkData] = useState(workStore.data);

    useEffect(() => {
        return workStore.subscribe((data) => setWorkData({ ...data }));
    }, []);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const setYear = (year) => {
        const newDate = new Date(currentMonth);
        newDate.setFullYear(year);
        setCurrentMonth(newDate);
    };

    // Calendar logic
    const { monthStart, calendarDays } = React.useMemo(() => {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(start);
        const startW = startOfWeek(start);
        const endW = endOfWeek(end);
        
        return {
            monthStart: start,
            calendarDays: eachDayOfInterval({ start: startW, end: endW })
        };
    }, [currentMonth]);

    const years = [2026, 2027, 2028, 2029, 2030];

    const renderHeader = () => (
        <div className="flex flex-col gap-5 mb-8 px-2">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                    <p className="font-mono text-[9px] font-black uppercase tracking-[0.3em] text-pink-500/40">Work cycle</p>
                    <h2 className="text-2xl font-bold tracking-tight text-white/95">{format(currentMonth, 'MMMM')}</h2>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <select
                            value={currentMonth.getFullYear()}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            className="appearance-none bg-white/[0.03] border border-white/10 hover:border-pink-500/40 rounded-2xl px-5 py-2.5 font-mono text-xs text-white/80 focus:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 transition-all pr-12 group-hover:bg-white/[0.05]"
                        >
                            {years.map(y => (
                                <option key={y} value={y} className="bg-[#121212] tracking-widest">{y}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 group-hover:text-pink-500/60 transition-colors">
                            <ChevronRight size={14} className="rotate-90" />
                        </div>
                    </div>

                    <div className="flex gap-2 p-1.5 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <button onClick={prevMonth} className="p-2.5 hover:bg-white/[0.05] hover:border-pink-500/20 rounded-xl transition-all border border-transparent text-white/40 hover:text-white group">
                            <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        <button onClick={nextMonth} className="p-2.5 hover:bg-white/[0.05] hover:border-pink-500/20 rounded-xl transition-all border border-transparent text-white/40 hover:text-white group">
                            <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDays = () => (
        <div className="grid grid-cols-7 border-b border-white/5 pb-2 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                <div key={idx} className="text-center font-mono text-[10px] font-black text-white/20">
                    {day}
                </div>
            ))}
        </div>
    );

    const renderCells = () => (
        <div className="grid grid-cols-7 border-collapse">
            {calendarDays.map((day, idx) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const dayData = workData[dateStr];
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isToday = isSameDay(day, new Date());

                const taskCount = dayData?.tasks?.length || 0;
                const completedCount = dayData?.tasks?.filter(t => t.completed).length || 0;
                const progress = taskCount > 0 ? (completedCount / taskCount) * 100 : 0;
                const hasProofs = dayData?.proofs?.length > 0;

                return (
                    <button
                        key={day.toString()}
                        onClick={() => onDateSelect(day)}
                        className={`
                            relative h-16 flex flex-col items-center justify-center transition-all duration-300 group
                            border border-white/[0.03] -ml-[1px] -mt-[1px]
                            ${!isCurrentMonth ? 'bg-black/20 opacity-10 hover:opacity-20' : 'bg-transparent'}
                            ${isSelected ? 'z-10 bg-pink-500/[0.03]' : 'hover:bg-white/[0.02]'}
                        `}
                    >
                        {/* Precision Border Highlight */}
                        <div className={`absolute inset-0 transition-all duration-300 pointer-events-none
                            ${isSelected ? 'border border-pink-500/40 shadow-[inset_0_0_15px_rgba(255,45,120,0.05)]' : 'border border-transparent group-hover:border-white/10'}
                        `} />

                        <div className={`
                            relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-500
                            ${isToday ? 'bg-pink-500 text-white font-black shadow-[0_0_20px_rgba(255,45,120,0.5)] scale-110' : ''}
                            ${isSelected && !isToday ? 'text-pink-500 scale-105' : 'text-white/60 group-hover:text-white'}
                        `}>
                            <span className="text-xs font-mono relative z-10 tracking-tighter">
                                {format(day, 'd')}
                            </span>
                            
                            {/* Selected Indicator Ring */}
                            {isSelected && !isToday && (
                                <motion.div 
                                    layoutId="calendarSelect"
                                    className="absolute inset-0 border-2 border-pink-500/30 rounded-xl"
                                />
                            )}
                        </div>

                        {/* Status Dots */}
                        <div className="absolute bottom-2 flex gap-1.5 justify-center w-full">
                            {taskCount > 0 && (
                                <div className={`w-1 h-1 rounded-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)]' : 'bg-white/20'}`} />
                            )}
                            {hasProofs && (
                                <div className="w-1 h-1 rounded-full bg-pink-500/60 shadow-[0_0_5px_rgba(255,45,120,0.5)]" />
                            )}
                        </div>
                    </button>
                );
            })}
        </div>
    );

    return (
        <div className="p-6 rounded-2xl bg-[#121212]/50 border border-pink-500/10 backdrop-blur-xl h-fit">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
        </div>
    );
}
