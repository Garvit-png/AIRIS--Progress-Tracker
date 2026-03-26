import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { AuthService } from '../../services/authService';
import config from '../../config';
import ChatSidebar from '../chat/ChatSidebar';
import ChatWindow from '../chat/ChatWindow';

const SOCKET_URL = config.API_BASE_URL.includes('onrender.com') 
    ? config.API_BASE_URL.replace('/api', '') 
    : 'https://airis-backend.onrender.com';

export default function ChatPanel() {
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [allMembers, setAllMembers] = useState([]);
    const user = AuthService.getSession();

    useEffect(() => {
        const currentUserId = user?.id || user?._id;
        if (!currentUserId) return;

        const newSocket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('CONNECTED TO REAL-TIME SERVER');
            setIsConnected(true);
            newSocket.emit('join_user', currentUserId);
        });

        newSocket.on('disconnect', () => {
            console.log('DISCONNECTED FROM REAL-TIME SERVER');
            setIsConnected(false);
        });

        newSocket.on('reconnect', () => {
            newSocket.emit('join_user', currentUserId);
        });

        newSocket.on('receive_message', (message) => {
            console.log('REAL-TIME MESSAGE RECEIVED:', message);
            
            // Update active messages if this message belongs to current chat
            setMessages(prev => {
                const msgId = message._id || message.tempId;
                if (prev.some(m => (m._id === msgId) || (m.tempId && m.tempId === message.tempId))) {
                    return prev.map(m => (m.tempId && m.tempId === message.tempId) ? message : m);
                }
                
                const msgConvId = String(message.conversation?._id || message.conversation);
                const activeId = String(activeConversationRef.current?._id || '');
                
                if (msgConvId === activeId) {
                    return [...prev, message];
                }
                return prev;
            });

            setConversations(prev => {
                const msgConvId = String(message.conversation?._id || message.conversation);
                const updated = prev.map(conv => {
                    if (String(conv._id) === msgConvId) {
                        return { ...conv, lastMessage: message, updatedAt: new Date().toISOString() };
                    }
                    return conv;
                });
                
                if (!prev.some(conv => String(conv._id) === msgConvId)) {
                    // This covers the case where a new conversation was started
                    return prev; 
                }
                return [...updated].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            });
        });

        newSocket.on('new_conversation', (conversation) => {
            console.log('NEW CONVERSATION RECEIVED:', conversation);
            setConversations(prev => {
                if (prev.some(c => c._id === conversation._id)) return prev;
                return [conversation, ...prev];
            });
        });

        return () => newSocket.close();
    }, [user?.id, user?._id]); // Only recreate if user changes

    useEffect(() => {
        fetchConversations();
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            // Use the reliable getUsers which we know works for the Members tab
            const users = await AuthService.getUsers();
            if (users && Array.isArray(users)) {
                setAllMembers(users.filter(u => u.status === 'approved' && u._id !== (user?.id || user?._id)));
            } else {
                // Secondary fallback to chat-specific endpoint
                const data = await AuthService.getMembers();
                if (data && data.success && Array.isArray(data.members)) {
                    setAllMembers(data.members);
                }
            }
        } catch (error) {
            console.error('Failed to pre-fetch members:', error);
        }
    };

    // Reference to active conversation for socket listener
    const activeConversationRef = useRef(activeConversation);
    useEffect(() => {
        activeConversationRef.current = activeConversation;
        if (activeConversation) {
            fetchMessages(activeConversation._id);
        }
    }, [activeConversation]);

    const fetchConversations = async () => {
        try {
            const response = await fetch(`${SOCKET_URL}/api/chat/conversations`, {
                headers: {
                    'Authorization': `Bearer ${AuthService.getToken()}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setConversations(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (conversationId) => {
        try {
            const response = await fetch(`${SOCKET_URL}/api/chat/messages/${conversationId}`, {
                headers: {
                    'Authorization': `Bearer ${AuthService.getToken()}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setMessages(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    const handleSendMessage = async (text) => {
        if (!activeConversation || !text.trim()) return;

        const currentUserId = user?.id || user?._id;
        const tempId = `temp-${Date.now()}`;
        const optimisticMessage = {
            _id: tempId,
            tempId,
            text,
            sender: {
                _id: currentUserId,
                name: user.name,
                profilePicture: user.profilePicture
            },
            conversation: activeConversation._id,
            createdAt: new Date().toISOString(),
            status: 'sending'
        };

        // 1. UPDATE UI INSTANTLY (Optimistic)
        setMessages(prev => [...prev, optimisticMessage]);

        // 2. BROADCAST VIA SOCKET INSTANTLY (Dual-Path Speed)
        if (socket) {
            const participantIds = activeConversation.participants.map(p => p._id || p);
            socket.emit('send_message', {
                conversationId: activeConversation._id,
                message: optimisticMessage,
                participantIds
            });
        }

        // 3. PERSIST VIA API IN BACKGROUND
        try {
            const response = await fetch(`${SOCKET_URL}/api/chat/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AuthService.getToken()}`
                },
                body: JSON.stringify({
                    conversationId: activeConversation._id,
                    text,
                    tempId
                })
            });
            const data = await response.json();
            if (data.success) {
                const realMessage = data.data;
                // Replace optimistic message with real message
                setMessages(prev => prev.map(m => m.tempId === tempId ? realMessage : m));
                
                // Update local conversation list
                setConversations(prev => prev.map(conv => 
                    conv._id === activeConversation._id 
                    ? { ...conv, lastMessage: realMessage, updatedAt: new Date().toISOString() }
                    : conv
                ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
            }
        } catch (error) {
            console.error('Failed to persist message:', error);
            // Mark as failed in UI
            setMessages(prev => prev.map(m => m.tempId === tempId ? { ...m, status: 'error' } : m));
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] bg-black/20 rounded-3xl overflow-hidden border border-white/5 backdrop-blur-sm relative">
            {/* Real-time Status Indicator */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/5 backdrop-blur-md">
                <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 animate-pulse'}`} />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                    {isConnected ? 'Active Session' : 'Offline'}
                </span>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <ChatSidebar 
                    conversations={conversations} 
                    activeConversation={activeConversation}
                    onSelectConversation={setActiveConversation}
                    user={user}
                    loading={loading}
                    allMembers={allMembers}
                    onNewConversation={fetchConversations}
                />
                <ChatWindow 
                    conversation={activeConversation}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    user={user}
                    socket={socket}
                />
            </div>
        </div>
    );
}
