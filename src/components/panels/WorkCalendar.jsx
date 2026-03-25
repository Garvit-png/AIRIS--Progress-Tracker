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
        <div className="flex flex-col gap-1 mb-6">
            <div className="flex items-center">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-pink-500/10 rounded-full border border-pink-500/20">
                    <div className="w-1 h-1 rounded-full bg-pink-500 animate-pulse" />
                    <span className="font-mono text-[8px] font-black uppercase tracking-[0.2em] text-pink-500">Work cycle</span>
                </div>
            </div>
            
            <h2 className="text-3xl font-black tracking-tight text-white mt-4 mb-5 uppercase">{format(currentMonth, 'MMMM')}</h2>
            
            <div className="flex items-center gap-2">
                <div className="bg-white/[0.05] border border-white/10 rounded-xl px-3 py-1.5 font-mono text-[10px] font-bold text-white/50">
                    {currentMonth.getFullYear()}
                </div>
                <div className="flex gap-1 bg-white/[0.05] border border-white/10 rounded-xl p-0.5">
                    <button onClick={prevMonth} className="p-1.5 hover:bg-white/[0.1] rounded-lg transition-all text-white/30 hover:text-white">
                        <ChevronLeft size={12} />
                    </button>
                    <button onClick={nextMonth} className="p-1.5 hover:bg-white/[0.1] rounded-lg transition-all text-white/30 hover:text-white">
                        <ChevronRight size={12} />
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
            <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                    <p className="font-mono text-[8px] font-black uppercase tracking-[0.2em] text-white/20">
                        {isToday ? 'Today' : format(selectedDate, 'EEEE')} • {format(selectedDate, 'MMM d').toUpperCase()}
                    </p>
                </div>

                <div className="space-y-2">
                    {tasks.length > 0 ? (
                        tasks.map((task, idx) => (
                            <div 
                                key={idx}
                                className="group flex items-center justify-between p-3.5 bg-white/[0.03] border border-white/5 rounded-xl hover:border-pink-500/20 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(255,13,153,0.4)]" />
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-white/80 group-hover:text-white transition-colors">{task.title}</span>
                                        <span className="text-[9px] font-mono text-white/20">10:00 — 11:30 AM</span>
                                    </div>
                                </div>
                                <div className="px-2 py-0.5 rounded border border-pink-500/20 text-[8px] font-black uppercase tracking-tight text-pink-500/60 group-hover:text-pink-500 transition-colors">
                                    Node
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-6 text-center border border-dashed border-white/5 rounded-xl opacity-20">
                            <p className="font-mono text-[9px] uppercase tracking-widest">No active nodes</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-pink-500/10 backdrop-blur-xl h-fit">
            {renderHeader()}
            {renderCells()}
            {renderEvents()}
        </div>
    );
}
