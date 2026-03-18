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
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">Work Cycle</p>
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
              relative h-16 flex flex-col items-center justify-center rounded-xl transition-all duration-300 group
              ${!isCurrentMonth ? 'opacity-20 hover:opacity-40' : 'opacity-100'}
              ${isSelected ? 'bg-white/10 scale-95 ring-1 ring-pink-500/30' : 'hover:bg-white/5'}
            `}
                    >
                        {isToday && (
                            <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-pink-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] z-10" />
                        )}

                        <div className="relative flex items-center justify-center w-8 h-8 mb-1">
                            {/* Progress Ring */}
                            {taskCount > 0 && (
                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                    <circle
                                        cx="16" cy="16" r="14"
                                        fill="transparent"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="text-pink-500/10"
                                    />
                                    <motion.circle
                                        cx="16" cy="16" r="14"
                                        fill="transparent"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeDasharray={88}
                                        initial={{ strokeDashoffset: 88 }}
                                        animate={{ strokeDashoffset: 88 - (88 * progress) / 100 }}
                                        className={progress === 100 ? "text-green-500" : "text-white/95"}
                                    />
                                </svg>
                            )}
                            <span className={`text-xs font-mono relative z-10 ${isSelected ? 'text-white font-bold' : 'text-white/80'}`}>
                                {format(day, 'd')}
                            </span>
                        </div>

                        {/* Activity Dots */}
                        <div className="flex gap-1 h-1">
                            {hasProofs && (
                                <div className="w-1 h-1 rounded-full bg-pink-400" title="Proof Uploaded" />
                            )}
                            {taskCount > 0 && progress === 100 && (
                                <div className="w-1 h-1 rounded-full bg-green-500" title="All Tasks Done" />
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
