import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Users, User } from 'lucide-react';
import { AuthService } from '../../services/authService';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

export default function ChatSidebar({ conversations, activeConversation, onSelectConversation, user, loading, onNewConversation }) {
    const [search, setSearch] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [creationMode, setCreationMode] = useState('dm'); // 'dm' or 'group'
    const [newChatEmail, setNewChatEmail] = useState('');
    const [groupName, setGroupName] = useState('');
    const [groupParticipants, setGroupParticipants] = useState([]); // Array of emails
    const [newParticipantEmail, setNewParticipantEmail] = useState('');

    const handleCreateDM = async (e) => {
        e.preventDefault();
        if (!newChatEmail.trim()) return;

        try {
            // Find user by email
            const res = await fetch(`${SOCKET_URL}/api/auth/users/search/${newChatEmail.trim()}`, {
                headers: { 'Authorization': `Bearer ${AuthService.getToken()}` }
            });
            const data = await res.json();
            
            if (!data.success) {
                alert(data.message || 'User not registered in system');
                return;
            }

            const response = await fetch(`${SOCKET_URL}/api/chat/conversation/dm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AuthService.getToken()}`
                },
                body: JSON.stringify({
                    userId: data.user._id
                })
            });
            const chatData = await response.json();
            if (chatData.success) {
                onSelectConversation(chatData.data);
                onNewConversation();
                setIsCreating(false);
                setNewChatEmail('');
            }
        } catch (error) {
            console.error('Failed to create DM:', error);
            alert('PROTOCOL ERROR: Could not establish link');
        }
    };

    const handleAddParticipant = (e) => {
        e.preventDefault();
        if (newParticipantEmail && !groupParticipants.includes(newParticipantEmail)) {
            setGroupParticipants([...groupParticipants, newParticipantEmail]);
            setNewParticipantEmail('');
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!groupName || groupParticipants.length === 0) return;

        try {
            // Find all participants by email
            const participantIds = [];
            for (const email of groupParticipants) {
                const res = await fetch(`${SOCKET_URL}/api/auth/users/search/${email}`, {
                    headers: { 'Authorization': `Bearer ${AuthService.getToken()}` }
                });
                const data = await res.json();
                if (data.success) participantIds.push(data.user._id);
            }

            const response = await fetch(`${SOCKET_URL}/api/chat/conversation/group`, {
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
        return (
            otherParticipant?.name?.toLowerCase().includes(searchLower) ||
            otherParticipant?.email?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="w-80 border-r border-white/5 flex flex-col bg-white/[0.02]">
            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold tracking-tight text-white">Messages</h2>
                    <button 
                        onClick={() => setIsCreating(!isCreating)}
                        className="p-2 hover:bg-white/5 rounded-full transition-all text-pink-500"
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
                            <form onSubmit={handleCreateDM} className="space-y-2">
                                <input 
                                    type="email"
                                    placeholder="Friend's email..."
                                    value={newChatEmail}
                                    onChange={(e) => setNewChatEmail(e.target.value)}
                                    className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-xs outline-none focus:border-pink-500/50 text-white"
                                    required
                                />
                                <button className="w-full py-2 bg-pink-500 text-white text-[10px] font-bold uppercase rounded-lg">
                                    Start Correspondence
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-3">
                                <input 
                                    type="text"
                                    placeholder="Group Name..."
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-xs outline-none focus:border-pink-500/50 text-white font-bold"
                                />
                                <form onSubmit={handleAddParticipant} className="flex gap-2">
                                    <input 
                                        type="email"
                                        placeholder="Add email..."
                                        value={newParticipantEmail}
                                        onChange={(e) => setNewParticipantEmail(e.target.value)}
                                        className="flex-1 bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-xs outline-none focus:border-pink-500/50 text-white"
                                    />
                                    <button className="px-3 bg-white/10 text-white rounded-lg hover:bg-white/20">
                                        +
                                    </button>
                                </form>
                                <div className="flex flex-wrap gap-1">
                                    {groupParticipants.map(email => (
                                        <span key={email} className="px-2 py-1 bg-pink-500/20 text-pink-400 text-[9px] rounded-full flex items-center gap-1 border border-pink-500/20">
                                            {email}
                                            <button onClick={() => setGroupParticipants(groupParticipants.filter(e => e !== email))}>×</button>
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
                ) : filteredConversations.length === 0 ? (
                    <div className="p-10 text-center space-y-2">
                        <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">No Conversations</p>
                    </div>
                ) : (
                    filteredConversations.map(conv => {
                        const otherParticipant = conv.isGroup ? null : conv.participants.find(p => p._id !== user.id);
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
                    })
                )}
            </div>
        </div>
    );
}
