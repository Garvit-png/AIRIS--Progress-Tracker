import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import {
    Plus,
    CheckCircle2,
    Circle,
    FileUp,
    FileText,
    Image as ImageIcon,
    Clock,
    Trash2,
    Trophy,
    FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { workStore } from '../../services/workStore';

export default function DayDetail({ selectedDate }) {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);

    const isPast = selected < today;
    const isFuture = selected > today;
    const isToday = selected.getTime() === today.getTime();

    const [data, setData] = useState(workStore.getDayData(dateStr));
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isSyncingTasks, setIsSyncingTasks] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        return workStore.subscribe((allData) => {
            setData(workStore.getDayData(dateStr));
        });
    }, [dateStr]);

    const addTask = (e) => {
        e.preventDefault();
        if (!isToday || !newTaskTitle.trim()) return;
        workStore.addTask(dateStr, newTaskTitle);
        setNewTaskTitle('');
    };

    const handleToggleTask = (taskId) => {
        if (!isToday) return;
        setIsSyncingTasks(true);
        setTimeout(() => {
            workStore.toggleTask(dateStr, taskId);
            setIsSyncingTasks(false);
        }, 800);
    };

    const handleFileUpload = (e) => {
        if (!isToday) return;
        const file = e.target.files[0];
        if (!file) return;

        setIsSaving(true);
        // ... same logic ...
        const reader = new FileReader();
        reader.onload = (event) => {
            setTimeout(() => {
                workStore.addProof(dateStr, {
                    name: file.name,
                    type: file.type,
                    url: event.target.result // Base64 for persistence simulation
                });
                setIsSaving(false);
                setLastSaved(new Date());
                setTimeout(() => setLastSaved(null), 3000);
            }, 1500);
        };
        reader.readAsDataURL(file);
    };

    const completedCount = data.tasks.filter(t => t.completed).length;

    return (
        <div className="flex flex-col gap-6 h-full p-2 relative">
            {/* Temporal Locking Overlay for Future */}
            {isFuture && (
                <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-[2px] bg-black/40 rounded-3xl border border-white/5 m-2">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-8 rounded-2xl bg-[#121212] border border-white/10 shadow-2xl flex flex-col items-center text-center max-w-sm"
                    >
                        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20">
                            <Clock className="text-blue-400" size={32} />
                        </div>
                        <h3 className="text-lg font-bold uppercase tracking-widest text-white mb-2">Chronal Barrier</h3>
                        <p className="text-xs text-white/40 leading-relaxed font-mono">
                            The system is currently restricted. Future data nodes are not yet accessible for modification.
                        </p>
                    </motion.div>
                </div>
            )}
            {/* Day Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Tasks</p>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold leading-none">{data.tasks.length}</span>
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                    <p className="text-[9px] uppercase tracking-widest text-green-500/40 mb-1">Completed</p>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold leading-none text-green-500">{completedCount}</span>
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                    <p className="text-[9px] uppercase tracking-widest text-blue-500/40 mb-1">Proofs</p>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold leading-none text-blue-500">{data.proofs.length}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
                {/* To-do List */}
                <div className="flex flex-col gap-4 bg-white/5 border border-white/5 rounded-2xl p-5 overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-sm font-bold uppercase tracking-widest">Active To-Do</h3>
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
                                            animate={{ opacity: 0.4 }}
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
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-white/20 transition-colors pr-12"
                            />
                            <button type="submit" className="absolute right-2 top-2 p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
                                <Plus size={16} />
                            </button>
                        </form>
                    ) : isPast ? (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5 opacity-50">
                            <Clock size={14} className="text-white/40" />
                            <span className="text-[10px] uppercase tracking-widest font-mono text-white/40">Work Archive Locked (Read Only)</span>
                        </div>
                    ) : null}

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                        <AnimatePresence mode="popLayout">
                            {data.tasks.map((task) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={task.id}
                                    className={`group flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${task.completed ? 'bg-green-500/5 border-green-500/10' : 'bg-white/5 border-white/5 hover:border-white/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleToggleTask(task.id)}
                                            className={`transition-colors duration-300 ${task.completed ? 'text-green-500' : 'text-white/20 hover:text-white/40'}`}
                                        >
                                            {task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                        </button>
                                        <span className={`text-xs transition-all duration-300 ${task.completed ? 'text-white/40 line-through' : 'text-white'}`}>
                                            {task.title}
                                        </span>
                                    </div>
                                    {isToday && (
                                        <button
                                            onClick={() => workStore.deleteTask(dateStr, task.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-red-500/40 hover:text-red-500 rounded-lg transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                            {data.tasks.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
                                    <Trophy size={32} className="mb-2" />
                                    <p className="text-[10px] uppercase tracking-widest">No objectives for this cycle</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Proof Section */}
                <div className="flex flex-col gap-4 bg-white/5 border border-white/5 rounded-2xl p-5 overflow-hidden relative">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-sm font-bold uppercase tracking-widest">Verifiable Proof</h3>
                            <div className="flex items-center gap-2">
                                <AnimatePresence mode="wait">
                                    {isSaving ? (
                                        <motion.div
                                            key="saving"
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            className="flex items-center gap-1.5"
                                        >
                                            <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                                            <span className="text-[9px] font-mono text-blue-400 uppercase tracking-tighter">Synchronizing...</span>
                                        </motion.div>
                                    ) : lastSaved ? (
                                        <motion.div
                                            key="saved"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex items-center gap-1.5"
                                        >
                                            <CheckCircle2 size={10} className="text-green-500" />
                                            <span className="text-[9px] font-mono text-green-500 uppercase tracking-tighter">Saved to Archive</span>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="idle"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.4 }}
                                            className="text-[9px] font-mono uppercase tracking-tighter"
                                        >
                                            System Ready
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                        {isToday && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isSaving}
                                className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-[10px] font-bold uppercase transition-all ${isSaving
                                    ? 'bg-blue-500/5 border-blue-500/10 text-blue-400/40 cursor-not-allowed'
                                    : 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20'
                                    }`}
                            >
                                {isSaving ? (
                                    <div className="w-3 h-3 border-b border-blue-400 rounded-full animate-spin" />
                                ) : (
                                    <FileUp size={14} />
                                )}
                                {isSaving ? 'Saving' : 'Upload'}
                            </button>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                            accept="image/*,.pdf,.doc,.docx"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
                        {data.proofs.map((proof) => (
                            <div key={proof.id} className="flex flex-col gap-2 p-3 rounded-xl bg-white/5 border border-white/5 group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-white/5 text-white/40">
                                            {proof.type.includes('image') ? <ImageIcon size={16} /> : <FileText size={16} />}
                                        </div>
                                        <div>
                                            <p className="text-xs truncate max-w-[150px]">{proof.name}</p>
                                            <div className="flex items-center gap-1.5 opacity-40">
                                                <Clock size={10} />
                                                <span className="text-[10px] font-mono">{format(new Date(proof.timestamp), 'HH:mm')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={proof.url}
                                            download={proof.name}
                                            className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                            title="Download"
                                        >
                                            <FileUp size={14} className="rotate-180" />
                                        </a>
                                    </div>
                                </div>
                                {/* Micro Preview for images */}
                                {proof.type.includes('image') && (
                                    <div className="mt-1 h-32 w-full rounded-lg overflow-hidden border border-white/10 bg-black/20">
                                        <img src={proof.url} alt={proof.name} className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {data.proofs.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
                                <FileCheck size={32} className="mb-2" />
                                <p className="text-[10px] uppercase tracking-widest">No evidence recorded</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
