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
                    <h3 className="text-sm font-bold tracking-tight text-white/90">Active To-Do</h3>
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
                                    <span className="text-[9px] font-mono text-green-400 uppercase tracking-tighter">Syncing Status...</span>
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
                        className="w-full bg-white/5 border border-pink-500/20 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-pink-500/40 transition-colors pr-12"
                    />
                    <button type="submit" className="absolute right-2 top-2 p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
                        <Plus size={16} />
                    </button>
                </form>
            ) : isPast ? (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-pink-500/10 opacity-80">
                    <Clock size={14} className="text-white/95" />
                    <span className="text-[10px] uppercase tracking-widest font-mono text-white/95">Work Archive Locked (Read Only)</span>
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
                            className={`group flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${task.completed ? 'bg-green-500/5 border-green-500/10' : 'bg-white/5 border-pink-500/10 hover:border-pink-500/30'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleToggleTask(task.id)}
                                    className={`transition-colors duration-300 ${task.completed ? 'text-green-500' : 'text-white/60 hover:text-white/95'}`}
                                >
                                    {task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                </button>
                                <span className={`text-xs transition-all duration-300 ${task.completed ? 'text-white/95 line-through' : 'text-white'}`}>
                                    {task.title}
                                </span>
                            </div>
                            {isToday && (
                                <button
                                    onClick={() => deleteTask(task.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-red-500/40 hover:text-red-500 rounded-lg transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </motion.div>
                    ))}
                    {tasks.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-pink-500/10 rounded-2xl bg-pink-500/[0.02] group/empty transition-all hover:border-pink-500/20">
                            <div className="w-12 h-12 rounded-full bg-pink-500/5 flex items-center justify-center mb-4 group-hover/empty:scale-110 transition-transform">
                                <Trophy size={24} className="text-pink-500/40" />
                            </div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold mb-4">No objectives for this cycle</p>
                            {isToday && (
                                <button 
                                    onClick={() => document.querySelector('input[placeholder*="mission objective"]')?.focus()}
                                    className="flex items-center gap-2 px-4 py-2 bg-pink-500/10 border border-pink-500/20 rounded-lg text-pink-500 text-[9px] font-black uppercase tracking-widest hover:bg-pink-500 hover:text-white transition-all shadow-lg shadow-pink-500/10"
                                >
                                    <Plus size={12} />
                                    <span>Add Objective</span>
                                </button>
                            )}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
