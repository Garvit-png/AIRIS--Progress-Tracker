import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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
import { workStore } from '../../services/workStore';

import DaySummaryCards from './DaySummaryCards';
import TaskSection from './TaskSection';
import ProofSection from './ProofSection';

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
        return workStore.subscribe(() => {
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
        const reader = new FileReader();
        reader.onload = (event) => {
            setTimeout(() => {
                workStore.addProof(dateStr, {
                    name: file.name,
                    type: file.type,
                    url: event.target.result
                });
                setIsSaving(false);
                setLastSaved(new Date());
                setTimeout(() => setLastSaved(null), 3000);
            }, 1000); // Reduced delay from 1500
        };
        reader.readAsDataURL(file);
    };

    const completedCount = data.tasks.filter(t => t.completed).length;

    return (
        <div className="flex flex-col gap-6 h-full p-2 relative">
            {isFuture && (
                <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-[2px] bg-black/40 rounded-3xl border border-white/5 m-2">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-8 rounded-2xl bg-[#121212] border border-white/10 shadow-2xl flex flex-col items-center text-center max-w-sm"
                    >
                        <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center mb-6 border border-pink-500/20">
                            <Clock className="text-pink-400" size={32} />
                        </div>
                        <h3 className="text-lg font-bold uppercase tracking-widest text-white mb-2">Chronal Barrier</h3>
                        <p className="text-xs text-white/85 leading-relaxed font-mono">
                            The system is currently restricted. Future data nodes are not yet accessible for modification.
                        </p>
                    </motion.div>
                </div>
            )}

            <DaySummaryCards data={data} completedCount={completedCount} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
                <TaskSection 
                    tasks={data.tasks}
                    isToday={isToday}
                    isPast={isPast}
                    isSyncingTasks={isSyncingTasks}
                    selectedDate={selectedDate}
                    newTaskTitle={newTaskTitle}
                    setNewTaskTitle={setNewTaskTitle}
                    addTask={addTask}
                    handleToggleTask={handleToggleTask}
                    deleteTask={(taskId) => workStore.deleteTask(dateStr, taskId)}
                />

                <ProofSection 
                    proofs={data.proofs}
                    isToday={isToday}
                    isSaving={isSaving}
                    lastSaved={lastSaved}
                    fileInputRef={fileInputRef}
                    handleFileUpload={handleFileUpload}
                />
            </div>
        </div>
    );
}
