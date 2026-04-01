import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, Github, ExternalLink, Trash2, 
    ClipboardList, AlertCircle, ChevronRight, Search, 
    Clock, CheckCircle2, Edit2, X, Activity, GitCommit, GitPullRequest,
    ArrowLeft, Layout, Settings, RefreshCw, UserPlus, Shield
} from 'lucide-react';
import { AuthService } from '../services/authService';

const ProjectPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user] = useState(AuthService.getSession());
    
    const [group, setGroup] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [repoLoading, setRepoLoading] = useState(false);
    const [isCompiling, setIsCompiling] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('squad'); // 'squad', 'activity', 'logs'
    const [error, setError] = useState(null);
    const [showGithubUsernames, setShowGithubUsernames] = useState(false);
    
    // Management states
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [memberSearchQuery, setMemberSearchQuery] = useState('');

    const isAdmin = user?.isAdmin || ['president', 'general secretary', 'admin'].includes(user?.role?.toLowerCase());

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const groupData = await AuthService.getGroup(id);
                setGroup(groupData);
                
                if (groupData.repoUrl) {
                    fetchRepoStats(groupData.repoUrl);
                }
                
                if (isAdmin) {
                    const users = await AuthService.getUsers();
                    setAllUsers(users);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [id, isAdmin]);

    const fetchRepoStats = async (repoUrl, isForced = false) => {
        if (!repoUrl) return;
        if (isForced) setIsRefreshing(true);
        else setRepoLoading(true);
        
        setIsCompiling(false);
        
        try {
            const newStats = await AuthService.getGitHubStats(repoUrl, isForced);
            
            if (newStats?.status === 202) {
                setIsCompiling(true);
                setRepoLoading(false);
                setTimeout(() => fetchRepoStats(repoUrl, isForced), 3000);
                return;
            }
            
            if (newStats && newStats.status !== 400 && newStats.status !== 500) {
                setStats(newStats);
            }
        } catch (err) {
            console.error('GitHub Intelligence Error:', err);
        } finally {
            setRepoLoading(false);
            setRepoLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleAddMember = async (userId) => {
        try {
            const updatedMembers = [...(group.members || []).map(m => m._id), userId];
            await AuthService.updateGroup(id, { members: updatedMembers });
            // Refresh group data
            const freshGroup = await AuthService.getGroup(id);
            setGroup(freshGroup);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!window.confirm('Remove this member from the project?')) return;
        try {
            const updatedMembers = (group.members || []).filter(m => m._id !== userId).map(m => m._id);
            await AuthService.updateGroup(id, { members: updatedMembers });
            const freshGroup = await AuthService.getGroup(id);
            setGroup(freshGroup);
        } catch (err) {
            alert(err.message);
        }
    };

    const formatUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `https://${url}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-mono text-pink-500 uppercase tracking-widest animate-pulse">Initializing Data Stream...</span>
                </div>
            </div>
        );
    }

    if (error || !group) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
                <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-12 max-w-md w-full text-center">
                    <AlertCircle size={48} className="text-red-500 mx-auto mb-6" />
                    <h2 className="text-xl font-bold text-white mb-2">Access Terminated</h2>
                    <p className="text-sm text-white/40 mb-8">{error || 'Project configuration not found.'}</p>
                    <button onClick={() => navigate('/dashboard')} className="w-full py-4 bg-white text-black font-bold uppercase text-[10px] tracking-widest rounded-2xl hover:bg-pink-500 hover:text-white transition-all">Return to Dashboard</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-pink-500/30">
            {/* Navigation Header */}
            <header className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate('/dashboard')} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group">
                            <ArrowLeft size={18} className="text-white/40 group-hover:text-white group-hover:-translate-x-1 transition-all" />
                        </button>
                        <div className="h-8 w-[1px] bg-white/10" />
                        <div>
                            <h1 className="text-lg font-bold text-white tracking-tight">{group.name}</h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Operation: Project Management</span>
                                {group.repoUrl && (
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-pink-500/10 rounded-md border border-pink-500/20">
                                        <Github size={10} className="text-pink-500" />
                                        <span className="text-[8px] font-bold text-pink-500 uppercase tracking-widest">Intelligence Live</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {group.repoUrl && (
                            <button 
                                onClick={() => fetchRepoStats(group.repoUrl, true)}
                                disabled={isRefreshing || repoLoading}
                                className="flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-pink-500 border border-white/10 hover:border-pink-500 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all group"
                            >
                                <RefreshCw size={12} className={`${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                                {isRefreshing ? 'Syncing...' : 'Force Sync'}
                            </button>
                        )}
                        <a 
                            href={formatUrl(group.repoUrl)} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5"
                        >
                            <ExternalLink size={18} className="text-white/40 hover:text-white" />
                        </a>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10 space-y-12">
                {/* Project Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="col-span-1 md:col-span-2 bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 blur-3xl rounded-full -mr-20 -mt-20 group-hover:bg-pink-500/10 transition-colors" />
                        <label className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] block mb-4">Mission Directive</label>
                        <h2 className="text-xl font-bold text-white leading-relaxed mb-4">{group.description || 'No objective parameters defined for this operation.'}</h2>
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-3">
                                {group.members.slice(0, 5).map((m, i) => (
                                    <div key={i} className="w-10 h-10 rounded-2xl border-4 border-[#050505] bg-white/5 overflow-hidden">
                                        {m.profilePicture ? (
                                            <img src={AuthService.getFileUrl(m.profilePicture)} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-pink-500">{m.name?.[0]}</div>
                                        )}
                                    </div>
                                ))}
                                {group.members.length > 5 && (
                                    <div className="w-10 h-10 rounded-2xl border-4 border-[#050505] bg-white/10 flex items-center justify-center text-[10px] font-mono font-bold">+{group.members.length - 5}</div>
                                )}
                            </div>
                            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{group.members.length} Active Operatives</span>
                        </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 flex flex-col justify-center items-center text-center group hover:border-pink-500/30 transition-all">
                        <GitCommit size={24} className="text-pink-500 mb-4 group-hover:scale-110 transition-transform" />
                        <span className="text-4xl font-mono font-bold text-white mb-1">{stats?.totalCommits || 0}</span>
                        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Global Commits</span>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 flex flex-col justify-center items-center text-center group hover:border-blue-500/30 transition-all">
                        <Activity size={24} className="text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                        <span className="text-4xl font-mono font-bold text-white mb-1">{(stats?.contributors || []).length}</span>
                        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Active Contributors</span>
                    </div>
                </div>

                {/* Tab Navigation & Controls */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 pb-8">
                    <div className="flex p-1.5 bg-white/[0.02] border border-white/10 rounded-2xl">
                        {[
                            { id: 'squad', label: 'Squad Registry', icon: Users },
                            { id: 'activity', label: 'Intelligence Feed', icon: GitPullRequest },
                            { id: 'logs', label: 'Deployment Logs', icon: Layout }
                        ].map(t => (
                            <button 
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`flex items-center gap-3 px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                                    activeTab === t.id ? 'bg-white text-black shadow-xl' : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <t.icon size={14} />
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 px-4 py-2.5 bg-black/40 border border-white/10 rounded-2xl">
                            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Swap Names</span>
                            <button 
                                onClick={() => setShowGithubUsernames(!showGithubUsernames)}
                                className={`w-10 h-5 rounded-full p-1 transition-all ${showGithubUsernames ? 'bg-pink-500' : 'bg-white/10'}`}
                            >
                                <div className={`w-3 h-3 bg-white rounded-full transition-all ${showGithubUsernames ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>
                        {isAdmin && (
                            <button 
                                onClick={() => setIsAssignModalOpen(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-pink-500/20"
                            >
                                <UserPlus size={14} />
                                Enlist Member
                            </button>
                        )}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === 'squad' && (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold tracking-tight">Active Personnel</h3>
                                <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest py-1.5 px-3 bg-white/5 rounded-lg">
                                    Inactivity Shield Threshold: {group.inactivityLimitDays || 3} Days
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {group.members.map((member, idx) => {
                                    const githubStats = (stats?.contributors || []).find(c => 
                                        c.login?.toLowerCase() === member.githubUsername?.toLowerCase()
                                    );
                                    
                                    const lastCommitDate = githubStats?.recentActivity?.[0]?.date ? new Date(githubStats.recentActivity[0].date) : null;
                                    const inactivityDays = lastCommitDate ? (new Date() - lastCommitDate) / (1000 * 60 * 60 * 24) : 999;
                                    const isInactive = inactivityDays > (group.inactivityLimitDays || 3) && githubStats;
                                    
                                    return (
                                        <div key={idx} className={`bg-white/[0.02] border transition-all rounded-[2.5rem] p-8 group relative overflow-hidden ${isInactive ? 'border-red-500/30' : 'border-white/5 hover:border-pink-500/20'}`}>
                                            <div className="flex items-center gap-5 relative z-10 mb-8">
                                                <div className="w-20 h-20 rounded-[1.5rem] bg-[#050505] border border-white/10 p-1 flex-shrink-0 group-hover:border-pink-500/30 transition-colors overflow-hidden">
                                                    {member.profilePicture ? (
                                                        <img src={AuthService.getFileUrl(member.profilePicture)} className="w-full h-full rounded-2xl object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full rounded-2xl bg-pink-500/5 flex items-center justify-center">
                                                            <span className="text-2xl font-bold text-pink-500">{member.name?.charAt(0)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-lg font-bold text-white truncate group-hover:text-pink-400 transition-colors">
                                                        {showGithubUsernames ? (member.githubUsername || 'NO ID') : member.name}
                                                    </h4>
                                                    <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-1 truncate">{member.role || 'Field Operative'}</p>
                                                    {githubStats && (
                                                        <div className={`mt-3 py-1 px-3 rounded-lg border text-[8px] font-bold uppercase tracking-widest inline-flex items-center gap-1.5 ${isInactive ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${isInactive ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                                                            {isInactive ? 'Critical Inactivity' : 'Operational'}
                                                        </div>
                                                    )}
                                                </div>
                                                {isAdmin && (
                                                    <button onClick={() => handleRemoveMember(member._id)} className="absolute top-0 right-0 p-3 text-white/10 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/5">
                                                <div>
                                                    <span className="text-[9px] font-mono text-white/30 uppercase tracking-[0.2em] block mb-1">Total Commits</span>
                                                    <span className="text-2xl font-mono font-bold text-white">{githubStats?.commits || 0}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[9px] font-mono text-white/30 uppercase tracking-[0.2em] block mb-1">Issue Focus</span>
                                                    <span className="text-2xl font-mono font-bold text-pink-500">{(githubStats?.activeIssues || []).length}</span>
                                                </div>
                                            </div>

                                            {githubStats && (
                                                <div className="mt-8 pt-8 border-t border-dashed border-white/10 space-y-3">
                                                    <label className="text-[9px] font-mono text-white/30 uppercase tracking-widest block">Last Strategic Pulse</label>
                                                    {githubStats.recentActivity?.[0] ? (
                                                        <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-1">
                                                            <span className="text-[11px] text-white/80 line-clamp-1 italic">"{githubStats.recentActivity[0].message}"</span>
                                                            <span className="text-[9px] font-mono text-pink-500/60 uppercase">
                                                                {new Date(githubStats.recentActivity[0].date).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] font-mono text-white/20 italic">No recent logs found.</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'activity' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-pink-500/10 rounded-2xl border border-pink-500/20">
                                        <GitCommit size={20} className="text-pink-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Strategic Activity Feed</h3>
                                        <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Real-time repository updates</p>
                                    </div>
                                </div>

                                {stats?.commitHistory?.length > 0 ? (
                                    <div className="space-y-4 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-[1px] before:bg-white/5">
                                        {stats.commitHistory.map((commit, idx) => (
                                            <div key={idx} className="relative pl-12 group">
                                                <div className="absolute left-[21px] top-6 w-2.5 h-2.5 rounded-full bg-[#050505] border-2 border-pink-500 z-10 group-hover:scale-125 transition-transform" />
                                                <a 
                                                    href={commit.url} target="_blank" rel="noreferrer"
                                                    className="block bg-white/[0.02] border border-white/5 hover:border-pink-500/30 rounded-[2rem] p-6 transition-all hover:bg-white/[0.04]"
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex gap-4 min-w-0">
                                                            <img src={commit.author.avatar} alt="" className="w-10 h-10 rounded-xl border border-white/10" />
                                                            <div className="space-y-1 overflow-hidden">
                                                                <h4 className="text-sm font-bold text-white group-hover:text-pink-400 transition-colors truncate">{commit.message}</h4>
                                                                <div className="flex items-center gap-2 text-[10px] font-mono text-white/40">
                                                                    <span className="text-pink-500/60 font-bold">{commit.author.login}</span>
                                                                    <span>•</span>
                                                                    <span>{new Date(commit.date).toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <ExternalLink size={12} className="text-white/20 shrink-0 mt-1" />
                                                    </div>
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-[2.5rem]">
                                        <Activity size={32} className="text-white/10 mx-auto mb-4" />
                                        <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">No intelligence logs found for this sector.</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-12">
                                <section className="space-y-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                                            <AlertCircle size={20} className="text-amber-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">Open Tickets & Issues</h3>
                                            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Ongoing obstacles & technical targets</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 gap-4">
                                        {(stats?.activeIssues || []).length > 0 ? (
                                            stats.activeIssues.map((issue, idx) => (
                                                <a 
                                                    key={idx} href={issue.url} target="_blank" rel="noreferrer"
                                                    className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 hover:border-amber-500/30 rounded-2xl transition-all"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-[10px] font-mono text-amber-500 font-bold bg-amber-500/10 px-2 py-1 rounded">#{issue.number}</span>
                                                        <span className="text-sm font-bold text-white/80">{issue.title}</span>
                                                    </div>
                                                    <ChevronRight size={16} className="text-white/20" />
                                                </a>
                                            ))
                                        ) : (
                                            <div className="p-10 text-center bg-green-500/5 border border-dashed border-green-500/20 rounded-[2.5rem]">
                                                <CheckCircle2 size={24} className="text-green-500/40 mx-auto mb-3" />
                                                <span className="text-[10px] font-mono text-green-500/60 uppercase tracking-widest">All sectors currently clear.</span>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>
                        </div>
                    )}

                    {activeTab === 'logs' && (
                        <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-12 text-center">
                            <Layout size={48} className="text-white/10 mx-auto mb-6" />
                            <h3 className="text-xl font-bold mb-2">Operation Logs</h3>
                            <p className="text-white/40 max-w-md mx-auto text-sm leading-relaxed">The historical deployment log for this sector is currently being archived. Please check back later for detailed historical analytics.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Member Management Modal */}
            <AnimatePresence>
                {isAssignModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAssignModalOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-lg bg-[#080808] border border-white/10 rounded-[3rem] p-10 shadow-2xl overflow-hidden">
                            <div className="absolute top-0 right-0 p-8">
                                <button onClick={() => setIsAssignModalOpen(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mb-10">
                                <div className="p-4 bg-pink-500/10 rounded-2xl border border-pink-500/20">
                                    <UserPlus size={24} className="text-pink-500" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold tracking-tight">Enlist Personnel</h3>
                                    <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Assign operatives to this project</p>
                                </div>
                            </div>

                            <div className="relative mb-8">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                <input 
                                    type="text"
                                    placeholder="Search by name or identity..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm outline-none text-white focus:border-pink-500/50 transition-all"
                                    value={memberSearchQuery}
                                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                                {allUsers
                                    .filter(u => !group.members.some(m => m._id === u._id))
                                    .filter(u => u.name?.toLowerCase().includes(memberSearchQuery.toLowerCase()) || u.email?.toLowerCase().includes(memberSearchQuery.toLowerCase()))
                                    .map((u, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-pink-500/20 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-xs font-bold text-pink-500 border border-pink-500/10">
                                                    {u.profilePicture ? <img src={AuthService.getFileUrl(u.profilePicture)} className="w-full h-full object-cover rounded-xl" /> : u.name?.[0]}
                                                </div>
                                                <div>
                                                    <span className="block text-sm font-bold text-white group-hover:text-pink-400 transition-colors">{u.name}</span>
                                                    <span className="block text-[9px] font-mono text-white/30 truncate max-w-[150px]">{u.email}</span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleAddMember(u._id)}
                                                className="px-6 py-2 bg-white/5 hover:bg-pink-500 text-white/60 hover:text-white border border-white/10 hover:border-pink-500 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                                            >
                                                Assign
                                            </button>
                                        </div>
                                    ))}
                                {allUsers.filter(u => !group.members.some(m => m._id === u._id)).length === 0 && (
                                    <div className="py-10 text-center">
                                        <Shield size={32} className="text-white/5 mx-auto mb-3" />
                                        <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">No available personnel found.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProjectPage;
