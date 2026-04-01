import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, Plus, Github, ExternalLink, Trash2, 
    ClipboardList, AlertCircle, ChevronRight, Search, 
    Clock, CheckCircle2, Edit2, X, Activity, GitCommit, GitPullRequest
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/authService';

const GroupPortal = () => {
    const navigate = useNavigate();
    const [user] = useState(AuthService.getSession());
    
    // INSTANT LOAD: Initialize from cache if available
    const [groups, setGroups] = useState(AuthService.cache.get('groups') || []);
    const [allUsers, setAllUsers] = useState(AuthService.cache.get('users') || []);
    
    // Only show blocking loader if we have NO cached data AND no groups in state
    const [loading, setLoading] = useState(!AuthService.cache.get('groups') && groups.length === 0);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isLongSync, setIsLongSync] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); 
    
    // Modals & Forms
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [newGroup, setNewGroup] = useState({ name: '', description: '', repoUrl: '', inactivityLimitDays: 3 });
    const [editingGroup, setEditingGroup] = useState(null);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [taskData, setTaskData] = useState({ title: '', description: '', deadline: '', isPriority: true });
    
    // Modal for GitHub Stats
    const [activeGithubRepo, setActiveGithubRepo] = useState(null);
    const [activeMemberManagementGroup, setActiveMemberManagementGroup] = useState(null);
    const [memberSearchQuery, setMemberSearchQuery] = useState('');

    // Provide safe optional chaining to avoid initial crashes
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
    }, [isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

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
            setNewGroup({ name: '', description: '', repoUrl: '', inactivityLimitDays: 3 });
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
        // Protect against null mappings
        const validMembers = (group.members || []).filter(Boolean);
        if (validMembers.some(m => m._id === userId)) return;

        const updatedMembers = [...validMembers.map(m => m._id), userId];
        try {
            await AuthService.updateGroup(groupId, { members: updatedMembers });
            fetchGroups();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleRemoveMember = async (groupId, userId) => {
        const group = groups.find(g => g._id === groupId);
        // Protect against null mappings
        const updatedMembers = (group.members || []).filter(Boolean).filter(m => m._id !== userId).map(m => m._id);
        
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

    // ----------------------------------------------------------------------
    // SUB-COMPONENTS
    // ----------------------------------------------------------------------

    const GitHubStatsModal = ({ repoInfo, onClose }) => {
        const [stats, setStats] = useState(AuthService.cache.get(`github_${repoInfo.repoUrl}`));
        const [repoLoading, setRepoLoading] = useState(!stats);
        const [isCompiling, setIsCompiling] = useState(false);
        const [isManualRefreshing, setIsManualRefreshing] = useState(false);
        const [activeModalTab, setActiveModalTab] = useState('squad'); // 'squad', 'members' or 'activity'

        useEffect(() => {
            if (repoInfo.repoUrl) fetchRepoStats();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [repoInfo.repoUrl]);

        const fetchRepoStats = async (isForced = false) => {
            if (!repoInfo.repoUrl) return;
            if (!stats && !isForced) setRepoLoading(true);
            if (isForced) setIsManualRefreshing(true);
            setIsCompiling(false);
            
            try {
                const newStats = await AuthService.getGitHubStats(repoInfo.repoUrl, isForced);
                
                if (newStats?.status === 202) {
                    setIsCompiling(true);
                    setRepoLoading(false);
                    setTimeout(() => fetchRepoStats(isForced), 3000);
                    return;
                }
                
                if (newStats && newStats.status !== 400 && newStats.status !== 500) {
                    setStats(newStats);
                    // AuthService.getGitHubStats already updates the cache
                }
            } catch (err) {
                console.error('GitHub Intelligence Error:', err);
            } finally {
                setRepoLoading(false);
                setIsManualRefreshing(false);
            }
        };

        const formatUrl = (url) => {
            if (!url) return '';
            if (url.startsWith('http')) return url;
            return `https://${url}`;
        };

        const renderContent = () => {
            // If we are on any tab other than 'squad', and stats aren't loaded, we show a loader.
            // But 'squad' (Squad Registry) is optimistic and shows members immediately from local group data.
            if ((repoLoading || isCompiling || !stats) && activeModalTab !== 'squad') {
                if (isCompiling) return (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Clock size={32} className="text-pink-500 animate-spin-slow mb-4" />
                        <span className="text-[10px] font-mono font-bold text-pink-500 tracking-wider animate-pulse text-center">
                            Initializing Codebase Analysis<br/><span className="text-[8px] opacity-70 font-normal">GitHub is compiling stats. Hang tight.</span>
                        </span>
                    </div>
                );
                
                if (repoLoading) return (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
                        <span className="text-[10px] font-mono font-bold text-pink-500 tracking-wider animate-pulse text-center">Establishing Uplink to Repo...</span>
                    </div>
                );

                if (!stats) return (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <AlertCircle size={32} className="text-white/20 mb-4" />
                        <span className="text-[10px] font-mono text-white/40 tracking-wider">No Intelligence linked or available.</span>
                    </div>
                );
            }

            const renderSquadTab = () => (
                <div className="space-y-6">
                    <label className="text-[10px] font-mono text-white/40 tracking-wider block mb-4 flex items-center gap-2">
                        <Users size={12} className="text-pink-500" /> Human Resource Intelligence (HRI)
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(repoInfo.members || []).filter(m => m && typeof m === 'object').map((member, idx) => {
                            // Find matching GitHub contributor stats
                            const githubStats = (stats?.contributors || []).find(c => 
                                c.login?.toLowerCase() === member.githubUsername?.toLowerCase()
                            );
                            
                            const isStatLoading = (repoLoading || isCompiling) && !githubStats;
                            
                            return (
                                <div key={idx} className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-6 hover:border-pink-500/30 transition-all group/member relative overflow-hidden backdrop-blur-md">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/member:opacity-10 transition-opacity">
                                        <Activity size={60} className="text-white" />
                                    </div>
                                    
                                    <div className="flex items-center gap-5 relative z-10">
                                        <div className="w-20 h-20 rounded-[1.5rem] bg-white/5 border border-white/10 p-1 flex-shrink-0 group-hover/member:border-pink-500/30 transition-colors">
                                            {member.profilePicture ? (
                                                <img src={member.profilePicture} className="w-full h-full rounded-2xl object-cover" alt="" />
                                            ) : (
                                                <div className="w-full h-full rounded-2xl bg-pink-500/5 flex items-center justify-center">
                                                    <span className="text-2xl font-bold text-pink-500">{member.name?.charAt(0)}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-[16px] font-bold text-white tracking-tight group-hover/member:text-pink-400 transition-colors">{member.name}</h4>
                                                {githubStats && (
                                                    <div className="px-2 py-1 bg-green-500/10 rounded-lg flex items-center gap-1.5 border border-green-500/20">
                                                        <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                                                        <span className="text-[8px] font-bold text-green-500 uppercase tracking-widest">Linked</span>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-1">{member.role || 'Operative'}</p>
                                            <div className="flex items-center gap-2 mt-3 bg-white/5 w-fit px-3 py-1.5 rounded-xl border border-white/5">
                                                <Github size={12} className="text-pink-500" />
                                                <span className="text-[10px] font-mono text-white/60">{member.githubUsername || 'ID NOT LINKED'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 gap-8 relative z-10">
                                        <div className="space-y-1.5">
                                            <span className="text-[9px] font-mono text-white/30 uppercase tracking-[0.2em] block">Contribution Profile</span>
                                            <div className="flex items-baseline gap-2">
                                                {isStatLoading ? (
                                                    <div className="h-8 w-12 bg-white/5 animate-pulse rounded-lg mt-1" />
                                                ) : (
                                                    <span className="text-[24px] font-mono font-bold text-white">{githubStats ? githubStats.commits : 0}</span>
                                                )}
                                                <span className="text-[10px] font-mono text-white/40 uppercase">Total Commits</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <span className="text-[9px] font-mono text-white/30 uppercase tracking-[0.2em] block">Assigned Tickets</span>
                                            <div className="flex items-baseline gap-2">
                                                {isStatLoading ? (
                                                    <div className="h-8 w-12 bg-pink-500/10 animate-pulse rounded-lg mt-1" />
                                                ) : (
                                                    <span className="text-[24px] font-mono font-bold text-pink-500">{githubStats?.activeIssues?.length || 0}</span>
                                                )}
                                                <span className="text-[10px] font-mono text-white/40 uppercase">Active</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );

            const renderMembersTab = () => (
                <div className="space-y-6">
                    <div className="pt-2">
                        <label className="text-[10px] font-mono text-white/40 tracking-wider block mb-4 flex items-center justify-between">
                            <span className="flex items-center gap-2"><Activity size={12} className="text-pink-500" /> GitHub Identity Breakdown</span>
                            <span className="text-[8px] bg-red-500/10 text-red-500 px-2 py-1 rounded border border-red-500/20">Inactivity Trigger: {repoInfo.inactivityLimitDays || 3} Days</span>
                        </label>
                        
                        <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                                {(repoInfo.members || []).filter(m => m && typeof m === 'object').map((member, idx) => {
                                    // Find matching GitHub contributor stats from the backend stats
                                    const githubStats = (stats.contributors || []).find(c => 
                                        c.login?.toLowerCase() === member.githubUsername?.toLowerCase() ||
                                        c.login?.toLowerCase() === member.name?.toLowerCase().replace(/\s+/g, '')
                                    );
                                    
                                    const lastCommitDate = githubStats?.recentActivity && githubStats.recentActivity.length > 0 ? new Date(githubStats.recentActivity[0].date) : null;
                                    const inactivityDays = lastCommitDate ? (new Date() - lastCommitDate) / (1000 * 60 * 60 * 24) : 999;
                                    const threshold = repoInfo.inactivityLimitDays || 3;
                                    const isInactive = inactivityDays > threshold && githubStats;

                                    return (
                                    <motion.details 
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        key={member._id || idx} 
                                        className="group/details bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-pink-500/20 transition-colors"
                                    >
                                        <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.02] transition-colors list-none outline-none">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-[#121212] flex items-center justify-center p-[2px] border border-white/10 group-hover/details:border-pink-500/50 transition-colors relative overflow-hidden">
                                                    {member.profilePicture ? (
                                                        <img src={AuthService.getFileUrl(member.profilePicture)} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-lg font-bold text-pink-500 bg-pink-500/5">
                                                            {member.name?.[0]}
                                                        </div>
                                                    )}
                                                    {isInactive && (
                                                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-[#121212] flex items-center justify-center animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                                                            <AlertCircle size={8} className="text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[14px] font-bold text-white tracking-tight">{member.name}</span>
                                                        {isInactive && <span className="text-[8px] font-bold tracking-wider text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 uppercase">Critical Inactivity</span>}
                                                    </div>
                                                    <div className="flex flex-col gap-0.5 mt-0.5">
                                                        <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">{member.email}</span>
                                                        {githubStats && (
                                                            <span className={`text-[8.5px] font-mono tracking-wider ${isInactive ? 'text-red-500/80' : 'text-pink-500/80'}`}>
                                                                Last Sync: {githubStats.recentActivity && githubStats.recentActivity.length > 0 ? (inactivityDays < 1 ? 'Today' : (Math.floor(inactivityDays) === 1 ? 'Yesterday' : `${Math.floor(inactivityDays)} days ago`)) : 'Unknown'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-5">
                                                {githubStats ? (
                                                    <div className="flex flex-col items-end shrink-0">
                                                        <span className="text-[16px] font-mono font-bold text-pink-400">{githubStats.commits}</span>
                                                        <span className="text-[8px] font-mono text-white/30 tracking-wider uppercase">Commits</span>
                                                    </div>
                                                ) : (
                                                    <div className="text-[9px] font-mono text-white/10 italic">Intelligence Pending</div>
                                                )}
                                                <ChevronRight size={16} className="text-white/20 group-open/details:rotate-90 transition-transform" />
                                            </div>
                                        </summary>
                                        
                                        {githubStats && (
                                            <div className="p-5 bg-black/40 border-t border-white/5 space-y-6">
                                                {githubStats.activeIssues && githubStats.activeIssues.length > 0 && (
                                                    <div>
                                                        <span className="text-[9px] font-mono text-white/30 uppercase tracking-[0.2em] mb-3 block flex items-center gap-1.5">
                                                            <AlertCircle size={10} className="text-pink-500" /> Active Assignments
                                                        </span>
                                                        <div className="flex flex-wrap gap-2">
                                                            {githubStats.activeIssues.map((issue, idx) => (
                                                                <a key={idx} href={issue.url} target="_blank" rel="noreferrer" className="text-[11px] text-white/70 bg-white/5 border border-white/5 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white hover:border-pink-500/30 transition-all flex items-center gap-2">
                                                                    <span className="text-pink-400 font-mono">#{issue.number}</span>
                                                                    <span className="truncate max-w-[200px]">{issue.title}</span>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div>
                                                    <span className="text-[9px] font-mono text-white/30 uppercase tracking-[0.2em] mb-4 block flex items-center gap-1.5">
                                                        <GitPullRequest size={10} className="text-pink-500" /> Direct Activity Log
                                                    </span>
                                                    {githubStats.recentActivity && githubStats.recentActivity.length > 0 ? (
                                                        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                                            {githubStats.recentActivity.map((act, idx) => (
                                                                <a key={idx} href={act.url} target="_blank" rel="noreferrer" className="block bg-white/5 rounded-xl border border-white/5 p-3 hover:border-pink-500/30 transition-colors group/act">
                                                                    <span className="block text-[12px] text-white/80 group-hover/act:text-white truncate mb-1">{act.message}</span>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="block text-[9px] font-mono text-pink-500 uppercase tracking-widest">
                                                                            {new Date(act.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                                                        </span>
                                                                    </div>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-[10px] font-mono text-white/20 italic">
                                                            No recent intelligence available
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </motion.details>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            );

            const renderActivityTab = () => (
                <div className="space-y-6">
                    <div className="pt-2">
                        <label className="text-[10px] font-mono text-white/40 tracking-wider block mb-6 flex items-center gap-2">
                            <Activity size={12} className="text-pink-500" /> Professional Deployment Log (PDL)
                        </label>

                        {stats.commitHistory && stats.commitHistory.length > 0 ? (
                            <div className="relative space-y-4 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/5">
                                {stats.commitHistory.map((commit, idx) => (
                                    <div key={idx} className="relative pl-12 group/commit">
                                        {/* Timeline Dot */}
                                        <div className="absolute left-0 top-1.5 w-10 h-10 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)] z-10 group-hover/commit:scale-125 transition-transform" />
                                        </div>

                                        <a href={commit.url} target="_blank" rel="noreferrer" className="block bg-white/[0.02] border border-white/5 hover:border-pink-500/30 rounded-[1.5rem] p-5 transition-all group-hover/commit:translate-x-1">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex gap-4">
                                                    <img src={commit.author.avatar} alt="" className="w-10 h-10 rounded-xl border border-white/10" />
                                                    <div className="space-y-1">
                                                        <h4 className="text-[13px] font-bold text-white group-hover/commit:text-pink-400 transition-colors">{commit.message}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-bold text-white/60">{commit.author.login}</span>
                                                            <span className="text-white/10 text-[10px]">•</span>
                                                            <span className="text-[10px] font-mono text-white/30">
                                                                {new Date(commit.date).toLocaleString('en-US', { 
                                                                    month: 'short', day: 'numeric', 
                                                                    hour: 'numeric', minute: '2-digit',
                                                                    hour12: true 
                                                                })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="shrink-0 flex items-center justify-center p-2 bg-white/5 rounded-lg opacity-0 group-hover/commit:opacity-100 transition-opacity">
                                                    <ExternalLink size={12} className="text-white/40" />
                                                </div>
                                            </div>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <span className="text-[10px] font-mono text-white/20 italic">No activity registry logs found.</span>
                            </div>
                        )}
                    </div>
                </div>
            );

            return (
                <div className="space-y-8 animate-in fade-in duration-500">
                    {/* Top Analytics Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-pink-500/10 border border-pink-500/20 rounded-2xl p-4 flex flex-col justify-center items-center">
                            <GitCommit size={16} className="text-pink-500 mb-2" />
                            {(!stats && (repoLoading || isCompiling)) ? (
                                <div className="h-7 w-12 bg-white/5 animate-pulse rounded-lg" />
                            ) : (
                                <span className="text-xl font-bold text-white">{stats?.totalCommits || 0}</span>
                            )}
                            <span className="text-[9px] font-mono text-pink-400 tracking-wider">Total Commits</span>
                        </div>
                        {(!stats && (repoLoading || isCompiling)) ? (
                             <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex flex-col justify-center items-center">
                                <Users size={16} className="text-blue-500 mb-2" />
                                <div className="h-7 w-8 bg-white/5 animate-pulse rounded-lg" />
                                <span className="text-[9px] font-mono text-white/40 tracking-wider">Loading...</span>
                            </div>
                        ) : (
                            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex flex-col justify-center items-center">
                                <Users size={16} className="text-blue-500 mb-2" />
                                <span className="text-xl font-bold text-white">
                                    {stats?.profile?.contributorsCount ?? (stats?.contributors || []).length}
                                </span>
                                <span className="text-[9px] font-mono text-white/40 tracking-wider">Contributors</span>
                            </div>
                        )}
                        {(!stats && (repoLoading || isCompiling)) ? (
                             <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex flex-col justify-center items-center col-span-2">
                                <Clock size={16} className="text-amber-500 mb-2" />
                                <div className="h-5 w-32 bg-white/5 animate-pulse rounded-lg mb-1" />
                                <span className="text-[9px] font-mono text-white/40 tracking-wider">Syncing Data Streams...</span>
                            </div>
                        ) : (stats?.profile && (
                            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex flex-col justify-center items-center col-span-2 sm:col-span-2">
                                <Clock size={16} className="text-amber-500 mb-2" />
                                <span className="text-[12px] font-bold text-white text-center">
                                    {new Date(stats.profile.lastUpdated).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                </span>
                                <span className="text-[9px] font-mono text-white/40 tracking-wider mt-1">Last Global Update</span>
                            </div>
                        ))}
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex flex-wrap gap-2 p-1.5 bg-white/[0.02] border border-white/5 rounded-2xl w-fit">
                        <button 
                            onClick={() => setActiveModalTab('squad')}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                                activeModalTab === 'squad' ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                            }`}
                        >
                            Squad Registry
                        </button>
                        <button 
                            onClick={() => setActiveModalTab('members')}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                                activeModalTab === 'members' ? 'bg-white/10 text-white shadow-lg shadow-white/5' : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                            }`}
                        >
                            GitHub Activity
                        </button>
                        <button 
                            onClick={() => setActiveModalTab('activity')}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                                activeModalTab === 'activity' ? 'bg-white/10 text-white shadow-lg shadow-white/5' : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                            }`}
                        >
                            Global Logs
                        </button>
                    </div>

                    {/* Main Content Area */}
                    <div className="border-t border-white/5 pt-6 transition-all duration-300">
                        {activeModalTab === 'squad' ? renderSquadTab() : (activeModalTab === 'members' ? renderMembersTab() : renderActivityTab())}
                    </div>
                </div>
            );
        };

        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
                <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-4xl max-h-[85vh] flex flex-col bg-[#080808] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl z-10">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center flex-shrink-0">
                                <Github className="text-pink-500" size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white tracking-tight">{repoInfo.name}</h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[9px] font-mono text-white/40 tracking-wider whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">{repoInfo.repoUrl}</span>
                                    <a href={formatUrl(repoInfo.repoUrl)} target="_blank" rel="noreferrer" className="text-pink-500 hover:text-pink-400 transition-colors"><ExternalLink size={10}/></a>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => fetchRepoStats(true)} 
                                disabled={isManualRefreshing || repoLoading}
                                className={`flex items-center gap-2 px-4 py-2 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 rounded-xl text-[10px] font-bold uppercase tracking-widest text-pink-500 transition-all ${isManualRefreshing ? 'animate-pulse opacity-50' : ''}`}
                            >
                                <Clock size={12} className={isManualRefreshing ? 'animate-spin' : ''} />
                                {isManualRefreshing ? 'Syncing...' : 'Force Sync'}
                            </button>
                            <button onClick={onClose} className="p-3 bg-white/5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all">
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                    
                    <div className="p-6 overflow-y-auto custom-scrollbar flex-1 relative">
                        {renderContent()}
                    </div>
                </motion.div>
            </div>
        );
    };

    const GroupCard = ({ group }) => {
        // Safe mapping to prevent backend data crashes if users are deleted
        const validMembers = (group.members || []).filter(m => m && typeof m === 'object');
        const isSelected = selectedGroup?._id === group._id;

        const formatUrl = (url) => {
            if (!url) return '';
            if (url.startsWith('http')) return url;
            return `https://${url}`;
        };
        
        return (
            <motion.div layout className={`bg-white/[0.02] border transition-all rounded-3xl p-6 relative overflow-hidden group flex flex-col h-full ${isSelected ? 'border-pink-500/40 shadow-[0_0_30px_rgba(236,72,153,0.1)]' : 'border-white/5 hover:border-white/20'}`}>
                {/* Visual Flair */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                
                <div className="relative z-10 flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-4 mb-4">
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-white tracking-tight">{group.name}</h3>
                            <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">{group.description || 'No description assigned.'}</p>
                        </div>
                        {isAdmin && activeTab === 'management' && (
                            <div className="flex items-center gap-1 bg-black/40 rounded-xl p-1 border border-white/5 shrink-0">
                                <button onClick={() => { setEditingGroup(group); setIsEditModalOpen(true); }} className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Edit Group">
                                    <Edit2 size={13} />
                                </button>
                                <button onClick={() => { setActiveMemberManagementGroup(group); setMemberSearchQuery(''); }} className="p-1.5 text-white/40 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all" title="Manage Squad Members">
                                    <Users size={13} />
                                </button>
                                <button onClick={() => { setSelectedGroup(group); setIsAssignTaskModalOpen(true); }} className="p-1.5 text-white/40 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-all" title="Assign Priority Task">
                                    <ClipboardList size={13} />
                                </button>
                                <button onClick={() => handleDeleteGroup(group._id)} className="p-1.5 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all" title="Dissolve Group">
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="mt-auto space-y-5">
                        <div className="flex items-center justify-between">
                            <div className="flex -space-x-2">
                                <AnimatePresence mode="popLayout">
                                    {validMembers.slice(0, 5).map(member => (
                                        <motion.div 
                                            layout
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10, scale: 0.8 }}
                                            key={member._id} 
                                            className="w-8 h-8 rounded-full border-2 border-[#121212] bg-[#1a1a1a] flex items-center justify-center overflow-hidden shrink-0 relative group/tooltip shadow-lg"
                                        >
                                            {member.profilePicture ? (
                                                <img src={AuthService.getFileUrl(member.profilePicture)} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-[10px] font-bold text-pink-500">{member.name ? member.name[0].toUpperCase() : '?'}</span>
                                            )}
                                            {isAdmin && activeTab === 'management' && (
                                                <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer transition-opacity z-10" onClick={() => handleRemoveMember(group._id, member._id)}>
                                                    <X size={12} className="text-white" />
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {validMembers.length > 5 && (
                                    <div className="w-8 h-8 rounded-full border-2 border-[#121212] bg-white/5 flex items-center justify-center shrink-0">
                                        <span className="text-[9px] font-bold text-white/60">+{validMembers.length - 5}</span>
                                    </div>
                                )}
                            </div>
                            
                            {isAdmin && activeTab === 'management' && (
                                <button onClick={() => setSelectedGroup(isSelected ? null : group)} className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all ${isSelected ? 'bg-pink-500 text-white border-pink-500' : 'text-white/40 hover:text-white border-white/10 hover:border-white/20'}`}>
                                    {isSelected ? 'Done' : 'Manage'}
                                </button>
                            )}
                            {!isAdmin && (
                                <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{validMembers.length} Members</span>
                            )}
                        </div>

                        {/* Inline Management Area Base */}
                        <AnimatePresence>
                            {isSelected && isAdmin && activeTab === 'management' && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/5 pt-4 overflow-hidden">
                                     <div className="relative mb-3">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                                        <input 
                                            type="text"
                                            placeholder="Assign member..."
                                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-[11px] outline-none text-white focus:border-pink-500/50"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-1">
                                        <AnimatePresence mode="popLayout">
                                            {allUsers
                                                .filter(u => !validMembers.some(m => m?._id === u._id))
                                                .filter(u => u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
                                                .map(u => (
                                                    <motion.div 
                                                        layout
                                                        initial={{ opacity: 0, x: -5 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 5 }}
                                                        key={u._id} 
                                                        className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors group/row"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-6 h-6 rounded bg-pink-500/10 flex items-center justify-center text-[8px] text-pink-500 border border-pink-500/20 overflow-hidden">
                                                                {u.profilePicture ? <img src={AuthService.getFileUrl(u.profilePicture)} className="w-full h-full object-cover" /> : (u.name ? u.name[0].toUpperCase() : '?')}
                                                            </div>
                                                            <span className="text-[10px] text-white/80 font-bold truncate max-w-[100px]">{u.name || u.email}</span>
                                                        </div>
                                                        <button onClick={() => handleAddMember(group._id, u._id)} className="px-3 py-1 bg-white/5 text-white/60 rounded text-[9px] font-bold uppercase hover:bg-pink-500 hover:text-white transition-all">Add</button>
                                                    </motion.div>
                                                ))}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Group Actions Layer */}
                        <div className="pt-4 border-t border-white/5 flex gap-2">
                            {group.repoUrl ? (
                                <>
                                    <button 
                                        onClick={() => navigate(`/project/${group._id}`)}
                                        className="flex-[2] py-3 bg-pink-500/5 hover:bg-pink-500 border border-pink-500/20 hover:border-pink-500 text-pink-500 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn"
                                    >
                                        <Users size={14} className="group-hover/btn:-mt-1 transition-all" /> Member Center
                                    </button>
                                    <a 
                                        href={formatUrl(group.repoUrl)} target="_blank" rel="noreferrer"
                                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/50 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                    >
                                        <Github size={14} /> Repo
                                    </a>
                                </>
                            ) : (
                                <div className="w-full py-3 bg-white/[0.01] border border-dashed border-white/10 text-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2">
                                    <AlertCircle size={14} /> GitHub Unlinked
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    const renderAdminView = () => (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight uppercase">Command Center</h2>
                    <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] mt-1">Global Project Oversight</p>
                </div>
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-pink-600 transition-all shadow-lg shadow-pink-500/20 w-full sm:w-auto justify-center"
                >
                    <Plus size={14} /> New Project Group
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {groups.map(group => (
                    <GroupCard key={group._id} group={group} isAdmin={isAdmin} />
                ))}
            </div>
        </div>
    );

    const renderMemberView = () => (
        <div className="space-y-8 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight uppercase">My Assignments</h2>
                    <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] mt-1">Registry of Group Responsibilities</p>
                </div>
            </div>

            {groups.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-[3rem]">
                    <div className="p-5 bg-white/5 rounded-full mb-6 relative">
                        <Users size={32} className="text-white/20 relative z-10" />
                        <div className="absolute inset-0 bg-pink-500/20 rounded-full blur-xl" />
                    </div>
                    <p className="text-[11px] font-mono text-white/40 uppercase tracking-[0.3em]">No Active Deployments</p>
                    <p className="text-[10px] text-white/20 mt-3 font-mono">Contact Administration to be assigned to a project group.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {groups.map(group => (
                        <GroupCard key={group._id} group={group} isAdmin={false} />
                    ))}
                </div>
            )}
        </div>
    );

    const GroupSkeleton = () => (
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 h-[250px] flex flex-col justify-between animate-pulse">
            <div>
                <div className="h-5 bg-white/5 rounded-lg w-1/2 mb-3" />
                <div className="h-3 bg-white/5 rounded w-3/4 mb-1" />
                <div className="h-3 bg-white/5 rounded w-2/3" />
            </div>
            <div>
                <div className="flex gap-2 mb-6">
                    {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-white/5 border-2 border-[#121212]" />)}
                </div>
                <div className="h-10 bg-white/5 rounded-xl w-full" />
            </div>
        </div>
    );

    if (loading && groups.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="h-10 w-48 bg-white/5 rounded-xl animate-pulse" />
                    {isLongSync && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 px-5 py-2.5 bg-pink-500/10 border border-pink-500/20 rounded-full">
                            <Clock size={14} className="text-pink-500 animate-spin-slow" />
                            <span className="text-[10px] font-mono text-pink-500 font-bold uppercase tracking-widest">Establishing Uplink... (Server Waking)</span>
                        </motion.div>
                    )}
                    {error && (
                        <div className="flex items-center gap-4 bg-red-500/10 border border-red-500/20 p-2 pr-4 rounded-xl">
                            <div className="p-2 bg-red-500/20 rounded-lg text-red-500"><AlertCircle size={14}/></div>
                            <span className="text-[10px] font-mono text-white/60 uppercase">{error}</span>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <GroupSkeleton key={i} />)}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {isAdmin && (
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-white/5 pb-6">
                    <div className="flex gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/10 backdrop-blur-xl shrink-0 h-fit">
                        <button 
                            onClick={() => setActiveTab('overview')}
                            className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                                activeTab === 'overview' ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'text-white/40 hover:text-white/90 hover:bg-white/5'
                            }`}
                        >
                            My Groups
                        </button>
                        <button 
                            onClick={() => setActiveTab('management')}
                            className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                                activeTab === 'management' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-white/40 hover:text-white/90 hover:bg-white/5'
                            }`}
                        >
                            Admin Command
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {isSyncing && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-pink-500/10 border border-pink-500/20 rounded-full">
                                <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                                <span className="text-[9px] font-mono text-pink-500 font-bold uppercase tracking-widest">Live Sync</span>
                            </div>
                        )}
                        <button 
                            onClick={handleRefresh}
                            className="p-2 border border-white/10 rounded-xl hover:bg-white/5 text-white/40 transition-all flex items-center justify-center bg-black/40 h-10 w-10"
                        >
                            <Clock size={16} className={isSyncing ? 'animate-spin-slow' : ''} />
                        </button>
                    </div>
                </div>
            )}

            {!isAdmin && isSyncing && (
                <div className="fixed bottom-8 right-8 z-50 flex items-center gap-2 px-5 py-3 bg-[#0a0a0a] border border-pink-500/20 rounded-full shadow-2xl">
                    <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                    <span className="text-[9px] font-mono text-pink-500/80 font-bold uppercase tracking-widest">Synchronizing Registry...</span>
                </div>
            )}

            {isAdmin && activeTab === 'management' ? renderAdminView() : renderMemberView()}

            {/* Overlays / Modals */}
            <AnimatePresence>
                {activeGithubRepo && (
                    <GitHubStatsModal 
                        repoInfo={activeGithubRepo} 
                        onClose={() => setActiveGithubRepo(null)} 
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreateModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-[#0a0a0b] border border-white/10 rounded-[2.5rem] p-10 overflow-hidden shadow-2xl">
                            <div className="relative z-10 space-y-8">
                                <div>
                                    <h3 className="text-2xl font-bold text-white tracking-tight uppercase">Assemble Team</h3>
                                    <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] mt-1">Initialize new club assignment</p>
                                </div>
                                {/* Reduced form duplication handled cleanly above */}
                                <form onSubmit={handleCreateGroup} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <input required type="text" placeholder="Project Title" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs outline-none text-white focus:border-pink-500/50 transition-all font-bold" value={newGroup.name} onChange={(e) => setNewGroup({...newGroup, name: e.target.value})} />
                                        </div>
                                        <div className="space-y-2">
                                            <input type="url" placeholder="GitHub Repository URL" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs outline-none text-white focus:border-pink-500/50 transition-all" value={newGroup.repoUrl} onChange={(e) => setNewGroup({...newGroup, repoUrl: e.target.value})} />
                                        </div>
                                        <div className="space-y-2">
                                            <textarea rows="3" placeholder="Project Objectives..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs outline-none text-white focus:border-pink-500/50 transition-all resize-none" value={newGroup.description} onChange={(e) => setNewGroup({...newGroup, description: e.target.value})} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-white/40 uppercase tracking-widest pl-2">Inactivity Alert Limit (Days)</label>
                                            <input type="number" min="1" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs outline-none text-white focus:border-pink-500/50 transition-all font-bold" value={newGroup.inactivityLimitDays} onChange={(e) => setNewGroup({...newGroup, inactivityLimitDays: parseInt(e.target.value)})} />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t border-white/5 mt-6">
                                        <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-all">Discard</button>
                                        <button type="submit" disabled={isSyncing} className="flex-1 py-4 bg-pink-500 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-pink-600 disabled:opacity-50">Launch</button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isAssignTaskModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAssignTaskModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-[#0a0a0b] border border-white/10 rounded-[2.5rem] p-10 overflow-hidden shadow-2xl">
                            <div className="relative z-10 space-y-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-white tracking-tight uppercase">Priority Dispatch</h3>
                                    <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] mt-1">Target: {selectedGroup?.name}</p>
                                </div>
                                <form onSubmit={handleAssignGroupTask} className="space-y-4">
                                    <input required type="text" placeholder="Objective Title" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs outline-none text-white focus:border-pink-500/50 transition-all font-bold" value={taskData.title} onChange={(e) => setTaskData({...taskData, title: e.target.value})} />
                                    <textarea required rows="4" placeholder="Instructions..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs outline-none text-white focus:border-pink-500/50 transition-all resize-none" value={taskData.description} onChange={(e) => setTaskData({...taskData, description: e.target.value})} />
                                    <input required type="date" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs outline-none text-white focus:border-pink-500/50 transition-all [color-scheme:dark]" value={taskData.deadline} onChange={(e) => setTaskData({...taskData, deadline: e.target.value})} />
                                    
                                    <div className="flex gap-3 pt-6 border-t border-white/5">
                                        <button type="button" onClick={() => setIsAssignTaskModalOpen(false)} className="flex-1 py-4 bg-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-all">Abort</button>
                                        <button type="submit" className="flex-[2] py-4 bg-amber-500 text-black rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20">Broadcast Priority</button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {activeMemberManagementGroup && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveMemberManagementGroup(null)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-[#0a0a0b] border border-white/10 w-full max-w-2xl max-h-[80vh] rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 flex flex-col">
                            <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                                <h3 className="text-xl font-bold text-white uppercase tracking-tight">Squad Management</h3>
                                <p className="text-[10px] font-mono text-white/40 uppercase mt-1">Registry Operator: {activeMemberManagementGroup.name}</p>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                                {/* Current Members */}
                                <section>
                                    <label className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] mb-4 block">Assigned Operatives</label>
                                    <div className="space-y-2">
                                        {(activeMemberManagementGroup.members || []).filter(Boolean).map(member => (
                                            <div key={member._id} className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/5 rounded-2xl group/member">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-white/10 overflow-hidden">
                                                        {member.profilePicture ? <img src={AuthService.getFileUrl(member.profilePicture)} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] text-pink-500 font-bold">{member.name?.[0]}</div>}
                                                    </div>
                                                    <div>
                                                        <p className="text-[12px] font-bold text-white">{member.name}</p>
                                                        <p className="text-[9px] font-mono text-white/40">{member.email}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleRemoveMember(activeMemberManagementGroup._id, member._id).then(() => {
                                                    const updated = { ...activeMemberManagementGroup, members: activeMemberManagementGroup.members.filter(m => m._id !== member._id) };
                                                    setActiveMemberManagementGroup(updated);
                                                })} className="p-2 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Add Members */}
                                <section>
                                    <label className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] mb-4 block">Recruit New Operatives</label>
                                    <div className="relative mb-4">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                                        <input 
                                            type="text" 
                                            placeholder="Search by name or email..." 
                                            className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-xs outline-none text-white focus:border-pink-500/50 transition-all font-sans"
                                            value={memberSearchQuery}
                                            onChange={(e) => setMemberSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                        {allUsers
                                            .filter(u => 
                                                !activeMemberManagementGroup.members?.some(m => m?._id === u._id) &&
                                                (u.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) || u.email.toLowerCase().includes(memberSearchQuery.toLowerCase()))
                                            )
                                            .map(userItem => (
                                                <div key={userItem._id} className="flex items-center justify-between p-3 border border-white/5 rounded-2xl hover:bg-white/[0.02] transition-all group/recruit">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                                                            {userItem.profilePicture ? <img src={AuthService.getFileUrl(userItem.profilePicture)} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] text-white/20">{userItem.name?.[0]}</div>}
                                                        </div>
                                                        <div>
                                                            <p className="text-[12px] font-bold text-white group-hover/recruit:text-pink-400 transition-colors">{userItem.name}</p>
                                                            <p className="text-[9px] font-mono text-white/20">{userItem.email}</p>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => handleAddMember(activeMemberManagementGroup._id, userItem._id).then(() => {
                                                        const updated = { ...activeMemberManagementGroup, members: [...activeMemberManagementGroup.members, userItem] };
                                                        setActiveMemberManagementGroup(updated);
                                                    })} className="p-2 px-4 bg-white/5 hover:bg-pink-500 text-[9px] font-bold uppercase tracking-widest text-white/40 hover:text-white rounded-xl transition-all">
                                                        Add
                                                    </button>
                                                </div>
                                            ))}
                                    </div>
                                </section>
                            </div>

                            <div className="p-8 border-t border-white/5 flex justify-end">
                                <button onClick={() => setActiveMemberManagementGroup(null)} className="px-8 py-3 bg-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white/20 transition-all">Done</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isEditModalOpen && editingGroup && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-[#0a0a0b] border border-white/10 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 p-10">
                             <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">Modify Project</h3>
                                    <p className="text-[10px] font-mono text-white/40 uppercase mt-1">Registry Update Console</p>
                                </div>
                                <form onSubmit={handleEditGroup} className="space-y-4">
                                    <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs outline-none text-white focus:border-pink-500/50 transition-all font-bold" value={editingGroup.name} onChange={(e) => setEditingGroup({...editingGroup, name: e.target.value})} />
                                    <input required type="url" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs outline-none text-white focus:border-pink-500/50 transition-all" value={editingGroup.repoUrl} onChange={(e) => setEditingGroup({...editingGroup, repoUrl: e.target.value})} />
                                    <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs outline-none text-white focus:border-pink-500/50 transition-all resize-none" value={editingGroup.description} onChange={(e) => setEditingGroup({...editingGroup, description: e.target.value})} />
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-white/40 uppercase tracking-widest pl-2">Inactivity Alert Limit (Days)</label>
                                        <input type="number" min="1" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs outline-none text-white focus:border-pink-500/50 transition-all font-bold" value={editingGroup.inactivityLimitDays || 3} onChange={(e) => setEditingGroup({...editingGroup, inactivityLimitDays: parseInt(e.target.value)})} />
                                    </div>

                                    <div className="flex gap-3 pt-6 border-t border-white/5">
                                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 bg-white/5 text-white/40 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:text-white transition-all">Abort</button>
                                        <button type="submit" disabled={isSyncing} className="flex-1 py-4 bg-pink-500 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-pink-600 disabled:opacity-50">Save Intel</button>
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
