/**
 * AUTH SERVICE
 * Handles restricted email login, registration, and session persistence
 */

const APPROVED_EMAILS = [
    'admin@airis.tech'
];

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
    isEmailApproved: (email) => {
        return APPROVED_EMAILS.includes(email.toLowerCase().trim());
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
        localStorage.setItem('airis_session', cleanEmail);
        const data = AuthService.getUserData(cleanEmail);
        if (data) localStorage.setItem('airis_last_user', JSON.stringify(data));
    },

    getSession: () => {
        if (_sessionCache === null) {
            _sessionCache = localStorage.getItem('airis_session');
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
        localStorage.removeItem('airis_session');
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

