import React from 'react';
import { Plus, CheckCircle2, Circle, Trash2, Trophy, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function TaskSection({ 
    tasks, 
    isToday, 
    isPast, 
    isSyncingTasks, 
    selectedDate, 
    newTaskTitle, 
    setNewTaskTitle, 
    addTask, 
    handleToggleTask, 
    deleteTask 
}) {
    return (
        <div className="flex flex-col gap-4 bg-white/5 border border-pink-500/10 rounded-2xl p-5 overflow-hidden">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-bold tracking-tight">Active to-do</h3>
                    <div className="flex items-center gap-2 h-4">
                        <AnimatePresence mode="wait">
                            {isSyncingTasks ? (
                                <motion.div
                                    key="syncing"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="flex items-center gap-1.5"
                                >
                                    <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
                                    <span className="text-[9px] font-mono text-emerald-400 capitalize tracking-tighter">Syncing status...</span>
                                </motion.div>
                            ) : (
                                <motion.span
                                    key="date"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.8 }}
                                    className="font-mono text-[9px] uppercase italic"
                                >
                                    {format(selectedDate, 'MMM dd, yyyy')}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {isToday ? (
                <form onSubmit={addTask} className="relative">
                    <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Add a mission objective..."
                        className="w-full bg-white/5 border-2 border-[#FF2D78]/20 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#FF2D78]/40 transition-colors pr-12 text-white"
                    />
                    <button type="submit" className="absolute right-2 top-2 p-1.5 bg-white/10 rounded-lg hover:bg-white/20 text-[#FF2D78] transition-all">
                        <Plus size={16} />
                    </button>
                </form>
            ) : isPast ? (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-pink-500/10 opacity-80">
                    <Clock size={14} className="text-white/95" />
                    <span className="text-[10px] tracking-wide font-mono text-white/40">Work archive locked (Read only)</span>
                </div>
            ) : null}

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                <AnimatePresence mode="popLayout">
                    {tasks.map((task) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            key={task.id}
                            className={`group flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${task.completed ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-white/5 border-white/5 hover:border-pink-500/30'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleToggleTask(task.id)}
                                    className={`transition-colors duration-300 ${task.completed ? 'text-emerald-500' : 'text-white/40 hover:text-white/90'}`}
                                >
                                    {task.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                                </button>
                                <span className={`text-[11px] transition-all duration-300 ${task.completed ? 'text-white/40 line-through' : 'text-white/90'}`}>
                                    {task.title}
                                </span>
                            </div>
                            {isToday && (
                                <button
                                    onClick={() => deleteTask(task.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-red-500/40 hover:text-red-500 rounded-lg transition-all"
                                >
                                    <Trash2 size={12} />
                                </button>
                            )}
                        </motion.div>
                    ))}
                    {tasks.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-pink-500/10 bg-pink-500/[0.02]">
                            <div className="w-12 h-12 rounded-full bg-pink-500/5 flex items-center justify-center mb-4">
                                <Trophy size={20} className="text-pink-500/40" />
                            </div>
                            <p className="text-[11px] text-white/40 mb-5 font-medium">No objectives for this cycle</p>
                            {isToday && (
                                <button 
                                    onClick={() => document.querySelector('input[placeholder="Add a mission objective..."]')?.focus()}
                                    className="px-4 py-2 border-2 border-[#FF2D78] text-[#FF2D78] text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#FF2D78]/10 transition-all shadow-[0_4px_12px_rgba(255,45,120,0.1)]"
                                >
                                    + Add objective
                                </button>
                            )}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
