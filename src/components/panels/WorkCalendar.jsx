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
        <div className="flex flex-col gap-2 mb-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 px-3 py-1 bg-pink-500/10 rounded-full border border-pink-500/20">
                    <Activity size={10} className="text-pink-500 animate-pulse" />
                    <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-pink-500">Node Sync Active</span>
                </div>
                <div className="flex gap-1 bg-white/[0.03] border border-white/5 rounded-lg p-0.5">
                    <button onClick={prevMonth} className="p-1 px-2 hover:bg-white/[0.1] rounded-md transition-all text-white/20 hover:text-white">
                        <ChevronLeft size={14} />
                    </button>
                    <button onClick={nextMonth} className="p-1 px-2 hover:bg-white/[0.1] rounded-md transition-all text-white/20 hover:text-white">
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>
            
            <div className="mt-4 flex flex-col gap-1">
                <span className="font-mono text-[11px] font-bold text-white/20 tracking-[0.3em] uppercase">{currentMonth.getFullYear()}</span>
                <h2 className="text-5xl font-black tracking-tighter text-white uppercase italic leading-none">{format(currentMonth, 'MMMM')}</h2>
            </div>
        </div>
    );

    const renderCells = () => (
        <div className="space-y-8">
            <div className="grid grid-cols-7 border-b border-white/5 pb-3">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, idx) => (
                    <div key={idx} className="text-center font-mono text-[10px] font-black text-white/20 tracking-widest uppercase">
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
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
                                relative aspect-square flex flex-col items-center justify-center rounded-xl transition-all duration-300 group
                                ${!isCurrentMonth ? 'opacity-5 pointer-events-none' : 'opacity-100'}
                                ${isSelected ? 'bg-white text-black font-black scale-[1.05] shadow-[0_8px_30px_rgba(255,255,255,0.2)] z-10' : 'text-white/40 hover:bg-white/5 hover:text-white'}
                                ${isToday && !isSelected ? 'border border-pink-500/30' : ''}
                            `}
                        >
                            <span className="text-sm font-black tracking-tighter z-10">
                                {format(day, 'd')}
                            </span>
                            
                            {taskCount > 0 && !isSelected && (
                                <div className="absolute top-2 right-2 flex gap-0.5">
                                    {[...Array(Math.min(taskCount, 3))].map((_, i) => (
                                        <div key={i} className="w-1 h-1 rounded-full bg-pink-500/60 shadow-[0_0_4px_rgba(255,50,150,0.5)]" />
                                    ))}
                                </div>
                            )}

                            {isSelected && (
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-black/20 rounded-full" />
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
            <div className="mt-10 pt-8 border-t border-white/5">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col gap-1">
                        <span className="font-mono text-[9px] font-black uppercase tracking-[0.4em] text-pink-500/50">Activity Log</span>
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                            {isToday ? 'Live Nodes' : format(selectedDate, 'MMMM do')}
                        </h3>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <Calendar size={14} className="text-white/20" />
                    </div>
                </div>

                <div className="space-y-4">
                    {tasks.length > 0 ? (
                        tasks.map((task, idx) => (
                            <div 
                                key={idx}
                                className="group flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="flex flex-col items-center">
                                        <span className="font-mono text-[8px] text-white/20 uppercase leading-none mb-1">ID</span>
                                        <span className="font-mono text-[11px] text-pink-500 font-bold">0{idx + 1}</span>
                                    </div>
                                    <div className="w-[1px] h-10 bg-white/5" />
                                    <div className="flex flex-col justify-center">
                                        <span className="text-sm font-bold text-white group-hover:text-pink-500 transition-colors uppercase tracking-tight leading-none mb-2">{task.title}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-pink-500/40 animate-pulse" />
                                            <span className="text-[9px] font-mono text-white/30 tracking-widest uppercase">System Core Interface</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-2.5 py-1 rounded bg-white/5 border border-white/5 text-[8px] font-black uppercase text-white/40 group-hover:text-white transition-colors">
                                    Active
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-3xl opacity-30">
                            <Activity size={24} className="mb-2 text-white/10" />
                            <p className="font-mono text-[10px] uppercase tracking-[0.4em]">Zero Active Nodes</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="p-8 pb-12 rounded-[3.5rem] bg-black border border-white/10 overflow-hidden relative shadow-2xl min-h-[600px]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/5 blur-[100px] -mr-24 -mt-24" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/5 blur-[100px] -ml-24 -mb-24" />
            <div className="relative z-10">
                {renderHeader()}
                {renderCells()}
                {renderEvents()}
            </div>
        </div>
    );
}
