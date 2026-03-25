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
import { ChevronLeft, ChevronRight, Activity, Calendar } from 'lucide-react';
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
        <div className="flex flex-col gap-1 mb-8">
            <div className="flex items-center">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-pink-500/10 rounded-full border border-pink-500/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                    <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-pink-500">Work cycle</span>
                </div>
            </div>
            
            <h2 className="text-5xl font-black tracking-tighter text-white mt-4 mb-6">{format(currentMonth, 'MMMM')}</h2>
            
            <div className="flex items-center gap-2">
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-2 font-mono text-xs font-bold text-white/40">
                    {currentMonth.getFullYear()}
                </div>
                <div className="flex gap-1 bg-white/[0.03] border border-white/5 rounded-2xl p-1">
                    <button onClick={prevMonth} className="p-2 hover:bg-white/[0.05] rounded-xl transition-all text-white/40 hover:text-white">
                        <ChevronLeft size={14} />
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-white/[0.05] rounded-xl transition-all text-white/40 hover:text-white">
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );

    const renderDays = () => (
        <div className="grid grid-cols-7 mb-8">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                <div key={idx} className="text-center font-mono text-[11px] font-bold text-white/20">
                    {day}
                </div>
            ))}
        </div>
    );

    const renderCells = () => (
        <div className="grid grid-cols-7 gap-y-4 mb-10">
            {calendarDays.map((day, idx) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const dayData = workData[dateStr];
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isToday = isSameDay(day, new Date());

                const taskCount = dayData?.tasks?.length || 0;

                return (
                    <button
                        key={day.toString()}
                        onClick={() => onDateSelect(day)}
                        className={`
                            relative group flex flex-col items-center justify-start py-2
                            ${!isCurrentMonth ? 'opacity-10' : 'opacity-100'}
                        `}
                    >
                        <div className={`
                            relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-500
                            ${isSelected ? 'bg-pink-500 text-white font-black shadow-[0_4px_20px_rgba(255,45,120,0.6)] scale-110' : 'text-white/80 hover:text-white'}
                        `}>
                            <span className="text-sm font-bold relative z-10 tracking-tighter">
                                {format(day, 'd')}
                            </span>
                        </div>

                        {/* Task Dot Indicator */}
                        {taskCount > 0 && (
                            <div className={`w-1 h-1 rounded-full mt-1.5 transition-all duration-300 ${isSelected ? 'bg-white scale-125' : 'bg-pink-500/60'}`} />
                        )}
                    </button>
                );
            })}
        </div>
    );

    const renderEvents = () => {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const tasks = workData[dateStr]?.tasks || [];
        const isToday = isSameDay(selectedDate, new Date());

        return (
            <div className="mt-8 pt-8 border-t border-white/5">
                <div className="flex items-center justify-between mb-6">
                    <p className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
                        {isToday ? 'Today' : format(selectedDate, 'EEEE')} • {format(selectedDate, 'MMM d').toUpperCase()}
                    </p>
                </div>

                <div className="space-y-3">
                    {tasks.length > 0 ? (
                        tasks.map((task, idx) => (
                            <div 
                                key={idx}
                                className="group flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] hover:border-white/10 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-2 rounded-full ${idx % 2 === 0 ? 'bg-pink-500 shadow-[0_0_8px_rgba(255,45,120,0.4)]' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]'}`} />
                                    <div className="flex flex-col">
                                        <span className="text-[13px] font-bold text-white/90 group-hover:text-white transition-colors">{task.title}</span>
                                        <span className="text-[10px] font-mono text-white/30">10:00 — 11:30 AM</span>
                                    </div>
                                </div>
                                <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight ${idx % 2 === 0 ? 'bg-pink-500/10 text-pink-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                    {idx % 2 === 0 ? 'Work' : 'Review'}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-8 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-2xl opacity-20">
                            <p className="font-mono text-[10px] uppercase tracking-widest">No active nodes</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="p-8 rounded-[2.5rem] bg-[#080808] border border-white/5 h-fit shadow-2xl">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
            {renderEvents()}
        </div>
    );
}
