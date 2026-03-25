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
        <div className="flex flex-col gap-4 mb-6 px-1">
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">WORK CYCLE</p>
                    <h2 className="text-xl font-bold tracking-tight text-white">{format(currentMonth, 'MMMM')}</h2>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <select
                            value={currentMonth.getFullYear()}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            className="appearance-none bg-white/5 border border-pink-500/20 rounded-lg px-3 py-1.5 font-mono text-[11px] text-white/85 focus:text-white focus:outline-none focus:border-pink-500/40 transition-all pr-8 group-hover:bg-white/10"
                        >
                            {years.map(y => (
                                <option key={y} value={y} className="bg-[#121212] tracking-widest">{y}</option>
                            ))}
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white/85">
                            <ChevronRight size={12} className="rotate-90" />
                        </div>
                    </div>

                    <div className="flex gap-1">
                        <button onClick={prevMonth} className="p-2 hover:bg-white/5 rounded-lg transition-colors border border-pink-500/10 text-white/95 hover:text-white">
                            <ChevronLeft size={16} />
                        </button>
                        <button onClick={nextMonth} className="p-2 hover:bg-white/5 rounded-lg transition-colors border border-pink-500/10 text-white/95 hover:text-white">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDays = () => (
        <div className="grid grid-cols-7 mb-2">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                <div key={day} className="text-center font-mono text-[9px] font-bold text-white/80 py-2">
                    {day}
                </div>
            ))}
        </div>
    );

    const renderCells = () => (
        <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day) => {
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
              relative h-12 flex flex-col items-center justify-center rounded-xl transition-all duration-300 group
              ${!isCurrentMonth ? 'opacity-10 hover:opacity-20' : 'opacity-100'}
              ${isSelected ? 'bg-white/5 ring-1 ring-white/10' : 'hover:bg-white/5'}
            `}
                    >
                        <div className={`
                            relative flex items-center justify-center w-7 h-7 rounded-sm transition-all
                            ${isToday ? 'bg-[#FF2D78] text-white font-bold shadow-[0_0_15px_rgba(255,45,120,0.4)]' : ''}
                            ${isSelected && !isToday ? 'border border-white/20' : ''}
                        `}>
                            <span className="text-[11px] font-mono relative z-10 transition-colors">
                                {format(day, 'd')}
                            </span>
                            
                            {/* Task indicator dot */}
                            {taskCount > 0 && !isToday && (
                                <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${progress === 100 ? 'bg-emerald-500' : 'bg-white/20'}`} />
                            )}
                        </div>

                        {/* Activity Indicators */}
                        <div className="flex gap-1 h-1 mt-1">
                            {hasProofs && !isToday && (
                                <div className="w-1 h-1 rounded-full bg-pink-500/40" />
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
