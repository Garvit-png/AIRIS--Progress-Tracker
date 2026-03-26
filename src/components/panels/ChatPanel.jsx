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
            newSocket.emit('join_user', currentUserId);
        });

        newSocket.on('receive_message', (message) => {
            console.log('REAL-TIME MESSAGE RECEIVED:', message);
            
            // Update active messages if this message belongs to current chat
            setMessages(prev => {
                // Check if message already exists (to avoid duplicates if sender)
                if (prev.some(m => m._id === message._id)) return prev;
                
                // Compare IDs correctly
                const msgConvId = message.conversation?._id || message.conversation;
                const activeId = activeConversationRef.current?._id;
                
                if (msgConvId === activeId) {
                    return [...prev, message];
                }
                return prev;
            });

            // Update conversations list (move to top and update last message)
            setConversations(prev => {
                const updated = prev.map(conv => {
                    const msgConvId = message.conversation?._id || message.conversation;
                    if (conv._id === msgConvId) {
                        return { ...conv, lastMessage: message, updatedAt: new Date().toISOString() };
                    }
                    return conv;
                });
                return [...updated].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
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

        try {
            const response = await fetch(`${SOCKET_URL}/api/chat/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AuthService.getToken()}`
                },
                body: JSON.stringify({
                    conversationId: activeConversation._id,
                    text
                })
            });
            const data = await response.json();
            if (data.success) {
                const newMessage = data.data;
                setMessages(prev => [...prev, newMessage]);
                if (socket) {
                    const participantIds = activeConversation.participants.map(p => p._id || p);
                    socket.emit('send_message', {
                        conversationId: activeConversation._id,
                        message: newMessage,
                        participantIds
                    });
                }
                // Update local conversation list
                setConversations(prev => prev.map(conv => 
                    conv._id === activeConversation._id 
                    ? { ...conv, lastMessage: newMessage, updatedAt: new Date().toISOString() }
                    : conv
                ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    return (
        <div className="flex h-[calc(100vh-140px)] bg-black/20 rounded-3xl overflow-hidden border border-white/5 backdrop-blur-sm">
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
    );
}
