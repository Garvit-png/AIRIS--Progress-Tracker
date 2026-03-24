import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { AuthService } from '../../services/authService';
import config from '../../config';
import ChatSidebar from '../chat/ChatSidebar';
import ChatWindow from '../chat/ChatWindow';

const SOCKET_URL = config.API_BASE_URL.replace('/api', '') || 'http://localhost:5002';

export default function ChatPanel() {
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const user = AuthService.getSession();

    useEffect(() => {
        const newSocket = io(SOCKET_URL, {
            withCredentials: true
        });

        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
        });

        newSocket.on('receive_message', (message) => {
            if (activeConversation && message.conversation === activeConversation._id) {
                setMessages(prev => [...prev, message]);
            }
            // Update last message in conversations list
            setConversations(prev => prev.map(conv => 
                conv._id === message.conversation 
                ? { ...conv, lastMessage: message, updatedAt: new Date().toISOString() }
                : conv
            ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
        });

        return () => newSocket.close();
    }, [activeConversation]);

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (activeConversation) {
            fetchMessages(activeConversation._id);
            if (socket) {
                socket.emit('join_conversation', activeConversation._id);
            }
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
                    socket.emit('send_message', {
                        conversationId: activeConversation._id,
                        message: newMessage
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
