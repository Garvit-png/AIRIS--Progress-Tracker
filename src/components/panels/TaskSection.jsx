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
        <div className="flex flex-col gap-8 bg-white/5 border border-pink-500/10 rounded-[2.5rem] p-10 overflow-hidden min-h-[500px]">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-black uppercase tracking-tight text-white/90">Active to-do</h3>
                    <div className="flex items-center gap-2 h-5">
                        <AnimatePresence mode="wait">
                            {isSyncingTasks ? (
                                <motion.div
                                    key="syncing"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="flex items-center gap-1.5"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                    <span className="text-[10px] font-mono text-emerald-400 capitalize tracking-tighter">Syncing status...</span>
                                </motion.div>
                            ) : (
                                <motion.span
                                    key="date"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.8 }}
                                    className="font-mono text-[10px] uppercase italic text-pink-500/60 font-bold"
                                >
                                    {format(selectedDate, 'MMMM dd, yyyy')}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {isToday ? (
                <form onSubmit={addTask} className="relative mb-4">
                    <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Add a mission objective..."
                        className="w-full bg-white/5 border-2 border-pink-500/20 rounded-2xl px-6 py-5 text-sm focus:outline-none focus:border-pink-500/40 transition-colors pr-16 text-white placeholder:text-white/20"
                    />
                    <button type="submit" className="absolute right-3 top-3 p-2.5 bg-pink-500/10 rounded-xl hover:bg-pink-500/20 text-pink-500 transition-all">
                        <Plus size={20} />
                    </button>
                </form>
            ) : isPast ? (
                <div className="flex items-center gap-3 p-5 rounded-2xl bg-white/5 border border-pink-500/10 opacity-80 mb-4">
                    <Clock size={16} className="text-white/95" />
                    <span className="text-xs tracking-wide font-mono text-white/40 uppercase">Work archive locked</span>
                </div>
            ) : null}

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                <AnimatePresence mode="popLayout">
                    {tasks.map((task) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            key={task.id}
                            className={`group flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${task.completed ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-white/5 border-white/5 hover:border-pink-500/30'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => handleToggleTask(task.id)}
                                    className={`transition-colors duration-300 ${task.completed ? 'text-emerald-500' : 'text-white/40 hover:text-white/90'}`}
                                >
                                    {task.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                                </button>
                                <span className={`text-base font-medium transition-all duration-300 ${task.completed ? 'text-white/30 line-through' : 'text-white/90'}`}>
                                    {task.title}
                                </span>
                            </div>
                            {isToday && (
                                <button
                                    onClick={() => deleteTask(task.id)}
                                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 text-red-500/40 hover:text-red-500 rounded-xl transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </motion.div>
                    ))}
                    {tasks.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 rounded-[2rem] border-2 border-dashed border-pink-500/10 bg-pink-500/[0.02]">
                            <div className="w-16 h-16 rounded-full bg-pink-500/5 flex items-center justify-center mb-6">
                                <Trophy size={28} className="text-pink-500/40" />
                            </div>
                            <p className="text-sm text-white/40 mb-8 font-medium italic">No objectives for this cycle</p>
                            {isToday && (
                                <button 
                                    onClick={() => document.querySelector('input[placeholder="Add a mission objective..."]')?.focus()}
                                    className="px-8 py-3.5 border-2 border-pink-500 text-pink-500 text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-pink-500/10 transition-all shadow-[0_8px_25px_rgba(255,45,120,0.15)]"
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
