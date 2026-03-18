import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ListFilter, Users, Mail, GraduationCap, ChevronDown, Check } from 'lucide-react';
import { AuthService } from '../../services/authService';

export default function MembersList() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterYear, setFilterYear] = useState('All'); // All, 1, 2, 3, 4
    const [sortKey, setSortKey] = useState('name'); // name, year
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const data = await AuthService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to load members:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = useMemo(() => {
        let result = [...users];

        // Search filter (Case-sensitive as requested)
        if (searchQuery) {
            result = result.filter(u => 
                u.name.includes(searchQuery) || 
                u.email.includes(searchQuery)
            );
        }

        // Year filter
        if (filterYear !== 'All') {
            result = result.filter(u => u.year?.toString() === filterYear);
        }

        // Sorting
        result.sort((a, b) => {
            if (sortKey === 'name') {
                return a.name.localeCompare(b.name);
            } else if (sortKey === 'year') {
                return (a.year || 0) - (b.year || 0);
            }
            return 0;
        });

        return result;
    }, [users, searchQuery, filterYear, sortKey]);

    const stats = {
        total: users.length,
        filtered: filteredUsers.length,
        firstYear: users.filter(u => u.year?.toString() === '1').length,
        secondYear: users.filter(u => u.year?.toString() === '2').length
    };

    const yearOptions = [
        { label: 'All Batches', value: 'All' },
        { label: '1st Year', value: '1' },
        { label: '2nd Year', value: '2' },
        { label: '3rd Year', value: '3' },
        { label: '4th Year', value: '4' }
    ];

    return (
        <div className="flex flex-col gap-6 pb-12">
            {/* Perspective Header */}
            <header className="relative p-6 sm:p-8 rounded-3xl bg-[#0a0a0a]/80 border border-white/5 overflow-hidden group backdrop-blur-xl">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full -mr-40 -mt-40 group-hover:bg-blue-500/10 transition-all duration-1000" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/5 blur-[80px] rounded-full -ml-32 -mb-32 group-hover:bg-purple-500/10 transition-all duration-1000" />
                
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                <Users className="w-4 h-4 text-blue-400" />
                            </div>
                            <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-blue-400 font-bold">Registry Database</p>
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Member <span className="text-white/40 font-light italic">Directory</span></h1>
                            <p className="text-white/30 text-[10px] mt-2 font-mono uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                Synchronized with Mainframe
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        <StatBox label="Nodes" value={stats.total} />
                        <StatBox label="Active" value={stats.filtered} highlight={filterYear !== 'All'} />
                        <div className="hidden sm:flex gap-2 sm:gap-3">
                            <StatBox label="Batch 01" value={stats.firstYear} />
                            <StatBox label="Batch 02" value={stats.secondYear} />
                        </div>
                    </div>
                </div>
            </header>

            {/* Control Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                <div className="relative flex-1 group max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-400 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search identities..."
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3.5 pl-12 pr-6 text-sm outline-none focus:border-blue-500/30 focus:bg-white/[0.05] transition-all font-mono text-white/80 placeholder:text-white/10 backdrop-blur-md"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <button 
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-[9px] font-bold uppercase tracking-[0.2em] transition-all border backdrop-blur-xl ${
                                filterYear !== 'All' 
                                ? 'bg-blue-500/10 border-blue-500/40 text-blue-400 shadow-lg shadow-blue-500/10' 
                                : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
                            }`}
                        >
                            <ListFilter size={14} />
                            Sort & Filter
                            <ChevronDown size={14} className={`transition-transform duration-500 ${isFilterOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isFilterOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                                    <motion.div 
                                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                        className="absolute right-0 mt-3 w-56 bg-[#0a0a0a]/90 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20 overflow-hidden backdrop-blur-2xl"
                                    >
                                        <div className="p-4 border-b border-white/5 bg-white/5">
                                            <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/30">Year Filter</p>
                                        </div>
                                        <div className="p-2">
                                            {yearOptions.map((opt) => (
                                                <button 
                                                    key={opt.value}
                                                    onClick={() => { setFilterYear(opt.value); setIsFilterOpen(false); }}
                                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                                                        filterYear === opt.value ? 'bg-blue-500/10 text-blue-400' : 'text-white/40 hover:bg-white/5'
                                                    }`}
                                                >
                                                    {opt.label}
                                                    {filterYear === opt.value && <Check size={12} />}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="p-2 border-t border-white/5">
                                            <p className="px-4 py-3 text-[9px] font-mono uppercase tracking-[0.3em] text-white/30">Organization</p>
                                            <button 
                                                onClick={() => { setSortKey('name'); setIsFilterOpen(false); }}
                                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                                                    sortKey === 'name' ? 'bg-purple-500/10 text-purple-400' : 'text-white/40 hover:bg-white/5'
                                                }`}
                                            >
                                                Name A-Z
                                                {sortKey === 'name' && <Check size={12} />}
                                            </button>
                                            <button 
                                                onClick={() => { setSortKey('year'); setIsFilterOpen(false); }}
                                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                                                    sortKey === 'year' ? 'bg-purple-500/10 text-purple-400' : 'text-white/40 hover:bg-white/5'
                                                }`}
                                            >
                                                Batch Year
                                                {sortKey === 'year' && <Check size={12} />}
                                            </button>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 px-1">
                {isLoading ? (
                    [1, 2, 4, 5, 6, 8, 9].map(i => (
                        <div key={i} className="h-32 bg-white/[0.02] border border-white/5 rounded-3xl animate-pulse" />
                    ))
                ) : filteredUsers.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="col-span-full py-24 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-[2rem]"
                    >
                        <div className="p-6 bg-white/[0.02] rounded-full border border-white/5 mb-6">
                            <Users size={32} strokeWidth={1} className="text-white/20" />
                        </div>
                        <p className="font-mono text-[9px] uppercase tracking-[0.5em] text-white/20">Zero spectral matches</p>
                    </motion.div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredUsers.map((user, index) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.02 }}
                                key={user._id}
                                className="group relative p-6 bg-white/[0.03] border border-white/5 rounded-3xl hover:bg-white/[0.06] hover:border-blue-500/20 transition-all duration-500 backdrop-blur-xl flex flex-col justify-between overflow-hidden"
                            >
                                {/* Glow Effect */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/0 blur-2xl rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/5 transition-all duration-700 pointer-events-none" />

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="w-10 h-10 rounded-xl bg-[#0a0a0a] border border-white/5 flex items-center justify-center font-bold text-base text-white/40 group-hover:border-blue-500/40 group-hover:text-blue-400 transition-all">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className={`px-2.5 py-1 rounded-full text-[8px] font-bold uppercase tracking-[0.2em] border ${
                                            user.role === 'admin' 
                                            ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' 
                                            : 'bg-white/5 border-white/10 text-white/30 group-hover:text-white/60'
                                        }`}>
                                            {user.role}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-base font-bold text-white/90 group-hover:text-white transition-colors truncate">
                                            {user.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1 px-1">
                                            <Mail size={12} className="text-white/20 group-hover:text-blue-400/50 transition-colors" />
                                            <span className="text-[10px] font-mono text-white/30 group-hover:text-white/50 truncate">
                                                {user.email}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-5 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <GraduationCap size={14} className="text-white/20" />
                                        <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-white/40 group-hover:text-white/60">
                                            Batch {user.year || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex gap-1.5">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-1 h-1 rounded-full bg-white/5 group-hover:bg-blue-500/20 transition-all" />
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="absolute top-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-700" />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
            
            <style jsx>{`
                .backdrop-blur-2xl { backdrop-filter: blur(40px); }
                @keyframes scan {
                    0% { top: 0; }
                    100% { top: 100%; }
                }
            `}</style>
        </div>
    );
}

function StatBox({ label, value, highlight }) {
    return (
        <div className={`px-4 sm:px-6 py-3 sm:py-4 rounded-2xl bg-white/[0.02] border transition-all ${
            highlight ? 'border-blue-500/30 bg-blue-500/5' : 'border-white/5'
        }`}>
            <p className="text-[8px] sm:text-[9px] font-mono uppercase tracking-[0.3em] text-white/20 mb-1">{label}</p>
            <p className={`text-lg sm:text-xl font-bold ${highlight ? 'text-blue-400' : 'text-white/80'}`}>{value}</p>
        </div>
    );
}
