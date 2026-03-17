/**
 * AUTH SERVICE
 * Handles restricted email login, registration, and session persistence
 */

// Mock API endpoint for approved emails
const APPROVED_EMAILS_API = 'https://api.airis.tech/approved-emails';

let _usersCache = null;
let _sessionCache = null;

const getCachedUsers = () => {
    if (!_usersCache) {
        try {
            _usersCache = JSON.parse(localStorage.getItem('airis_users') || '{}');
        } catch {
            _usersCache = {};
        }
    }
    return _usersCache;
};

const saveUsers = (users) => {
    _usersCache = users;
    localStorage.setItem('airis_users', JSON.stringify(users));
};

export const AuthService = {
    // In a real app, this would be an async call to an API
    getApprovedEmails: async () => {
        try {
            // Simulating API call
            // const response = await fetch(APPROVED_EMAILS_API);
            // const data = await response.json();
            // return data.emails;
            
            // For now, returning a mock list
            return [
                'admin@airis.tech',
                'garvitgandhi0313@gmail.com',
                'member@airis.tech'
            ];
        } catch (error) {
            console.error('Failed to fetch approved emails:', error);
            return [];
        }
    },

    isEmailApproved: async (email) => {
        const approvedEmails = await AuthService.getApprovedEmails();
        return approvedEmails.some(e => e.toLowerCase() === email.toLowerCase().trim());
    },

    // Saves user profile: { password, name, year }
    registerUser: (email, data) => {
        const users = getCachedUsers();
        users[email.toLowerCase().trim()] = {
            password: data.password,
            name: data.name,
            year: data.year,
            registeredAt: new Date().toISOString()
        };
        saveUsers(users);
    },

    verifyPassword: (email, password) => {
        const users = getCachedUsers();
        const user = users[email.toLowerCase().trim()];
        return user && user.password === password;
    },

    isPasswordSet: (email) => {
        const users = getCachedUsers();
        return !!users[email.toLowerCase().trim()];
    },

    // Returns { name, year, email }
    getUserData: (email) => {
        if (!email) return null;
        const users = getCachedUsers();
        const user = users[email.toLowerCase().trim()];
        if (!user) return null;
        return {
            email: email.toLowerCase().trim(),
            name: user.name,
            year: user.year
        };
    },

    setSession: (email) => {
        const cleanEmail = email.toLowerCase().trim();
        _sessionCache = cleanEmail;
        localStorage.setItem('current_user', cleanEmail);
        const data = AuthService.getUserData(cleanEmail);
        if (data) localStorage.setItem('airis_last_user', JSON.stringify(data));
    },

    getSession: () => {
        if (_sessionCache === null) {
            _sessionCache = localStorage.getItem('current_user');
        }
        if (!_sessionCache) return null;
        return AuthService.getUserData(_sessionCache);
    },

    getLastUser: () => {
        try {
            const data = localStorage.getItem('airis_last_user');
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    },

    logout: () => {
        _sessionCache = '';
        localStorage.removeItem('current_user');
    },

    clearUser: (email) => {
        const users = getCachedUsers();
        delete users[email.toLowerCase().trim()];
        saveUsers(users);
        AuthService.logout();
    }
};

if (typeof window !== 'undefined') {
    window.AuthService = AuthService;
}

