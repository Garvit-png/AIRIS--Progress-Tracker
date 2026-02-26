/**
 * Simple reactive store for Student Work Data
 * Formats data by date: YYYY-MM-DD
 */

const STORE_KEY = 'airis_student_work';

class WorkStore {
    constructor() {
        this.data = JSON.parse(localStorage.getItem(STORE_KEY)) || {};
        this.listeners = [];
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(l => l(this.data));
        localStorage.setItem(STORE_KEY, JSON.stringify(this.data));
    }

    getDayData(dateStr) {
        return this.data[dateStr] || { tasks: [], proofs: [] };
    }

    addTask(dateStr, title, deadline = '') {
        if (!this.data[dateStr]) this.data[dateStr] = { tasks: [], proofs: [] };
        const newTask = {
            id: crypto.randomUUID(),
            title,
            completed: false,
            deadline,
            createdAt: new Date().toISOString()
        };
        this.data[dateStr].tasks.push(newTask);
        this.notify();
        return newTask;
    }

    toggleTask(dateStr, taskId) {
        const day = this.data[dateStr];
        if (!day) return;
        const task = day.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.notify();
        }
    }

    deleteTask(dateStr, taskId) {
        const day = this.data[dateStr];
        if (!day) return;
        day.tasks = day.tasks.filter(t => t.id !== taskId);
        this.notify();
    }

    addProof(dateStr, proofData) {
        if (!this.data[dateStr]) this.data[dateStr] = { tasks: [], proofs: [] };
        const newProof = {
            id: crypto.randomUUID(),
            name: proofData.name,
            type: proofData.type,
            url: proofData.url, // Base64 or local URL
            timestamp: new Date().toISOString()
        };
        this.data[dateStr].proofs.push(newProof);
        this.notify();
        return newProof;
    }

    getWeeklyStats() {
        // Simple logic for current week stats
        const now = new Date();
        const stats = {
            activeDays: 0,
            completedTasks: 0,
            proofsUploaded: 0
        };

        // Check last 7 days
        for (let i = 0; i < 7; i++) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const day = this.data[dateStr];
            if (day) {
                if (day.tasks.length > 0 || day.proofs.length > 0) stats.activeDays++;
                stats.completedTasks += day.tasks.filter(t => t.completed).length;
                stats.proofsUploaded += day.proofs.length;
            }
        }
        return stats;
    }

    getMonthlyStats(year, month) {
        // month is 0-indexed (Jan = 0)
        let totalTasks = 0;
        let completedTasks = 0;
        let proofsUploaded = 0;
        let activeDays = 0;

        Object.keys(this.data).forEach(dateStr => {
            const date = new Date(dateStr);
            if (date.getFullYear() === year && date.getMonth() === month) {
                const day = this.data[dateStr];
                if (day.tasks.length > 0 || day.proofs.length > 0) activeDays++;
                totalTasks += day.tasks.length;
                completedTasks += day.tasks.filter(t => t.completed).length;
                proofsUploaded += day.proofs.length;
            }
        });

        return {
            activeDays,
            totalTasks,
            completedTasks,
            proofsUploaded,
            efficiency: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        };
    }
}

export const workStore = new WorkStore();
