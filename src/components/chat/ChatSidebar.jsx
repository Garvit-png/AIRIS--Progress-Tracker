import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Users, User } from 'lucide-react';
import { AuthService } from '../../services/authService';
import config from '../../config';

const API_BASE = config.API_BASE_URL;

export default function ChatSidebar({ conversations, activeConversation, onSelectConversation, user, loading, onNewConversation, allMembers = [] }) {
    const [search, setSearch] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [creationMode, setCreationMode] = useState('dm'); // 'dm' or 'group'
    const [newChatName, setNewChatName] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchingMessages, setIsSearchingMessages] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [groupParticipants, setGroupParticipants] = useState([]); // Array of user objects
    const [participantSearch, setParticipantSearch] = useState('');
    const [participantResults, setParticipantResults] = useState([]);

    // Instant local sync
    const isSynced = (allMembers && allMembers.length > 0);

    // Instant local search for DM
    React.useEffect(() => {
        const query = newChatName.toLowerCase().trim();
        if (query.length >= 1) {
            const queryParts = query.split(/\s+/).filter(Boolean);
            
            // Local Token Match (Instant)
            const membersList = Array.isArray(allMembers) ? allMembers : [];
            const matches = membersList.filter(m => {
                const nameLower = m && m.name ? m.name.toLowerCase() : '';
                return queryParts.every(part => nameLower.includes(part));
            });
            
            setSearchResults(matches);
        } else {
            setSearchResults([]);
        }
    }, [newChatName, allMembers]);

    // Instant Local search for Group Participants
    React.useEffect(() => {
        if (participantSearch.trim().length >= 1) {
            const query = participantSearch.toLowerCase().trim();
            const membersList = Array.isArray(allMembers) ? allMembers : [];
            const matches = membersList.filter(m => 
                m && m.name && m.name.toLowerCase().includes(query)
            );
            setParticipantResults(matches);
        } else {
            setParticipantResults([]);
        }
    }, [participantSearch, allMembers]);



    const handleStartDM = async (targetUser) => {
        try {
            const response = await fetch(`${API_BASE}/chat/conversation/dm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AuthService.getToken()}`
                },
                body: JSON.stringify({
                    userId: targetUser._id
                })
            });
            const chatData = await response.json();
            if (chatData.success) {
                onSelectConversation(chatData.data);
                onNewConversation();
                setIsCreating(false);
                setNewChatName('');
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Failed to create DM:', error);
            alert('PROTOCOL ERROR: Could not establish link');
        }
    };

    const handleAddParticipant = (userToAdd) => {
        if (!groupParticipants.find(p => p._id === userToAdd._id)) {
            setGroupParticipants([...groupParticipants, userToAdd]);
            setParticipantSearch('');
            setParticipantResults([]);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!groupName || groupParticipants.length === 0) return;

        try {
            const participantIds = groupParticipants.map(p => p._id);
            const response = await fetch(`${API_BASE}/chat/conversation/group`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AuthService.getToken()}`
                },
                body: JSON.stringify({
                    name: groupName,
                    participants: participantIds
                })
            });
            const data = await response.json();
            if (data.success) {
                onSelectConversation(data.data);
                onNewConversation();
                setIsCreating(false);
                setGroupName('');
                setGroupParticipants([]);
            }
        } catch (error) {
            console.error('Failed to create group:', error);
        }
    };

    const filteredConversations = (conversations || []).filter(conv => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        
        if (conv.isGroup) {
            return conv.groupName?.toLowerCase().includes(searchLower);
        }
        
        const otherParticipant = conv.participants.find(p => p._id !== (user?.id || user?._id));
        return otherParticipant?.name?.toLowerCase().includes(searchLower);
    });

    const discoveredProfiles = search && Array.isArray(allMembers)
        ? allMembers.filter(m => {
            const match = m && m.name ? m.name.toLowerCase().includes(search.toLowerCase()) : false;
            if (!match) return false;
            // Avoid duplicating users we already have a visible DM with
            const inVisibleDM = filteredConversations.some(conv => 
                !conv.isGroup && conv.participants && conv.participants.some(p => p._id === m._id)
            );
            return !inVisibleDM;
        })
        : [];

    return (
        <div className="w-80 border-r border-white/5 flex flex-col bg-white/[0.02]">
            {/* Header Area */}
            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold tracking-tight text-white">Messages</h2>
                        <div className={`w-1.5 h-1.5 rounded-full ${isSynced ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-pink-500 animate-pulse'}`} />
                    </div>
                    <button 
                        onClick={() => setIsCreating(!isCreating)}
                        className={`p-2 rounded-full transition-all ${isCreating ? 'bg-pink-500 text-white rotate-45' : 'hover:bg-white/5 text-pink-500'}`}
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                    <input 
                        type="text"
                        placeholder="Search conversations..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:border-pink-500/30 transition-all text-white"
                    />
                </div>
            </div>

            {/* Creation Menu & List Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {isCreating && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 border-b border-white/5 bg-pink-500/5 space-y-4"
                    >
                        <div className="flex bg-white/5 rounded-lg p-1">
                            <button 
                                onClick={() => setCreationMode('dm')}
                                className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${creationMode === 'dm' ? 'bg-pink-500 text-white' : 'text-white/40'}`}
                            >
                                Direct
                            </button>
                            <button 
                                onClick={() => setCreationMode('group')}
                                className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${creationMode === 'group' ? 'bg-pink-500 text-white' : 'text-white/40'}`}
                            >
                                Group
                            </button>
                        </div>

                        {creationMode === 'dm' ? (
                            <div className="space-y-2">
                                <div className="relative">
                                    <input 
                                        type="text"
                                        placeholder="Type teammate's name..."
                                        value={newChatName}
                                        onChange={(e) => setNewChatName(e.target.value)}
                                        className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-[11px] outline-none focus:border-pink-500/50 text-white"
                                        autoFocus
                                    />
                                </div>
                                
                                {allMembers.length === 0 && isCreating && (
                                    <p className="text-[8px] text-pink-500/60 text-center uppercase tracking-tighter animate-pulse">Establishing Deep Link to Mainframe...</p>
                                )}
                                
                                {newChatName.length >= 1 && searchResults.length > 0 && (
                                    <div className="max-h-40 overflow-y-auto rounded-lg border border-white/5 bg-black/40 shadow-xl">
                                        <p className="px-3 py-1.5 text-[8px] font-bold text-white/30 uppercase tracking-widest border-b border-white/5 bg-white/[0.02]">Instant Matches</p>
                                        {searchResults.map(result => (
                                            <button 
                                                key={result._id}
                                                onClick={() => handleStartDM(result)}
                                                className="w-full flex items-center gap-3 p-2 hover:bg-white/5 text-left transition-all"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                                                    {result.profilePicture ? <img src={result.profilePicture} className="w-full h-full object-cover" /> : <User size={14} className="m-auto text-white/20" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] font-bold text-white truncate">{result.name}</p>
                                                    <p className="text-[9px] text-white/30 truncate uppercase tracking-tighter">{result.role}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {newChatName.length >= 1 && searchResults.length === 0 && (
                                    <p className="text-[9px] text-white/20 text-center py-2 italic font-mono uppercase tracking-widest bg-white/[0.02] rounded-lg">No Spectral Match Found</p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <input 
                                    type="text"
                                    placeholder="Group Name..."
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-xs outline-none focus:border-pink-500/50 text-white font-bold"
                                />
                                <div className="relative">
                                    <input 
                                        type="text"
                                        placeholder="Add members by name..."
                                        value={participantSearch}
                                        onChange={(e) => setParticipantSearch(e.target.value)}
                                        className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-xs outline-none focus:border-pink-500/50 text-white"
                                    />
                                    {participantResults.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 z-50 max-h-40 overflow-y-auto rounded-lg border border-white/10 bg-[#161616] shadow-xl">
                                            {participantResults.map(result => (
                                                <button 
                                                    key={result._id}
                                                    onClick={() => handleAddParticipant(result)}
                                                    className="w-full flex items-center gap-2 p-2 hover:bg-white/5 text-left transition-all"
                                                >
                                                    <div className="w-6 h-6 rounded-md bg-white/5 overflow-hidden">
                                                        {result.profilePicture ? <img src={result.profilePicture} className="w-full h-full object-cover" /> : <User size={10} className="m-auto text-white/20" />}
                                                    </div>
                                                    <span className="text-[10px] text-white truncate">{result.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {groupParticipants.map(p => (
                                        <span key={p._id} className="px-2 py-1 bg-pink-500/20 text-pink-400 text-[9px] rounded-full flex items-center gap-1 border border-pink-500/20">
                                            {p.name}
                                            <button onClick={() => setGroupParticipants(groupParticipants.filter(e => e._id !== p._id))}>×</button>
                                        </span>
                                    ))}
                                </div>
                                <button 
                                    onClick={handleCreateGroup}
                                    disabled={!groupName || groupParticipants.length === 0}
                                    className="w-full py-2 bg-pink-500 text-white text-[10px] font-bold uppercase rounded-lg disabled:opacity-50"
                                >
                                    Initialize Group
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}

                {loading ? (
                    <div className="p-4 space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-3 animate-pulse">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl" />
                                <div className="flex-1 space-y-2 pt-1">
                                    <div className="h-3 bg-white/5 rounded w-1/2" />
                                    <div className="h-2 bg-white/5 rounded w-3/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-1">
                        {filteredConversations.length === 0 && discoveredProfiles.length === 0 && (
                            <div className="p-10 text-center space-y-2">
                                <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">No Conversations</p>
                                {search && <p className="text-[9px] text-white/10 italic">Search query "{search}" returned no local or spectral results.</p>}
                            </div>
                        )}

                        {filteredConversations.map(conv => {
                            const otherParticipant = conv.isGroup ? null : conv.participants.find(p => p._id !== (user?.id || user?._id));
                            const isActive = activeConversation?._id === conv._id;

                            return (
                                <button
                                    key={conv._id}
                                    onClick={() => onSelectConversation(conv)}
                                    className={`w-full flex items-center gap-3 p-4 transition-all border-l-2 hover:bg-white/[0.04] ${isActive ? 'bg-pink-500/5 border-pink-500' : 'border-transparent'}`}
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {conv.isGroup ? (
                                            conv.groupImage ? <img src={conv.groupImage} className="w-full h-full object-cover" /> : <Users size={20} className="text-white/40" />
                                        ) : (
                                            otherParticipant?.profilePicture ? <img src={otherParticipant.profilePicture} className="w-full h-full object-cover" /> : <User size={20} className="text-white/40" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <h3 className="text-sm font-semibold text-white truncate">
                                                {conv.isGroup ? conv.groupName : otherParticipant?.name}
                                            </h3>
                                            {conv.lastMessage && (
                                                <span className="text-[9px] text-white/30 font-mono">
                                                    {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-white/50 truncate">
                                            {conv.lastMessage ? conv.lastMessage.text : 'No messages yet'}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}

                        {discoveredProfiles.length > 0 && (
                            <div className="mt-4 pb-10">
                                <p className="px-6 py-2 text-[9px] font-black text-pink-500/60 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-white/5 bg-white/[0.02] mb-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500/40 shadow-[0_0_8px_rgba(255,45,120,0.4)]" />
                                    Global Profile Matches
                                </p>
                                {discoveredProfiles.map(profile => (
                                    <button
                                        key={profile._id}
                                        onClick={() => handleStartDM(profile)}
                                        className="w-full flex items-center gap-3 px-6 py-3 hover:bg-white/[0.04] transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-pink-500/20">
                                            {profile.profilePicture ? <img src={profile.profilePicture} className="w-full h-full object-cover" /> : <User size={16} className="text-white/20" />}
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <p className="text-xs font-bold text-white truncate group-hover:text-pink-400">{profile.name}</p>
                                            <p className="text-[9px] text-white/20 uppercase tracking-widest">{profile.role}</p>
                                        </div>
                                        <div className="px-2 py-0.5 rounded-lg bg-pink-500/10 text-pink-500 text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                            START CHAT
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
