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
        <div className="flex flex-col gap-2 mb-4 px-1">
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/20 mb-0.5">Work Cycle</p>
                    <h2 className="text-lg font-bold tracking-tight text-white">{format(currentMonth, 'MMMM')}</h2>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <select
                            value={currentMonth.getFullYear()}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            className="appearance-none bg-white/[0.03] border border-white/10 rounded-lg px-2 py-1 font-mono text-[10px] text-white/60 focus:text-white focus:outline-none focus:border-pink-500/30 transition-all pr-6 group-hover:bg-white/10"
                        >
                            {years.map(y => (
                                <option key={y} value={y} className="bg-[#121212] tracking-widest">{y}</option>
                            ))}
                        </select>
                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                            <ChevronRight size={10} className="rotate-90" />
                        </div>
                    </div>

                    <div className="flex gap-1">
                        <button onClick={prevMonth} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors border border-white/5 text-white/40 hover:text-white">
                            <ChevronLeft size={14} />
                        </button>
                        <button onClick={nextMonth} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors border border-white/5 text-white/40 hover:text-white">
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDays = () => (
        <div className="grid grid-cols-7 mb-1">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                <div key={day} className="text-center font-mono text-[8px] font-bold text-white/20 py-1">
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
              relative h-12 flex flex-col items-center justify-center rounded-lg transition-all duration-200 group
              ${!isCurrentMonth ? 'opacity-10 hover:opacity-30' : 'opacity-100'}
              ${isSelected ? 'bg-white/10 ring-1 ring-pink-500/20' : 'hover:bg-white/5'}
            `}
                    >
                        {isToday && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-7 h-7 rounded-full bg-pink-500/10 border border-pink-500/20" />
                            </div>
                        )}

                        <div className="relative flex items-center justify-center w-7 h-7">
                            {/* Progress Ring */}
                            {taskCount > 0 && (
                                <svg className="absolute inset-x-0 -inset-y-[1px] w-full h-full -rotate-90">
                                    <circle
                                        cx="14" cy="14" r="12"
                                        fill="transparent"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        className="text-white/5"
                                    />
                                    <motion.circle
                                        cx="14" cy="14" r="12"
                                        fill="transparent"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeDasharray={75}
                                        initial={{ strokeDashoffset: 75 }}
                                        animate={{ strokeDashoffset: 75 - (75 * progress) / 100 }}
                                        className={progress === 100 ? "text-green-500" : "text-pink-500"}
                                    />
                                </svg>
                            )}
                            <span className={`text-[11px] font-mono relative z-10 ${isToday ? 'text-pink-500 font-black' : isSelected ? 'text-white font-bold' : 'text-white/60'}`}>
                                {format(day, 'd')}
                            </span>
                        </div>

                        {/* Activity Dots */}
                        <div className="flex gap-0.5 mt-0.5">
                            {hasProofs && (
                                <div className="w-1 h-1 rounded-full bg-pink-500/60" />
                            )}
                        </div>
                    </button>
                );
            })}
        </div>
    );

    return (
        <div className="p-4 rounded-xl bg-[#111113] border border-white/5 h-fit shadow-2xl">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
        </div>
    );
}
