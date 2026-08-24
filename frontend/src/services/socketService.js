import { io } from 'socket.io-client';
import config from '../config';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.listeners = new Map();
        this.userId = null;
    }

    connect(userId) {
        if (this.socket && this.userId === userId) return this.socket;
        
        this.userId = userId;
        const getSocketUrl = () => {
            const apiBase = config.API_BASE_URL;
            if (apiBase.startsWith('http')) {
                return apiBase.replace(/\/api\/?$/, '');
            }
            return window.location.origin;
        };
        const SOCKET_URL = getSocketUrl();

        console.log('Connecting to Socket Signal at:', SOCKET_URL);

        this.socket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 10,
            reconnectionDelay: 1000
        });

        this.socket.on('connect', () => {
            console.log('Signal Established:', this.socket.id);
            this.isConnected = true;
            this.socket.emit('join_user', userId);
            console.log(`[SIGNAL] Connection identified as: user_${userId}`);
            this._notifyListeners('connection_change', true);
        });

        this.socket.on('disconnect', () => {
            console.warn('Signal Lost');
            this.isConnected = false;
            this._notifyListeners('connection_change', false);
        });

        this.socket.on('receive_message', (msg) => this._notifyListeners('receive_message', msg));
        this.socket.on('user_typing', (data) => this._notifyListeners('user_typing', data));
        this.socket.on('new_conversation', (conv) => this._notifyListeners('new_conversation', conv));

        return this.socket;
    }

    isConnected() {
        return !!this.socket && this.socket.connected;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }

    emit(event, data, callback) {
        if (!this.socket) return;
        this.socket.emit(event, data, callback);
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    }

    _notifyListeners(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(cb => cb(data));
        }
    }
}

export const socketService = new SocketService();
export default socketService;
