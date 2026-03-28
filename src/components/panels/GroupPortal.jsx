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
    CheckCircle2
} from 'lucide-react';
import { AuthService } from '../../services/authService';

const GroupPortal = () => {
    const [user, setUser] = useState(AuthService.getSession());
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // overview, management (admin only)
    
    // Create Group Modal
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newGroup, setNewGroup] = useState({ name: '', description: '', repoUrl: '' });
    
    // Member Management
    const [allUsers, setAllUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [taskData, setTaskData] = useState({ title: '', description: '', deadline: '', isPriority: true });

    const isAdmin = user?.isAdmin || ['president', 'general secretary', 'admin'].includes(user?.role?.toLowerCase());

    useEffect(() => {
        fetchGroups();
        if (isAdmin) {
            fetchAllUsers();
        }
    }, []);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const data = await AuthService.getGroups();
            setGroups(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllUsers = async () => {
        try {
            const data = await AuthService.getUsers();
            setAllUsers(data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
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
        const [stats, setStats] = useState(null);
        const [repoLoading, setRepoLoading] = useState(false);

        useEffect(() => {
            if (repoUrl) fetchRepoStats();
        }, [repoUrl]);

        const fetchRepoStats = async () => {
            if (!repoUrl) return;
            setRepoLoading(true);
            try {
                // Example: Extracts 'owner/repo' from 'https://github.com/owner/repo'
                const slug = repoUrl.replace('https://github.com/', '').split('/').slice(0, 2).join('/');
                if (!slug) return;

                const response = await fetch(`https://api.github.com/repos/${slug}/stats/contributors`);
                if (response.status === 202) {
                     // GitHub is recalculating, try again in a few seconds or just show empty
                     return;
                }
                const data = await response.json();
                
                if (Array.isArray(data)) {
                    const top = data.sort((a, b) => b.total - a.total)[0];
                    setStats({
                        totalCommits: data.reduce((acc, curr) => acc + curr.total, 0),
                        topContributor: top?.author?.login || 'N/A'
                    });
                }
            } catch (err) {
                console.error('GitHub API error:', err);
            } finally {
                setRepoLoading(false);
            }
        };

        if (repoLoading) return <div className="animate-pulse h-4 w-20 bg-white/5 rounded" />;
        if (!stats) return <span className="text-[10px] text-white/20">NO DATA</span>;

        return (
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                    <Github size={12} className="text-white/40" />
                    <span className="text-[10px] font-mono font-bold text-pink-400">{stats.totalCommits} COMMITS</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Users size={12} className="text-white/40" />
                    <span className="text-[10px] font-mono text-white/60">DOMINATING: <span className="text-white font-bold">{stats.topContributor.toUpperCase()}</span></span>
                </div>
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
                                            setSelectedGroup(group);
                                            setIsAssignTaskModalOpen(true);
                                        }}
                                        className="p-2 bg-white/5 border border-white/10 rounded-lg text-white/40 hover:text-pink-400 hover:bg-pink-400/10 transition-all"
                                        title="Assign Priority Task"
                                    >
                                        <ClipboardList size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteGroup(group._id)}
                                        className="p-2 bg-white/5 border border-white/10 rounded-lg text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-all"
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-2 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest animate-pulse">Syncing Group Data...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {isAdmin && (
                <div className="flex gap-2 mb-8 p-1.5 bg-pink-500/5 rounded-2xl w-fit border border-pink-500/20 backdrop-blur-xl">
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
                                            className="flex-2 px-10 py-4 bg-pink-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-pink-600 transition-all shadow-xl"
                                        >
                                            Create Registry
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
        </div>
    );
};

const X = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

export default GroupPortal;
