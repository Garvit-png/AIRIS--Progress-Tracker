import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, 
    Plus, 
    Github, 
    ExternalLink, 
    UserPlus, 
    UserMinus, 
    Trash2, 
    ClipboardList,
    AlertCircle,
    ChevronRight,
    Search,
    Clock,
    CheckCircle2,
    Edit2,
    X
} from 'lucide-react';
import { AuthService } from '../../services/authService';

const GroupPortal = () => {
    const [user, setUser] = useState(AuthService.getSession());
    
    // INSTANT LOAD: Initialize from cache if available
    const [groups, setGroups] = useState(AuthService.cache.get('groups') || []);
    const [allUsers, setAllUsers] = useState(AuthService.cache.get('users') || []);
    
    // Only show blocking loader if we have NO cached data AND no groups in state
    const [loading, setLoading] = useState(!AuthService.cache.get('groups') && groups.length === 0);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isLongSync, setIsLongSync] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); 
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [newGroup, setNewGroup] = useState({ name: '', description: '', repoUrl: '' });
    const [editingGroup, setEditingGroup] = useState(null);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [taskData, setTaskData] = useState({ title: '', description: '', deadline: '', isPriority: true });

    const isAdmin = user?.isAdmin || ['president', 'general secretary', 'admin'].includes(user?.role?.toLowerCase());

    const fetchGroups = async () => {
        setIsSyncing(true);
        try {
            const data = await AuthService.getGroups();
            setGroups(data);
        } catch (err) {
            console.error('Group fetch failed:', err);
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        let longSyncTimer;
        
        const fetchAllData = async () => {
            const syncGroups = async () => {
                setIsSyncing(true);
                setError(null);
                
                // Set a timer to detect slow server response (Cold Start)
                longSyncTimer = setTimeout(() => setIsLongSync(true), 3000);
                
                try {
                    const data = await AuthService.getGroups();
                    setGroups(data);
                    setIsLongSync(false);
                } catch (err) {
                    console.error('Group sync failed:', err);
                    if (!groups.length) {
                        setError(err.message.includes('TIMEOUT') 
                            ? 'The server is taking a while to wake up. Please wait or try again.' 
                            : 'CONNECTION FAILED: Check your internet or server status.');
                    }
                } finally {
                    clearTimeout(longSyncTimer);
                    setLoading(false);
                    setIsSyncing(false);
                    setIsLongSync(false);
                }
            };

            const syncUsers = async () => {
                if (!isAdmin) return;
                try {
                    const data = await AuthService.getUsers();
                    setAllUsers(data);
                } catch (err) {
                    console.warn('User roster sync failed.', err);
                }
            };

            syncGroups();
            syncUsers();
        };

        fetchAllData();
        return () => clearTimeout(longSyncTimer);
    }, [isAdmin]);

    // Manual refresh helper
    const handleRefresh = async () => {
        setIsSyncing(true);
        try {
            const data = await AuthService.getGroups();
            setGroups(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            await AuthService.createGroup(newGroup);
            setIsCreateModalOpen(false);
            setNewGroup({ name: '', description: '', repoUrl: '' });
            fetchGroups();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleEditGroup = async (e) => {
        e.preventDefault();
        try {
            await AuthService.updateGroup(editingGroup._id, editingGroup);
            setIsEditModalOpen(false);
            setEditingGroup(null);
            fetchGroups();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteGroup = async (id) => {
        if (!window.confirm('Are you sure you want to dissolve this project group?')) return;
        try {
            await AuthService.deleteGroup(id);
            fetchGroups();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleAddMember = async (groupId, userId) => {
        const group = groups.find(g => g._id === groupId);
        if (group.members.some(m => m._id === userId)) return;

        const updatedMembers = [...group.members.map(m => m._id), userId];
        try {
            await AuthService.updateGroup(groupId, { members: updatedMembers });
            fetchGroups();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleRemoveMember = async (groupId, userId) => {
        const group = groups.find(g => g._id === groupId);
        const updatedMembers = group.members.filter(m => m._id !== userId).map(m => m._id);
        
        try {
            await AuthService.updateGroup(groupId, { members: updatedMembers });
            fetchGroups();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleAssignGroupTask = async (e) => {
        e.preventDefault();
        try {
            await AuthService.assignGroupTask(selectedGroup._id, taskData);
            setIsAssignTaskModalOpen(false);
            setTaskData({ title: '', description: '', deadline: '', isPriority: true });
            alert('Priority task dispatched to all group members!');
        } catch (err) {
            alert(err.message);
        }
    };

    const GitHubStats = ({ repoUrl }) => {
        // Use cached stats if available for instant render
        const [stats, setStats] = useState(AuthService.cache.get(`github_${repoUrl}`));
        const [repoLoading, setRepoLoading] = useState(!stats);
        const [showRoster, setShowRoster] = useState(false);

        useEffect(() => {
            if (repoUrl) fetchRepoStats();
        }, [repoUrl]);

        const fetchRepoStats = async () => {
            if (!repoUrl) return;
            try {
                // Clean the URL to get the repo slug (owner/repo)
                let slug = repoUrl.replace('https://github.com/', '');
                if (slug.endsWith('.git')) slug = slug.slice(0, -4);
                slug = slug.split('/').slice(0, 2).join('/');
                if (!slug) return;

                // Concurrent fetching for Intelligence Streams
                const [contribRes, repoRes, langRes] = await Promise.all([
                    fetch(`https://api.github.com/repos/${slug}/stats/contributors`),
                    fetch(`https://api.github.com/repos/${slug}`),
                    fetch(`https://api.github.com/repos/${slug}/languages`)
                ]);

                // 202 status means GitHub is still computing stats
                if (contribRes.status === 202) return;
                
                const [contribData, repoData, langData] = await Promise.all([
                    contribRes.json(),
                    repoRes.json(),
                    langRes.json()
                ]);
                
                if (Array.isArray(contribData)) {
                    const sorted = [...contribData].sort((a, b) => b.total - a.total);
                    
                    // Process Language Profile (Top 3)
                    const totalBytes = Object.values(langData).reduce((a, b) => a + b, 0);
                    const languages = Object.entries(langData)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3)
                        .map(([name, bytes]) => ({
                            name,
                            percent: Math.round((bytes / totalBytes) * 100)
                        }));

                    const newStats = {
                        totalCommits: contribData.reduce((acc, curr) => acc + curr.total, 0),
                        contributors: sorted.map(c => ({
                            login: c.author.login,
                            avatar: c.author.avatar_url,
                            commits: c.total
                        })),
                        profile: {
                            stars: repoData.stargazers_count,
                            forks: repoData.forks_count,
                            openIssues: repoData.open_issues_count,
                            lastUpdated: repoData.pushed_at,
                            primaryLanguage: repoData.language,
                            languages
                        }
                    };
                    setStats(newStats);
                    AuthService.cache.set(`github_${repoUrl}`, newStats);
                }
            } catch (err) {
                console.error('GitHub Intelligence Error:', err);
            } finally {
                setRepoLoading(false);
            }
        };

        if (repoLoading && !stats) return <div className="animate-pulse h-4 w-20 bg-white/5 rounded" />;
        if (!stats) return <span className="text-[10px] text-white/20">NO GITHUB DATA LINKED</span>;

        return (
            <div className="space-y-4">
                <div className="flex flex-col gap-4">
                    {/* Primary Intelligence Row */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-pink-500/10 border border-pink-500/20 rounded-full">
                            <Github size={12} className="text-pink-500" />
                            <span className="text-[10px] font-mono font-bold text-pink-400 uppercase tracking-tighter">{stats.totalCommits} COMMITS</span>
                        </div>
                        
                        {stats.profile && (
                            <>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                                    <Clock size={10} className="text-white/40" />
                                    <span className="text-[9px] font-mono text-white/60 uppercase">
                                        PULSE: {new Date(stats.profile.lastUpdated).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-mono text-white/30 ml-auto">
                                    <span className="flex items-center gap-1"><CheckCircle2 size={10} className="text-green-500/50" /> {stats.profile.openIssues} ISSUES</span>
                                    <span className="flex items-center gap-1"><Users size={10} /> {stats.profile.contributors.length} CONTRIBUTORS</span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Tech Stack Row */}
                    {stats.profile?.languages && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                            <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest mr-1">Stack:</span>
                            {stats.profile.languages.map(lang => (
                                <div key={lang.name} className="flex items-center gap-1.5 px-2 py-0.5 bg-white/[0.03] border border-white/5 rounded-md shrink-0">
                                    <span className="text-[9px] font-bold text-white/80">{lang.name.toUpperCase()}</span>
                                    <span className="text-[8px] font-mono text-pink-500/60">{lang.percent}%</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <button 
                        onClick={(e) => { e.stopPropagation(); setShowRoster(!showRoster); }}
                        className="text-[10px] font-mono text-white/40 hover:text-white transition-all uppercase tracking-widest flex items-center gap-1 w-fit group/btn"
                    >
                        {showRoster ? 'Collapse Intelligence' : 'Examine Contributor Roster'}
                        <ChevronRight size={12} className={`transition-transform duration-300 ${showRoster ? 'rotate-90' : 'group-hover/btn:translate-x-1'}`} />
                    </button>
                </div>

                <AnimatePresence>
                    {showRoster && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-white/5 pt-4 space-y-3"
                        >
                            <label className="text-[9px] font-mono text-white/20 uppercase tracking-[0.2em] block mb-2">Member Throughput Tracking</label>
                            <div className="grid grid-cols-1 gap-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                                {stats.contributors.map((c, i) => (
                                    <div key={c.login} className="flex items-center justify-between bg-white/[0.02] p-2 rounded-lg border border-white/5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-mono text-white/20 w-4">{i + 1}</span>
                                            <img src={c.avatar} className="w-5 h-5 rounded-md border border-white/10" alt="" />
                                            <span className="text-[10px] font-bold text-white/70">{c.login.toUpperCase()}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="h-1 w-20 bg-white/5 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-pink-500 rounded-full" 
                                                    style={{ width: `${Math.min(100, (c.commits / stats.totalCommits) * 100 * 2)}%` }} 
                                                />
                                            </div>
                                            <span className="text-[10px] font-mono font-bold text-pink-500 w-12 text-right">{c.commits} COM</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const renderAdminView = () => (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight uppercase">Group Command Center</h2>
                    <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] mt-1">Global Project Oversight</p>
                </div>
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-pink-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-pink-600 transition-all shadow-lg shadow-pink-500/20"
                >
                    <Plus size={14} />
                    New Project Group
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {groups.map(group => (
                    <motion.div 
                        layout
                        key={group._id}
                        className="bg-white/[0.03] border border-pink-500/10 rounded-2xl overflow-hidden hover:border-pink-500/30 transition-all group"
                    >
                        <div className="p-6 space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-base font-bold text-white uppercase">{group.name}</h3>
                                    <p className="text-xs text-white/40 line-clamp-1">{group.description || 'No description provided.'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => {
                                            setEditingGroup(group);
                                            setIsEditModalOpen(true);
                                        }}
                                        className="p-2 bg-white/5 border border-white/10 rounded-lg text-white/40 hover:text-pink-500 hover:bg-pink-500/10 transition-all"
                                        title="Edit Group Details"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setSelectedGroup(group);
                                            setIsAssignTaskModalOpen(true);
                                        }}
                                        className="p-2 bg-white/5 border border-white/10 rounded-lg text-white/40 hover:text-pink-500 hover:bg-pink-500/10 transition-all"
                                        title="Assign Priority Task"
                                    >
                                        <ClipboardList size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteGroup(group._id)}
                                        className="p-2 bg-white/5 border border-white/10 rounded-lg text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                        title="Dissolve Group"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="py-3 border-y border-white/5">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Active Repository</span>
                                    {group.repoUrl ? (
                                        <a href={group.repoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-pink-400 hover:text-white transition-colors">
                                            VIEW REPO <ExternalLink size={10} />
                                        </a>
                                    ) : (
                                        <span className="text-[10px] text-white/20">NOT LINKED</span>
                                    )}
                                </div>
                                <GitHubStats repoUrl={group.repoUrl} />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Team Members ({group.members.length})</span>
                                    <button 
                                        onClick={() => {
                                            setSelectedGroup(group);
                                            fetchGroups(); // Refresh to ensure updated lists
                                        }}
                                        className="text-[9px] font-bold text-pink-400 uppercase tracking-widest hover:text-white"
                                    >
                                        Manage Roster
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {group.members.map(member => (
                                        <div key={member._id} className="relative group/member">
                                            <div className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-500/20 flex items-center justify-center text-[10px] font-bold text-pink-400 overflow-hidden" title={member.name}>
                                                {member.profilePicture ? (
                                                    <img src={AuthService.getFileUrl(member.profilePicture)} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    member.name[0].toUpperCase()
                                                )}
                                            </div>
                                            <button 
                                                onClick={() => handleRemoveMember(group._id, member._id)}
                                                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/member:opacity-100 transition-all scale-75 hover:scale-100"
                                            >
                                                <X size={8} />
                                            </button>
                                        </div>
                                    ))}
                                    <button 
                                        onClick={() => setSelectedGroup(group)}
                                        className="w-8 h-8 rounded-lg bg-white/5 border border-dashed border-white/10 flex items-center justify-center text-white/20 hover:text-pink-400 hover:border-pink-400/40 transition-all"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Expandable Member Search (only if selected) */}
                        <AnimatePresence>
                            {selectedGroup?._id === group._id && (
                                <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: 'auto' }}
                                    exit={{ height: 0 }}
                                    className="border-t border-white/5 bg-black/20 overflow-hidden"
                                >
                                    <div className="p-4 space-y-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                                            <input 
                                                type="text"
                                                placeholder="Search members to add..."
                                                className="w-full bg-black/40 border border-white/5 rounded-lg pl-9 pr-4 py-2 text-[11px] outline-none text-white focus:border-pink-500/30"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1">
                                            {allUsers
                                                .filter(u => !group.members.some(m => m._id === u._id))
                                                .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
                                                .map(u => (
                                                    <div key={u._id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors group/row">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-6 h-6 rounded bg-pink-500/10 flex items-center justify-center text-[8px] text-pink-500">
                                                                {u.name[0]}
                                                            </div>
                                                            <span className="text-[10px] text-white/80">{u.name}</span>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleAddMember(group._id, u._id)}
                                                            className="px-3 py-1 bg-pink-500/10 text-pink-400 rounded text-[9px] font-bold uppercase hover:bg-pink-500 hover:text-white transition-all"
                                                        >
                                                            Add
                                                        </button>
                                                    </div>
                                                ))}
                                        </div>
                                        <button 
                                            onClick={() => setSelectedGroup(null)}
                                            className="w-full py-2 text-[9px] font-bold text-white/20 hover:text-white/40 uppercase tracking-widest"
                                        >
                                            Collapse Editor
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </div>
    );

    const renderMemberView = () => (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight uppercase">Assigned Projects</h2>
                    <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] mt-1">Registry of Group Responsibilities</p>
                </div>
            </div>

            {groups.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl">
                    <div className="p-4 bg-white/5 rounded-full mb-4">
                        <Users size={32} className="text-white/10" />
                    </div>
                    <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">No Active Group Assignments</p>
                    <p className="text-[9px] text-white/10 mt-2">Contact President or GS to join a project group.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {groups.map(group => (
                        <motion.div 
                            key={group._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/[0.03] border border-pink-500/10 rounded-[2.5rem] overflow-hidden"
                        >
                            <div className="p-8 md:p-10 flex flex-col lg:flex-row gap-10">
                                <div className="flex-1 space-y-6">
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold text-white uppercase tracking-tight">{group.name}</h3>
                                        <p className="text-sm text-white/50 leading-relaxed max-w-xl">{group.description || 'No project description available.'}</p>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                            <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-2">Team Size</p>
                                            <p className="text-lg font-bold text-white">{group.members.length} Members</p>
                                        </div>
                                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                            <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-2">My Role</p>
                                            <p className="text-lg font-bold text-pink-500">Contributor</p>
                                        </div>
                                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl col-span-2 sm:col-span-1">
                                            <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-2">Created On</p>
                                            <p className="text-lg font-bold text-white">{new Date(group.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.3em] mb-4">Core Team</p>
                                        <div className="flex flex-wrap gap-3">
                                            {group.members.map(member => (
                                                <div key={member._id} className="flex items-center gap-2 p-1.5 bg-white/[0.03] border border-white/5 rounded-xl pr-4">
                                                    <div className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-500/20 flex items-center justify-center text-[10px] font-bold text-pink-400 overflow-hidden">
                                                        {member.profilePicture ? (
                                                            <img src={AuthService.getFileUrl(member.profilePicture)} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            member.name[0].toUpperCase()
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-white/80">{member.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:w-80 space-y-4">
                                    <div className="p-6 bg-pink-500/[0.03] border border-pink-500/20 rounded-3xl relative overflow-hidden group">
                                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-pink-500/10 blur-3xl rounded-full" />
                                        <h4 className="text-[10px] font-mono font-bold text-pink-500 uppercase tracking-widest mb-4">GitHub Insights</h4>
                                        
                                        <div className="space-y-6 relative z-10">
                                            <GitHubStats repoUrl={group.repoUrl} />
                                            {group.repoUrl && (
                                                <a 
                                                    href={group.repoUrl} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="w-full py-3 bg-pink-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-pink-600 transition-all shadow-lg shadow-pink-500/20"
                                                >
                                                    <Github size={14} />
                                                    View Repository
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                                        <h4 className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest mb-4">Project Guidelines</h4>
                                        <ul className="space-y-3">
                                            {[
                                                'Maintain 80% code coverage',
                                                'Daily sync on commit logs',
                                                'Priority to Admin assignments'
                                            ].map((text, i) => (
                                                <li key={i} className="flex gap-3 text-[10px] text-white/60">
                                                    <ChevronRight size={12} className="text-pink-500 shrink-0" />
                                                    {text}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );

    const GroupSkeleton = () => (
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden animate-pulse">
            <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                        <div className="h-4 bg-white/5 rounded w-1/3" />
                        <div className="h-3 bg-white/5 rounded w-1/2" />
                    </div>
                </div>
                <div className="py-3 border-y border-white/5 space-y-2">
                    <div className="h-2 bg-white/5 rounded w-1/4" />
                    <div className="h-4 bg-white/5 rounded w-2/3" />
                </div>
                <div className="space-y-3">
                    <div className="h-2 bg-white/5 rounded w-1/5" />
                    <div className="flex gap-2">
                        {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-lg bg-white/5" />)}
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading && groups.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="h-10 w-48 bg-white/5 rounded-xl animate-pulse" />
                    {isLongSync && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 px-4 py-2 bg-pink-500/10 border border-pink-500/20 rounded-full">
                            <Clock size={12} className="text-pink-500 animate-spin-slow" />
                            <span className="text-[10px] font-mono text-pink-500 font-bold uppercase tracking-widest">Establishing Uplink... (Server Waking Up)</span>
                        </motion.div>
                    )}
                    {error && (
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-mono text-white/30 uppercase">{error}</span>
                            <button 
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-pink-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-pink-500/20"
                            >
                                Retry Connection
                            </button>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => <GroupSkeleton key={i} />)}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {isAdmin && (
                <div className="flex items-center justify-between mb-8 overflow-x-auto custom-scrollbar pb-2">
                    <div className="flex gap-2 p-1.5 bg-pink-500/5 rounded-2xl w-fit border border-pink-500/20 backdrop-blur-xl shrink-0">
                        <button 
                            onClick={() => setActiveTab('overview')}
                            className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                                activeTab === 'overview' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-white/75 hover:text-white/90'
                            }`}
                        >
                            My Groups
                        </button>
                        <button 
                            onClick={() => setActiveTab('management')}
                            className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                                activeTab === 'management' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-white/75 hover:text-white/90'
                            }`}
                        >
                            Admin Command
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {isSyncing && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-pink-500/10 border border-pink-500/20 rounded-full">
                                <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                                <span className="text-[9px] font-mono text-pink-500 font-bold uppercase tracking-widest">Live Sync</span>
                            </div>
                        )}
                        <button 
                            onClick={handleRefresh}
                            className="p-2 border border-white/10 rounded-xl hover:bg-white/5 text-white/40 transition-all"
                        >
                            <Clock size={14} className={isSyncing ? 'animate-spin-slow' : ''} />
                        </button>
                    </div>
                </div>
            )}

            {!isAdmin && isSyncing && (
                <div className="fixed top-8 right-8 z-50 flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] border border-pink-500/20 rounded-full shadow-2xl">
                    <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                    <span className="text-[9px] font-mono text-pink-500/80 font-bold uppercase tracking-widest">Sychronizing Registry...</span>
                </div>
            )}

            {isAdmin && activeTab === 'management' ? renderAdminView() : renderMemberView()}

            {/* Create Group Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreateModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-lg bg-[#121212] border border-pink-500/20 rounded-[2.5rem] p-10 overflow-hidden shadow-2xl">
                            <div className="relative z-10 space-y-8">
                                <div>
                                    <h3 className="text-2xl font-bold text-white tracking-tight uppercase">Assemble Project Group</h3>
                                    <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] mt-1">Initialize new club assignment</p>
                                </div>

                                <form onSubmit={handleCreateGroup} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-mono text-pink-500/60 uppercase tracking-widest ml-1">Group Designation</label>
                                            <input 
                                                required
                                                type="text"
                                                placeholder="e.g. AI Research Group"
                                                className="w-full bg-white/5 border border-pink-500/10 rounded-xl px-5 py-4 text-sm outline-none text-white focus:border-pink-500/30 transition-all"
                                                value={newGroup.name}
                                                onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-mono text-pink-500/60 uppercase tracking-widest ml-1">GitHub Repo Link</label>
                                            <input 
                                                type="text"
                                                placeholder="https://github.com/organization/repo"
                                                className="w-full bg-white/5 border border-pink-500/10 rounded-xl px-5 py-4 text-sm outline-none text-white focus:border-pink-500/30 transition-all"
                                                value={newGroup.repoUrl}
                                                onChange={(e) => setNewGroup({...newGroup, repoUrl: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-mono text-pink-500/60 uppercase tracking-widest ml-1">Project Objectives</label>
                                            <textarea 
                                                rows="3"
                                                placeholder="Detailed project scope..."
                                                className="w-full bg-white/5 border border-pink-500/10 rounded-xl px-5 py-4 text-sm outline-none text-white focus:border-pink-500/30 transition-all resize-none"
                                                value={newGroup.description}
                                                onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button 
                                            type="button"
                                            onClick={() => setIsCreateModalOpen(false)}
                                            className="flex-1 py-4 bg-white/5 border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-all"
                                        >
                                            Discard
                                        </button>
                                        <button 
                                            type="submit"
                                            disabled={isSyncing}
                                            className={`flex-2 px-10 py-4 bg-pink-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-xl ${isSyncing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-pink-600'}`}
                                        >
                                            {isSyncing ? 'Syncing...' : 'Create Registry'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Assign Task Modal */}
            <AnimatePresence>
                {isAssignTaskModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAssignTaskModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-lg bg-[#121212] border border-pink-500/20 rounded-[2.5rem] p-10 overflow-hidden shadow-2xl">
                            <div className="relative z-10 space-y-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-500">
                                            <AlertCircle size={18} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white tracking-tight uppercase">Priority Dispatch</h3>
                                    </div>
                                    <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em]">Target: {selectedGroup?.name}</p>
                                </div>

                                <form onSubmit={handleAssignGroupTask} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-mono text-white/30 uppercase tracking-widest ml-1">Task Title</label>
                                            <input 
                                                required
                                                type="text"
                                                placeholder="Primary objective name..."
                                                className="w-full bg-white/5 border border-pink-500/10 rounded-xl px-5 py-4 text-sm outline-none text-white focus:border-pink-500/30 transition-all font-bold"
                                                value={taskData.title}
                                                onChange={(e) => setTaskData({...taskData, title: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-mono text-white/30 uppercase tracking-widest ml-1">Detailed Instructions</label>
                                            <textarea 
                                                required
                                                rows="4"
                                                placeholder="Process steps and requirements..."
                                                className="w-full bg-white/5 border border-pink-500/10 rounded-xl px-5 py-4 text-sm outline-none text-white focus:border-pink-500/30 transition-all resize-none"
                                                value={taskData.description}
                                                onChange={(e) => setTaskData({...taskData, description: e.target.value})}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-mono text-white/30 uppercase tracking-widest ml-1">Deadline</label>
                                                <input 
                                                    required
                                                    type="date"
                                                    className="w-full bg-white/5 border border-pink-500/10 rounded-xl px-5 py-4 text-[10px] outline-none text-white focus:border-pink-500/30 transition-all"
                                                    value={taskData.deadline}
                                                    onChange={(e) => setTaskData({...taskData, deadline: e.target.value})}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-mono text-white/30 uppercase tracking-widest ml-1">Priority Status</label>
                                                <div className="w-full bg-pink-500/10 border border-pink-500/20 rounded-xl px-5 py-4 flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                                                    <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">URGENT LEVEL</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button 
                                            type="button"
                                            onClick={() => setIsAssignTaskModalOpen(false)}
                                            className="flex-1 py-4 bg-white/5 border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-all"
                                        >
                                            Abort
                                        </button>
                                        <button 
                                            type="submit"
                                            className="flex-2 px-10 py-4 bg-pink-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-pink-600 transition-all shadow-xl"
                                        >
                                            Broadcast Priority
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Group Modal */}
            <AnimatePresence>
                {isEditModalOpen && editingGroup && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-[#0A0A0B] border border-white/10 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative z-[101]"
                        >
                            <div className="p-8 space-y-6">
                                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">Modify Project</h3>
                                        <p className="text-[10px] font-mono text-white/30 uppercase mt-1">Registry Update Console</p>
                                    </div>
                                    <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-all text-white/40 hover:text-white">
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleEditGroup} className="space-y-4">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-mono text-white/30 uppercase tracking-widest ml-1">Team Name</label>
                                            <input 
                                                required
                                                type="text"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs outline-none text-white focus:border-pink-500/30 transition-all font-bold"
                                                placeholder="e.g. AI Vision Team"
                                                value={editingGroup.name}
                                                onChange={(e) => setEditingGroup({...editingGroup, name: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-mono text-white/30 uppercase tracking-widest ml-1">Mission Log</label>
                                            <textarea 
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs outline-none text-white focus:border-pink-500/30 transition-all min-h-[100px] resize-none"
                                                placeholder="Objectives and goals..."
                                                value={editingGroup.description}
                                                onChange={(e) => setEditingGroup({...editingGroup, description: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-mono text-white/30 uppercase tracking-widest ml-1">GitHub Endpoint</label>
                                            <input 
                                                required
                                                type="url"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs outline-none text-white focus:border-pink-500/30 transition-all"
                                                placeholder="https://github.com/org/repo"
                                                value={editingGroup.repoUrl}
                                                onChange={(e) => setEditingGroup({...editingGroup, repoUrl: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-6">
                                        <button 
                                            type="button"
                                            onClick={() => setIsEditModalOpen(false)}
                                            className="flex-1 py-4 bg-white/5 text-white/40 border border-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:text-white transition-all underline-none"
                                        >
                                            Abort
                                        </button>
                                        <button 
                                            type="submit"
                                            disabled={isSyncing}
                                            className={`flex-1 py-4 bg-pink-500 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-xl shadow-pink-500/20 ${isSyncing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-pink-600'}`}
                                        >
                                            {isSyncing ? 'Syncing Intel...' : 'Save Intel'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GroupPortal;
