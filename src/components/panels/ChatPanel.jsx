import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthService } from '../../services/authService';
import config from '../../config';
import ChatSidebar from '../chat/ChatSidebar';
import ChatWindow from '../chat/ChatWindow';
import socketService from '../../services/socketService';

const SOCKET_URL = config.API_BASE_URL.includes('onrender.com') 
    ? config.API_BASE_URL.replace('/api', '') 
    : (window.location.hostname === 'localhost' ? 'http://localhost:5002' : 'https://airis-backend.onrender.com');

export default function ChatPanel() {
    const queryClient = useQueryClient();
    const [activeConversation, setActiveConversation] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const user = AuthService.getSession();
    const currentUserId = user?.id || user?._id;

    // 1. Fetch Conversations with React Query
    const { data: convData, isLoading: convLoading } = useQuery({
        queryKey: ['conversations'],
        queryFn: AuthService.getConversations,
        select: (data) => data.success ? data.data : [],
    });

    const conversations = convData || [];

    // Prefetch top 3 conversations' messages
    useEffect(() => {
        if (conversations.length > 0) {
            conversations.slice(0, 3).forEach(conv => {
                queryClient.prefetchQuery({
                    queryKey: ['messages', conv._id],
                    queryFn: () => AuthService.getMessages(conv._id),
                    staleTime: 1000 * 60 * 2, // 2 minutes
                });
            });
        }
    }, [conversations, queryClient]);

    // 2. Fetch Members with React Query
    const { data: memberData } = useQuery({
        queryKey: ['members'],
        queryFn: AuthService.getUsers,
        select: (users) => {
            if (users && Array.isArray(users)) {
                return users.filter(u => u.status === 'approved' && u._id !== (user?.id || user?._id));
            }
            return [];
        }
    });

    const allMembers = memberData || [];

    // 3. Fetch Messages with React Query
    const { data: msgData } = useQuery({
        queryKey: ['messages', activeConversation?._id],
        queryFn: () => AuthService.getMessages(activeConversation?._id),
        enabled: !!activeConversation?._id,
        select: (data) => data.success ? data.data : [],
    });

    const messages = msgData || [];

    // Socket Setup
    useEffect(() => {
        if (!currentUserId) return;

        socketService.connect(currentUserId);
        
        const cleanupConn = socketService.on('connection_change', setIsConnected);
        const cleanupMsg = socketService.on('receive_message', (message) => {
            const msgConvId = String(message.conversation?._id || message.conversation);
            
            // Update messages cache
            queryClient.setQueryData(['messages', msgConvId], (old) => {
                const currentData = old?.data || [];
                const msgId = message._id || message.tempId;
                
                let newData;
                if (currentData.some(m => (m._id === msgId) || (m.tempId && m.tempId === message.tempId))) {
                    newData = currentData.map(m => (m.tempId && m.tempId === message.tempId) ? message : m);
                } else {
                    newData = [...currentData, message];
                }
                
                return { success: true, data: newData };
            });

            // Update conversations cache (last message)
            queryClient.setQueryData(['conversations'], (old) => {
                if (!old || !old.data) return old;
                const updated = old.data.map(conv => {
                    if (String(conv._id) === msgConvId) {
                        return { ...conv, lastMessage: message, updatedAt: new Date().toISOString() };
                    }
                    return conv;
                });
                return { ...old, data: [...updated].sort((a, b) => {
                    const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(0);
                    const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(0);
                    return dateB - dateA;
                }) };
            });
        });

        const cleanupConv = socketService.on('new_conversation', (conversation) => {
            queryClient.setQueryData(['conversations'], (old) => {
                if (!old || !old.data) return { success: true, data: [conversation] };
                if (old.data.some(c => c._id === conversation._id)) return old;
                return { ...old, data: [conversation, ...old.data] };
            });
        });

        return () => {
            cleanupConn();
            cleanupMsg();
            cleanupConv();
        };
    }, [currentUserId, queryClient]);

    // Send Message Mutation
    const sendMessageMutation = useMutation({
        mutationFn: ({ text, file, tempId }) => fetch(`${SOCKET_URL}/api/chat/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AuthService.getToken()}`
            },
            body: JSON.stringify({
                conversationId: activeConversation._id,
                text,
                tempId,
                file
            })
        }).then(res => res.json()),
        onMutate: async ({ text, file, tempId }) => {
            const convId = activeConversation._id;
            await queryClient.cancelQueries({ queryKey: ['messages', convId] });
            const previousMessages = queryClient.getQueryData(['messages', convId]);

            const currentUserId = user?.id || user?._id;
            const optimisticMessage = {
                _id: tempId,
                tempId,
                text: text || '',
                file,
                sender: {
                    _id: currentUserId,
                    name: user.name,
                    profilePicture: user.profilePicture
                },
                conversation: convId,
                createdAt: new Date().toISOString(),
                status: 'sending'
            };

            // Update messages cache optimism
            queryClient.setQueryData(['messages', convId], (old) => {
                const currentData = old?.data || [];
                return { success: true, data: [...currentData, optimisticMessage] };
            });

            const participantIds = activeConversation.participants.map(p => p._id || p);
            // Broadcast via socket immediately for ultra-fast sync
            socketService.emit('send_message', {
                conversationId: convId,
                message: optimisticMessage,
                participantIds
            }, (ack) => {
                if (ack?.success) {
                    console.log('Mainframe Ack Received');
                    // We could mark message as 'delivered' here
                    queryClient.setQueryData(['messages', convId], (old) => {
                        if (!old || !old.data) return old;
                        return {
                            ...old,
                            data: old.data.map(m => m.tempId === tempId ? { ...m, status: 'delivered' } : m)
                        };
                    });
                }
            });

            return { previousMessages };
        },
        onError: (err, variables, context) => {
            const convId = activeConversation._id;
            queryClient.setQueryData(['messages', convId], context.previousMessages);
        },
        onSuccess: (data, variables) => {
            const convId = activeConversation._id;
            if (data.success) {
                const realMessage = data.data;
                queryClient.setQueryData(['messages', convId], (old) => {
                    if (!old || !old.data) return { success: true, data: [realMessage] };
                    return {
                        ...old,
                        data: old.data.map(m => m.tempId === variables.tempId ? realMessage : m)
                    };
                });
                
                // Refresh conversations to get updated lastMessage
                queryClient.invalidateQueries({ queryKey: ['conversations'] });
            }
        }
    });

    const handleSendMessage = (text, file = null) => {
        if (!activeConversation || (!text.trim() && !file)) return;
        const tempId = `temp-${Date.now()}`;
        sendMessageMutation.mutate({ text, file, tempId });
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
                    loading={convLoading}
                    allMembers={allMembers}
                    onNewConversation={() => queryClient.invalidateQueries({ queryKey: ['conversations'] })}
                />
                <ChatWindow 
                    conversation={activeConversation}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isConnected={isConnected}
                />
            </div>
        </div>
    );
}
