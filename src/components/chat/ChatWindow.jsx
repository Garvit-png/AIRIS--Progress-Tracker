import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Users, MoreVertical, Paperclip, Smile, File, FileText, Download, X } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { AuthService } from '../../services/authService';
import config from '../../config';

// Helper for avatar initials
const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 0) return '??';
    return parts.map(n => n[0]).join('').toUpperCase().substring(0, 2);
};

export default function ChatWindow({ conversation, messages, onSendMessage, user, socket }) {
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);
    const emojiPickerRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (socket) {
            socket.on('user_typing', (data) => {
                const currentUserId = user?.id || user?._id;
                if (conversation && data.conversationId === conversation._id && data.userId !== currentUserId) {
                    setTypingUser(data.isTyping ? data.userId : null);
                }
            });
        }
        return () => socket?.off('user_typing');
    }, [socket, conversation, user.id]);

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        
        if (!isTyping && socket) {
            const currentUserId = user?.id || user?._id;
            const participantIds = conversation.participants.map(p => p._id || p);
            setIsTyping(true);
            socket.emit('typing', { conversationId: conversation._id, userId: currentUserId, isTyping: true, participantIds });
        }

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            const currentUserId = user?.id || user?._id;
            const participantIds = conversation.participants.map(p => p._id || p);
            setIsTyping(false);
            if (socket) {
                socket.emit('typing', { conversationId: conversation._id, userId: currentUserId, isTyping: false, participantIds });
            }
        }, 3000);
    };

    const onEmojiClick = (emojiData) => {
        setNewMessage(prev => prev + emojiData.emoji);
    };

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${config.API_BASE_URL}/chat/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${AuthService.getToken()}`
                },
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                // Send message with file
                onSendMessage('', data.data);
            } else {
                alert('Upload failed: ' + data.message);
            }
        } catch (error) {
            console.error('File upload error:', error);
            alert('PROTOCOL ERROR: Uplink failed');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        const currentUserId = user?.id || user?._id;
        const participantIds = conversation.participants.map(p => p._id || p);
        onSendMessage(newMessage);
        setNewMessage('');
        setShowEmojiPicker(false);
        setIsTyping(false);
        if (socket) {
            socket.emit('typing', { conversationId: conversation._id, userId: currentUserId, isTyping: false, participantIds });
        }
    };

    const renderFileAttachment = (file) => {
        if (!file) return null;

        const isImage = file.fileType?.startsWith('image/');
        const isPdf = file.fileType === 'application/pdf';
        const fileUrl = AuthService.getFileUrl(file.url);

        if (isImage) {
            return (
                <div className="mt-2 rounded-lg overflow-hidden border border-white/10 group relative">
                    <img src={fileUrl} alt={file.name} className="max-w-full h-auto max-h-60 object-contain bg-black/20" />
                    <a 
                        href={fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                        <Download size={20} className="text-white" />
                    </a>
                </div>
            );
        }

        return (
            <div className="mt-2 flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-500">
                    {isPdf ? <FileText size={20} /> : <File size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-white truncate uppercase tracking-wider">{file.name}</p>
                    <p className="text-[8px] text-white/30 uppercase">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <a 
                    href={fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-white/10 rounded-full text-white/30 hover:text-white transition-all"
                >
                    <Download size={16} />
                </a>
            </div>
        );
    };

    if (!conversation) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-10 space-y-6 text-center">
                <div className="w-24 h-24 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex items-center justify-center shadow-2xl">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-10 h-10 text-white/10">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                </div>
                <div className="max-w-xs space-y-2">
                    <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-white/40">Secure Connection</h3>
                    <p className="text-xs text-white/20">Select a communication terminal to begin encrypted correspondence.</p>
                </div>
            </div>
        );
    }

    const currentUserId = user?.id || user?._id;
    const otherParticipant = conversation.isGroup 
        ? null 
        : (Array.isArray(conversation.participants) 
            ? conversation.participants.find(p => (p?._id || p) !== currentUserId)
            : null);

    return (
        <div className="flex-1 flex flex-col bg-black/40">
            {/* Window Header */}
            <div className="p-4 border-b border-white/5 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-500 border border-white/5 flex items-center justify-center overflow-hidden text-xs font-bold text-white shadow-lg shadow-pink-500/10 shrink-0">
                        {conversation.isGroup ? (
                            conversation.groupImage ? <img src={AuthService.getFileUrl(conversation.groupImage)} className="w-full h-full object-cover" /> : <Users size={16} className="text-white/40" />
                        ) : (
                            otherParticipant?.profilePicture ? (
                                <img 
                                    src={AuthService.getFileUrl(otherParticipant.profilePicture)} 
                                    className="w-full h-full object-cover" 
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML = getInitials(otherParticipant.name);
                                    }}
                                />
                            ) : (
                                getInitials(otherParticipant?.name)
                            )
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                            {conversation.isGroup ? conversation.groupName : otherParticipant?.name?.split(' ')[0]}
                        </h3>
                        <p className="text-[9px] font-mono text-pink-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                            Active Stream
                        </p>
                    </div>
                </div>
                <button className="p-2 hover:bg-white/5 rounded-full text-white/30 hover:text-white transition-all">
                    <MoreVertical size={20} />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {messages.map((msg, index) => {
                    const currentUserId = String(user?.id || user?._id || '');
                    const msgSenderId = String(msg.sender?._id || msg.sender || '');
                    const isOwn = msgSenderId === currentUserId;
                    const prevMsg = messages[index - 1];
                    const prevSenderId = String(prevMsg?.sender?._id || prevMsg?.sender || '');
                    const showHeader = !prevMsg || prevSenderId !== msgSenderId;

                    return (
                        <div key={msg._id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                            {showHeader && !isOwn && (
                                <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-2 ml-1">
                                    {msg.sender?.name?.split(' ')[0]}
                                </p>
                            )}
                            <div className={`max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xl border ${
                                isOwn 
                                ? 'bg-pink-500 text-white rounded-tr-none border-pink-400/20' 
                                : 'bg-white/5 text-white/90 rounded-tl-none border-white/5'
                            }`}>
                                {msg.text && <div>{msg.text}</div>}
                                {msg.file && renderFileAttachment(msg.file)}
                            </div>
                            <p className={`text-[8px] font-mono text-white/20 uppercase mt-1.5 ${isOwn ? 'mr-1' : 'ml-1'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    );
                })}
                {typingUser && (
                    <div className="flex items-center gap-2 text-[9px] font-mono text-pink-400 uppercase tracking-widest animate-pulse">
                        <div className="flex gap-1">
                            <span className="w-1 h-1 bg-pink-500 rounded-full" />
                            <span className="w-1 h-1 bg-pink-500 rounded-full" />
                            <span className="w-1 h-1 bg-pink-500 rounded-full" />
                        </div>
                        Other terminal is typing...
                    </div>
                )}
                {isUploading && (
                    <div className="flex items-center gap-2 text-[8px] font-mono text-pink-500 uppercase tracking-[0.2em] animate-pulse">
                        <Paperclip size={10} />
                        Uploading encrypted asset...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-white/5 relative">
                {/* Emoji Picker Container */}
                <AnimatePresence>
                    {showEmojiPicker && (
                        <motion.div 
                            ref={emojiPickerRef}
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute bottom-full mb-4 left-6 z-50 shadow-2xl border border-white/10 rounded-2xl overflow-hidden"
                        >
                            <EmojiPicker 
                                theme="dark" 
                                onEmojiClick={onEmojiClick}
                                skinTonesDisabled
                                searchPlaceholder="Search data..."
                                width={300}
                                height={400}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="flex gap-4 items-center bg-white/[0.03] border border-white/5 p-2 rounded-2xl focus-within:border-pink-500/30 transition-all">
                    <input 
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <button 
                        type="button" 
                        onClick={handleFileSelect}
                        className="p-2.5 text-white/30 hover:text-white transition-all"
                    >
                        <Paperclip size={20} />
                    </button>
                    <input 
                        type="text"
                        placeholder="Type a secure message..."
                        value={newMessage}
                        onChange={handleTyping}
                        className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-white/20"
                    />
                    <button 
                        type="button" 
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={`p-2.5 transition-all ${showEmojiPicker ? 'text-pink-500' : 'text-white/30 hover:text-white'}`}
                    >
                        <Smile size={20} />
                    </button>
                    <button 
                        type="submit"
                        disabled={!newMessage.trim() && !isUploading}
                        className="p-2.5 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-all disabled:opacity-50 disabled:grayscale"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}
