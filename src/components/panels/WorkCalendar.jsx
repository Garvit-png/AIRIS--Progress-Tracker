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
        <div className="flex flex-col gap-1 mb-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-pink-500/10 rounded-full border border-pink-500/20">
                    <Activity size={8} className="text-pink-500 animate-pulse" />
                    <span className="font-mono text-[7px] font-black uppercase tracking-[0.2em] text-pink-500">Node Sync</span>
                </div>
                <div className="flex gap-1 bg-white/[0.03] border border-white/5 rounded-lg p-0.5">
                    <button onClick={prevMonth} className="p-1 px-1.5 hover:bg-white/[0.1] rounded-md transition-all text-white/20 hover:text-white">
                        <ChevronLeft size={12} />
                    </button>
                    <button onClick={nextMonth} className="p-1 px-1.5 hover:bg-white/[0.1] rounded-md transition-all text-white/20 hover:text-white">
                        <ChevronRight size={12} />
                    </button>
                </div>
            </div>
            
            <div className="mt-2 flex items-baseline gap-2">
                <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">{format(currentMonth, 'MMMM')}</h2>
                <span className="font-mono text-[10px] font-bold text-white/20">{currentMonth.getFullYear()}</span>
            </div>
        </div>
    );

    const renderCells = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-7 border-b border-white/5 pb-1.5">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                    <div key={idx} className="text-center font-mono text-[8px] font-black text-white/10 tracking-widest">
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
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
                                relative aspect-square flex flex-col items-center justify-center rounded-lg transition-all duration-300 group
                                ${!isCurrentMonth ? 'opacity-5 pointer-events-none' : 'opacity-100'}
                                ${isSelected ? 'bg-white text-black font-black scale-[1.05] shadow-[0_4px_15px_rgba(255,255,255,0.2)] z-10' : 'text-white/40 hover:bg-white/5 hover:text-white'}
                                ${isToday && !isSelected ? 'border border-pink-500/30' : ''}
                            `}
                        >
                            <span className="text-[11px] font-bold tracking-tighter z-10">
                                {format(day, 'd')}
                            </span>
                            
                            {taskCount > 0 && !isSelected && (
                                <div className="absolute top-1 right-1 flex gap-0.5">
                                    {[...Array(Math.min(taskCount, 2))].map((_, i) => (
                                        <div key={i} className="w-0.5 h-0.5 rounded-full bg-pink-500/60 shadow-[0_0_3px_rgba(255,50,150,0.5)]" />
                                    ))}
                                </div>
                            )}

                            {isSelected && (
                                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-black/20 rounded-full" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );

    const renderEvents = () => {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const tasks = workData[dateStr]?.tasks || [];
        const isToday = isSameDay(selectedDate, new Date());

        return (
            <div className="mt-6 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                        <span className="font-mono text-[7px] font-black uppercase tracking-[0.3em] text-pink-500/50">Activity Log</span>
                        <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                            {isToday ? 'Live Nodes' : format(selectedDate, 'MMM do')}
                        </h3>
                    </div>
                </div>

                <div className="space-y-2">
                    {tasks.length > 0 ? (
                        tasks.map((task, idx) => (
                            <div 
                                key={idx}
                                className="group flex items-center justify-between p-2.5 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-center">
                                        <span className="font-mono text-[7px] text-white/20 uppercase leading-none">ID</span>
                                        <span className="font-mono text-[8px] text-pink-500 font-bold">0{idx + 1}</span>
                                    </div>
                                    <div className="w-[1px] h-6 bg-white/5" />
                                    <div className="flex flex-col justify-center">
                                        <span className="text-[12px] font-bold text-white group-hover:text-pink-500 transition-colors uppercase tracking-tight leading-none">{task.title}</span>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <div className="w-1 h-1 rounded-full bg-pink-500/40 animate-pulse" />
                                            <span className="text-[8px] font-mono text-white/30 tracking-widest uppercase">System Link</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-[7px] font-black uppercase text-white/40 group-hover:text-white transition-colors">
                                    Active
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-8 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl opacity-20">
                            <Activity size={16} className="mb-1 text-white/10" />
                            <p className="font-mono text-[8px] uppercase tracking-[0.4em]">Zero Active Nodes</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="p-5 rounded-[2rem] bg-black border border-white/10 overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 blur-[60px] -mr-12 -mt-12" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-500/5 blur-[60px] -ml-12 -mb-12" />
            <div className="relative z-10">
                {renderHeader()}
                {renderCells()}
                {renderEvents()}
            </div>
        </div>
    );
}
