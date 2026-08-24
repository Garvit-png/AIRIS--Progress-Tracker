import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ListFilter, Users, Mail, GraduationCap, ChevronDown, Check, Shield, Clock, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthService } from '../../services/authService';

function getInitials(name) {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length === 1) return name.charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const MemberCard = React.memo(({ user, index, currentUser, onSelect, onRevoke, onMouseEnter }) => {
    if (!user) return null;
    
    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ delay: index * 0.01 }}
            onMouseEnter={() => onMouseEnter(user)}
            onClick={() => onSelect(user)}
            className="group relative grid grid-cols-1 md:grid-cols-12 items-center gap-4 px-6 md:px-8 py-4 bg-transparent border border-transparent hover:border-pink-500/30 hover:bg-pink-500/[0.02] transition-all cursor-pointer rounded-2xl mx-1"
        >
            {/* Name/Identity Sector */}
            <div className="col-span-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-pink-500/20 flex items-center justify-center font-bold text-sm text-white/95 group-hover:border-pink-500/40 transition-all flex-shrink-0 overflow-hidden shadow-inner">
                    {user.profilePicture ? (
                        <img 
                            src={AuthService.getFileUrl(user.profilePicture)} 
                            alt={user.name} 
                            className="w-full h-full object-cover" 
                            loading="lazy"
                        />
                    ) : (
                        <span className="text-[11px] tracking-tight">{getInitials(user.name)}</span>
                    )}
                </div>
                <div className="space-y-0.5 min-w-0">
                    <h3 className="text-sm font-semibold text-white/90 group-hover:text-white truncate">
                        {user.name}
                    </h3>
                    <p className="text-[10px] font-mono text-white/80 uppercase tracking-widest hidden md:block">Identity Confirmed</p>
                    <p className="text-[10px] text-white/95 md:hidden">{user.email}</p>
                </div>
            </div>

            {/* Email Sector */}
            <div className="col-span-3 hidden md:flex items-center gap-2">
                <div className="p-1.5 bg-white/[0.02] rounded-lg border border-pink-500/10">
                    <Mail size={12} className="text-white/50 group-hover:text-blue-500/50" />
                </div>
                <span className="text-[11px] font-mono text-white/85 group-hover:text-white/60 truncate">
                    {user.email}
                </span>
            </div>

            {/* Role Sector */}
            <div className="col-span-2 hidden md:block">
                <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border ${
                        user.isAdmin 
                        ? 'bg-pink-500/10 border-pink-500/20 text-pink-400' 
                        : 'bg-white/5 border-pink-500/20 text-white/90'
                    }`}>
                        {user.role || 'Member'}
                    </span>
                    {user.isAdmin && <Shield size={10} className="text-pink-500/50" />}
                </div>
            </div>

            {/* Batch Sector */}
            <div className="col-span-2 hidden md:flex items-center gap-2">
                <div className="p-1.5 bg-white/[0.02] rounded-lg border border-pink-500/10">
                    <GraduationCap size={12} className="text-white/50 group-hover:text-amber-500/50" />
                </div>
                <span className="text-[10px] font-mono font-bold text-white/85 uppercase tracking-widest">
                    Batch {user.year || 'N/A'}
                </span>
            </div>

            {/* Status/Action Sector */}
            <div className="col-span-1 text-right flex items-center justify-end gap-3">
                {currentUser?.isAdmin && user._id !== currentUser.id && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRevoke(user);
                        }}
                        title="Revoke Access"
                        className="p-1.5 rounded-lg border border-red-500/20 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                        <X size={14} className="flex-shrink-0" />
                    </button>
                )}
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 group-hover:bg-emerald-500 animate-pulse" />
                <ChevronDown size={14} className="text-white/25 group-hover:text-white/85 -rotate-90" />
            </div>
        </motion.div>
    );
});

export default function MembersList() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterYear, setFilterYear] = useState('All'); // All, 1, 2, 3, 4
    const [sortKey, setSortKey] = useState('name'); // name, year
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const currentUser = AuthService.getSession();

    const handlePrefetchPhoto = React.useCallback((u) => {
        if (!u?._id) return;
        queryClient.prefetchQuery({
            queryKey: ['userPhoto', u._id],
            queryFn: () => AuthService.getUserPhoto(u._id),
            staleTime: 1000 * 60 * 60,
        });
    }, [queryClient]);

    // 1. Fetch Users with React Query
    const { data: usersData, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: AuthService.getUsers,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });

    const users = Array.isArray(usersData) ? usersData : [];

    const handleRevokeAccess = async (userToRevoke) => {
        if (!window.confirm(`REVOKE ACCESS FOR ${userToRevoke.name.toUpperCase()}? THEY WILL NEED RE-APPROVAL.`)) return;
        
        setActionLoading(true);
        try {
            await AuthService.updateUserStatus(userToRevoke._id, 'pending', userToRevoke.role);
            queryClient.invalidateQueries({ queryKey: ['users'] });
        } catch (error) {
            alert('Failed to revoke access: ' + error.message);
        } finally {
            setActionLoading(false);
        }
    };


    const filteredUsers = useMemo(() => {
        let result = users.filter(u => u && u.status === 'approved');

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(u => 
                (u.name && u.name.toLowerCase().includes(query)) || 
                (u.email && u.email.toLowerCase().includes(query))
            );
        }

        if (filterYear !== 'All') {
            result = result.filter(u => u.year?.toString() === filterYear);
        }

        result.sort((a, b) => {
            if (a.isAdmin !== b.isAdmin) return a.isAdmin ? -1 : 1;
            if (sortKey === 'name') return (a.name || '').localeCompare(b.name || '');
            if (sortKey === 'year') return (a.year || 0) - (b.year || 0);
            return 0;
        });

        return result;
    }, [users, searchQuery, filterYear, sortKey]);

    const stats = {
        total: users.filter(u => u.status === 'approved').length,
        filtered: filteredUsers.length
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] bg-black/20 rounded-3xl overflow-hidden border border-white/5 backdrop-blur-sm relative">
            {/* Header Control Panel */}
            <div className="p-6 md:p-8 border-b border-white/5 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
                            <Users className="text-pink-500" size={24} />
                            DIRECTORY_CONTROL
                        </h2>
                        <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.3em] mt-1">
                            {stats.filtered} OF {stats.total} ENCRYPTED PROFILES ACTIVE
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative group flex-1 md:flex-initial">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-pink-500 transition-colors" size={16} />
                            <input 
                                type="text"
                                placeholder="SEARCH IDENTITY..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full md:w-64 bg-white/[0.03] border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:border-pink-500/30 transition-all font-mono text-white"
                            />
                        </div>

                        <button 
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`p-2.5 rounded-xl border transition-all ${isFilterOpen ? 'bg-pink-500/20 border-pink-500/50 text-pink-500' : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10'}`}
                        >
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {isFilterOpen && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest px-2">Sort Order</label>
                                    <div className="flex p-1 bg-black/20 rounded-lg">
                                        <button 
                                            onClick={() => setSortKey('name')}
                                            className={`flex-1 py-1 text-[10px] uppercase font-bold rounded-md transition-all ${sortKey === 'name' ? 'bg-pink-500/20 text-pink-500' : 'text-white/30 hover:text-white'}`}
                                        >
                                            Name
                                        </button>
                                        <button 
                                            onClick={() => setSortKey('year')}
                                            className={`flex-1 py-1 text-[10px] uppercase font-bold rounded-md transition-all ${sortKey === 'year' ? 'bg-pink-500/20 text-pink-500' : 'text-white/30 hover:text-white'}`}
                                        >
                                            Batch
                                        </button>
                                    </div>
                                </div>

                                <div className="md:col-span-3 space-y-2">
                                    <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest px-2">Batch Selection</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['All', '1', '2', '3', '4'].map(year => (
                                            <button 
                                                key={year}
                                                onClick={() => setFilterYear(year)}
                                                className={`px-4 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${filterYear === year ? 'bg-pink-500 border-pink-500 text-white' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}`}
                                            >
                                                {year === 'All' ? 'ALL BATCHES' : `BATCH ${year}`}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Members Grid/List Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                {isLoading ? (
                    <div className="space-y-3 p-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-16 bg-white/[0.02] rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-white/20 space-y-4">
                        <Users size={48} strokeWidth={1} />
                        <p className="text-[10px] font-mono uppercase tracking-[0.3em]">No spectral matches in local database</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        <AnimatePresence mode="popLayout">
                            {filteredUsers.map((user, idx) => (
                                <MemberCard 
                                    key={user._id} 
                                    user={user} 
                                    index={idx}
                                    currentUser={currentUser}
                                    onSelect={(u) => setSelectedUser(u)}
                                    onRevoke={handleRevokeAccess}
                                    onMouseEnter={handlePrefetchPhoto}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Profile Drawer Component - Integrated internally for performance */}
            <AnimatePresence>
                {selectedUser && (
                    <div className="absolute inset-0 z-50 flex justify-end">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedUser(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-sm bg-[#0a0a0a] border-l border-white/5 h-full overflow-y-auto custom-scrollbar"
                        >
                            <button 
                                onClick={() => setSelectedUser(null)}
                                className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 text-white/40 hover:text-white transition-all z-10"
                            >
                                <X size={20} />
                            </button>

                            <div className="p-8 space-y-8">
                                <div className="space-y-4">
                                    <div className="w-32 h-32 rounded-3xl bg-pink-500 mx-auto overflow-hidden shadow-2xl shadow-pink-500/20 border-2 border-white/10">
                                        {selectedUser.profilePicture ? (
                                            <img src={AuthService.getFileUrl(selectedUser.profilePicture)} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white">
                                                {getInitials(selectedUser.name)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold text-white">{selectedUser.name}</h3>
                                        <p className="text-xs font-mono text-pink-500/80 uppercase tracking-widest mt-1">{selectedUser.role}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Mail size={16} /></div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Email Address</p>
                                                <p className="text-sm text-white/80 truncate">{selectedUser.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><GraduationCap size={16} /></div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Batch Identity</p>
                                                <p className="text-sm text-white/80">Class of {selectedUser.year}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><Shield size={16} /></div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">System Role</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-white/80">{selectedUser.isAdmin ? 'System Admin' : 'Active Member'}</span>
                                                    {selectedUser.isAdmin && <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            onClick={() => window.location.href = `mailto:${selectedUser.email}`}
                                            className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                                        >
                                            <Mail size={14} /> Send Email
                                        </button>
                                        {currentUser?.isAdmin && selectedUser._id !== currentUser.id && (
                                            <button 
                                                onClick={() => handleRevokeAccess(selectedUser)}
                                                className="py-3 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-xs transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                                            >
                                                <X size={14} /> Revoke
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

