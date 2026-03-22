import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ListFilter, Users, Mail, GraduationCap, ChevronDown, Check, Shield, Clock, X } from 'lucide-react';
import { AuthService } from '../../services/authService';

export default function MembersList() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [photoCache, setPhotoCache] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [filterYear, setFilterYear] = useState('All'); // All, 1, 2, 3, 4
    const [sortKey, setSortKey] = useState('name'); // name, year
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({ name: '', role: '', isAdmin: false });
    const [actionLoading, setActionLoading] = useState(false);
    const currentUser = AuthService.getSession();
    // Ref to track component mount status
    const isMounted = React.useRef(true);
    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    useEffect(() => {
        fetchUsers();
    }, []);


    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const data = await AuthService.getUsers();
            if (!isMounted.current) return;
            setUsers(data);

        } catch (error) {
            console.error('Failed to load members:', error);
        } finally {
            if (isMounted.current) setIsLoading(false);
        }
    };

    const handleRevokeAccess = async (userToRevoke) => {
        if (!window.confirm(`REVOKE ACCESS FOR ${userToRevoke.name.toUpperCase()}? THEY WILL NEED RE-APPROVAL.`)) return;
        
        setActionLoading(true);
        try {
            await AuthService.updateUserStatus(userToRevoke._id, 'pending', userToRevoke.role);
            setSelectedUser(null);
            fetchUsers();
        } catch (error) {
            alert('Failed to revoke access: ' + error.message);
        } finally {
            setActionLoading(false);
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
            // Prioritize System Admins
            if (a.isAdmin !== b.isAdmin) {
                return a.isAdmin ? -1 : 1;
            }
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
            <header className="relative p-4 sm:p-5 rounded-[2rem] bg-[#0a0a0a]/95 border border-pink-500/20 overflow-hidden group">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-pink-500/10 rounded-xl border border-pink-500/20">
                                <Users className="w-4 h-4 text-pink-400" />
                            </div>
                            <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-pink-400 font-bold">Registry Database</p>
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Member <span className="text-white/95 font-light italic text-lg sm:text-xl">Directory</span></h1>
                            <p className="text-white/90 text-[9px] mt-1 font-mono uppercase tracking-widest flex items-center gap-2">
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
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/80 group-focus-within:text-pink-400 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search identities..."
                        className="w-full bg-white/[0.03] border border-pink-500/20 rounded-2xl py-3 pl-12 pr-6 text-sm outline-none focus:border-pink-500/40 focus:bg-white/[0.05] transition-all font-mono text-white/90 placeholder:text-white/40"
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
                                ? 'bg-pink-500/10 border-pink-500/40 text-pink-400 shadow-lg shadow-pink-500/10' 
                                : 'bg-white/5 border-pink-500/20 text-white/80 hover:border-pink-500/30'
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
                                        className="absolute right-0 mt-3 w-56 bg-[#0a0a0a]/90 border border-pink-500/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20 overflow-hidden backdrop-blur-2xl"
                                    >
                                        <div className="p-4 border-b border-pink-500/10 bg-white/5">
                                            <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/90">Year Filter</p>
                                        </div>
                                        <div className="p-2">
                                            {yearOptions.map((opt) => (
                                                <button 
                                                    key={opt.value}
                                                    onClick={() => { setFilterYear(opt.value); setIsFilterOpen(false); }}
                                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                                                        filterYear === opt.value ? 'bg-blue-500/10 text-blue-400' : 'text-white/95 hover:bg-white/5'
                                                    }`}
                                                >
                                                    {opt.label}
                                                    {filterYear === opt.value && <Check size={12} />}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="p-2 border-t border-pink-500/10">
                                            <p className="px-4 py-3 text-[9px] font-mono uppercase tracking-[0.3em] text-white/90">Organization</p>
                                            <button 
                                                onClick={() => { setSortKey('name'); setIsFilterOpen(false); }}
                                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                                                    sortKey === 'name' ? 'bg-pink-500/10 text-pink-400' : 'text-white/85 hover:bg-white/5'
                                                }`}
                                            >
                                                Name A-Z
                                                {sortKey === 'name' && <Check size={12} />}
                                            </button>
                                            <button 
                                                onClick={() => { setSortKey('year'); setIsFilterOpen(false); }}
                                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                                                    sortKey === 'year' ? 'bg-pink-500/10 text-pink-400' : 'text-white/85 hover:bg-white/5'
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

            {/* Member List Table */}
            <div className="bg-[#0a0a0a]/40 border border-pink-500/20 rounded-[2rem] overflow-hidden backdrop-blur-xl shadow-2xl">
                {/* Table Header - Visible on desktop */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-4 border-b border-pink-500/15 bg-white/[0.02]">
                    <div className="col-span-4 text-[9px] font-mono uppercase tracking-[0.3em] text-white/80">Identity / Name</div>
                    <div className="col-span-3 text-[9px] font-mono uppercase tracking-[0.3em] text-white/80">Email Address</div>
                    <div className="col-span-2 text-[9px] font-mono uppercase tracking-[0.3em] text-white/80">Designation</div>
                    <div className="col-span-2 text-[9px] font-mono uppercase tracking-[0.3em] text-white/80">Registry Batch</div>
                    <div className="col-span-1 text-right text-[9px] font-mono uppercase tracking-[0.3em] text-white/80">Status</div>
                </div>

                <div className="divide-y divide-pink-500/10">
                {isLoading ? (
                    <div className="divide-y divide-pink-500/10">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="grid grid-cols-1 md:grid-cols-12 items-center gap-4 px-6 md:px-8 py-4 animate-pulse">
                                <div className="col-span-4 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex-shrink-0" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-3 w-32 bg-white/[0.05] rounded-full" />
                                        <div className="h-2 w-20 bg-white/[0.02] rounded-full" />
                                    </div>
                                </div>
                                <div className="col-span-3 hidden md:flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-white/[0.05]" />
                                    <div className="h-2 w-32 bg-white/[0.02] rounded-full" />
                                </div>
                                <div className="col-span-2 hidden md:block">
                                    <div className="h-5 w-16 bg-white/[0.05] rounded-full" />
                                </div>
                                <div className="col-span-2 hidden md:block">
                                    <div className="h-2 w-16 bg-white/[0.02] rounded-full" />
                                </div>
                                <div className="col-span-1 flex justify-end">
                                    <div className="w-4 h-4 bg-white/[0.05] rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="col-span-full py-24 flex flex-col items-center justify-center border border-dashed border-pink-500/20 rounded-[2rem]"
                    >
                        <div className="p-6 bg-white/[0.02] rounded-full border border-pink-500/20 mb-6">
                            <Users size={32} strokeWidth={1} className="text-white/50" />
                        </div>
                        <p className="font-mono text-[9px] uppercase tracking-[0.5em] text-white/50">Zero spectral matches</p>
                    </motion.div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredUsers.map((user, index) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ delay: index * 0.01 }}
                                key={user._id}
                                onClick={async () => {
                                    setSelectedUser(user);
                                    setEditData({ name: user.name, role: user.role || 'Member', isAdmin: !!user.isAdmin });
                                    setEditMode(false);
                                    
                                    // Extreme Performance: Use Cache first
                                    if (photoCache[user._id]) {
                                        setSelectedUser(prev => prev && prev._id === user._id ? { ...prev, profilePicture: photoCache[user._id] } : prev);
                                        return;
                                    }

                                    // Fetch full photo on demand if not in cache
                                    try {
                                        const photo = await AuthService.getUserPhoto(user._id);
                                        if (photo) {
                                            setPhotoCache(prev => ({ ...prev, [user._id]: photo })); // Store in cache
                                            setSelectedUser(prev => prev && prev._id === user._id ? { ...prev, profilePicture: photo } : prev);
                                        }
                                    } catch (err) {
                                        console.error('Failed to load user photo:', err);
                                    }
                                }}
                                className="group relative grid grid-cols-1 md:grid-cols-12 items-center gap-4 px-6 md:px-8 py-4 bg-transparent border border-transparent hover:border-pink-500/30 hover:bg-pink-500/[0.02] transition-all cursor-pointer rounded-2xl mx-1"
                            >
                                {/* Name/Identity Sector */}
                                <div className="col-span-4 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-pink-500/20 flex items-center justify-center font-bold text-sm text-white/95 group-hover:border-pink-500/40 transition-all flex-shrink-0 overflow-hidden">
                                        {user.profilePicture ? (
                                            <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            user.name.charAt(0).toUpperCase()
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
                                                handleRevokeAccess(user);
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
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>

            {/* Member Details Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedUser(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg bg-[#0a0a0a] border border-pink-500/30 rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
                        >
                            {/* Modal Header/Profile Image Area */}
                            <div className="h-32 bg-gradient-to-br from-pink-600/20 via-pink-600/20 to-transparent relative">
                                <button 
                                    onClick={() => setSelectedUser(null)}
                                    className="absolute top-6 right-6 w-8 h-8 rounded-full bg-black/40 border border-pink-500/20 flex items-center justify-center text-white/95 hover:text-white hover:bg-black/60 transition-all z-20"
                                >
                                    ×
                                </button>
                                <div className="absolute -bottom-10 left-8">
                                    <div className="w-24 h-24 rounded-3xl bg-[#0a0a0a] border-4 border-[#0a0a0a] p-1">
                                        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-pink-500 to-pink-500 flex items-center justify-center text-3xl font-bold text-white shadow-2xl overflow-hidden">
                                            {selectedUser.profilePicture ? (
                                                <img src={selectedUser.profilePicture} alt={selectedUser.name} className="w-full h-full object-cover" />
                                            ) : (
                                                selectedUser.name.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-14 pb-8 px-8 space-y-8">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-2xl font-bold text-white tracking-tight">{selectedUser.name}</h2>
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border ${
                                            selectedUser.isAdmin 
                                            ? 'bg-pink-500/10 border-pink-500/20 text-pink-400' 
                                            : 'bg-white/5 border-pink-500/20 text-white/95'
                                        }`}>
                                            {selectedUser.role || 'Member'}
                                        </span>
                                        {selectedUser.isAdmin && <Shield size={12} className="text-pink-500" />}
                                    </div>
                                    <p className="text-white/90 text-[11px] font-mono uppercase tracking-[0.3em] mt-1">Registry Identity #{selectedUser._id?.slice(-12)}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <DetailItem label="Email Endpoint" value={selectedUser.email} icon={<Mail size={14} className="text-blue-400" />} />
                                    <DetailItem label="Assigned Batch" value={`BATCH 0${selectedUser.year || '?'}`} icon={<GraduationCap size={14} className="text-amber-400" />} />
                                    <DetailItem label="Clearance Level" value={selectedUser.isAdmin ? 'S-CLASS (ADMIN)' : 'LEVEL-02 (MEMBER)'} icon={<Shield size={14} className="text-pink-400" />} />
                                    <DetailItem label="Join Date" value={new Date(selectedUser.createdAt).toLocaleDateString()} icon={<Clock size={14} className="text-emerald-400" />} />
                                </div>

                                {/* Identity Management Suite (Admin Only) */}
                                {currentUser?.isAdmin && (
                                    <div className="space-y-4 p-5 bg-white/[0.02] border border-pink-500/10 rounded-[2rem]">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-pink-500/80 font-bold">Identity Configuration</p>
                                            <button 
                                                onClick={() => setEditMode(!editMode)}
                                                className="text-[9px] font-bold uppercase tracking-widest text-white/75 hover:text-white transition-colors"
                                            >
                                                {editMode ? 'CANCEL' : 'OVERRIDE'}
                                            </button>
                                        </div>

                                        {editMode ? (
                                            <div className="space-y-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[8px] font-mono uppercase tracking-widest text-white/70 ml-2">Public Identity</label>
                                                    <input 
                                                        type="text"
                                                        value={editData.name}
                                                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                                                        className="w-full bg-white/[0.03] border border-pink-500/20 rounded-xl py-3 px-4 text-xs outline-none focus:border-pink-500/50 transition-all font-mono"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[8px] font-mono uppercase tracking-widest text-white/70 ml-2">Designation / Title</label>
                                                    <input 
                                                        type="text"
                                                        value={editData.role}
                                                        placeholder="President, Gen Sec, etc."
                                                        onChange={(e) => setEditData({...editData, role: e.target.value})}
                                                        className="w-full bg-white/[0.03] border border-pink-500/20 rounded-xl py-3 px-4 text-xs outline-none focus:border-pink-500/50 transition-all font-mono"
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-white/[0.03] border border-pink-500/10 rounded-xl">
                                                    <div className="flex items-center gap-2">
                                                        <Shield size={14} className="text-pink-500" />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">Admin Permissions</span>
                                                    </div>
                                                    <input 
                                                        type="checkbox"
                                                        checked={editData.isAdmin}
                                                        onChange={(e) => setEditData({...editData, isAdmin: e.target.checked})}
                                                        className="accent-pink-500 w-4 h-4"
                                                    />
                                                </div>
                                                <button 
                                                    onClick={async () => {
                                                        setActionLoading(true);
                                                        try {
                                                            await AuthService.updateUserStatus(selectedUser._id, selectedUser.status, editData.role, editData.isAdmin, editData.name);
                                                            showMsg('Identity Updated', 'success');
                                                            setEditMode(false);
                                                            fetchUsers();
                                                            // Also update selected user locally to reflect changes in modal
                                                            setSelectedUser({...selectedUser, name: editData.name, role: editData.role, isAdmin: editData.isAdmin});
                                                        } catch (error) {
                                                            alert('Update failed: ' + error.message);
                                                        } finally {
                                                            setActionLoading(false);
                                                        }
                                                    }}
                                                    className="w-full py-3 bg-pink-600 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-pink-700 transition-all"
                                                >
                                                    {actionLoading ? 'UPDATING...' : 'Commit Changes'}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between text-white/80">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-white/5 rounded-lg">
                                                        <Users size={14} className="text-white/40" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-bold uppercase tracking-widest">{selectedUser.name}</p>
                                                        <p className="text-[8px] font-mono uppercase tracking-widest opacity-50">{selectedUser.role || 'Member'}</p>
                                                    </div>
                                                </div>
                                                {selectedUser.isAdmin && (
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-pink-500/10 border border-pink-500/20 rounded-full">
                                                        <Shield size={10} className="text-pink-500" />
                                                        <span className="text-[8px] font-bold uppercase text-pink-500">ROOT ACCESS</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="pt-4 flex gap-3">
                                    {currentUser?.isAdmin && selectedUser?._id !== currentUser?.id && (
                                        <button 
                                            onClick={() => handleRevokeAccess(selectedUser)}
                                            disabled={actionLoading}
                                            className="flex-1 py-4 bg-red-600 text-white font-bold text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-red-700 transition-all disabled:opacity-50"
                                        >
                                            {actionLoading ? 'REVOKING...' : 'Revoke Access'}
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => setSelectedUser(null)}
                                        className="flex-1 py-4 bg-white/5 border border-pink-500/20 text-white/95 font-bold text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-white/10 hover:text-white transition-all"
                                    >
                                        Close Portal
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            
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
        <div className={`px-4 sm:px-5 py-2 sm:py-3 rounded-xl bg-white/[0.02] border transition-all ${
            highlight ? 'border-pink-500/30 bg-pink-500/5' : 'border-pink-500/15'
        }`}>
            <p className="text-[8px] font-mono uppercase tracking-[0.3em] text-white/80 mb-0.5">{label}</p>
            <p className={`text-sm sm:text-base font-bold ${highlight ? 'text-pink-400' : 'text-white/90'}`}>{value}</p>
        </div>
    );
}

function DetailItem({ label, value, icon }) {
    return (
        <div className="p-4 bg-white/[0.02] border border-pink-500/15 rounded-2xl space-y-2">
            <div className="flex items-center gap-2">
                {icon}
                <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/80">{label}</p>
            </div>
            <p className="text-xs font-semibold text-white/90 truncate">{value}</p>
        </div>
    );
}
