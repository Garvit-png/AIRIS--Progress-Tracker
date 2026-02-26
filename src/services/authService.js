/**
 * AUTH SERVICE
 * Handles restricted email login, registration, and session persistence
 */

const APPROVED_EMAILS = [
    'admin@airis.tech',
    'garvit@airis.tech',
    'test@user.com',
    'garvitgandhi0313@gmail.com',
    'test@gmail.com'
];

export const AuthService = {
    isEmailApproved: (email) => {
        return APPROVED_EMAILS.includes(email.toLowerCase().trim());
    },

    // Saves user profile: { password, name, year }
    registerUser: (email, data) => {
        const users = JSON.parse(localStorage.getItem('airis_users') || '{}');
        users[email.toLowerCase().trim()] = {
            password: data.password,
            name: data.name,
            year: data.year,
            registeredAt: new Date().toISOString()
        };
        localStorage.setItem('airis_users', JSON.stringify(users));
    },

    verifyPassword: (email, password) => {
        const users = JSON.parse(localStorage.getItem('airis_users') || '{}');
        const user = users[email.toLowerCase().trim()];
        return user && user.password === password;
    },

    isPasswordSet: (email) => {
        const users = JSON.parse(localStorage.getItem('airis_users') || '{}');
        return !!users[email.toLowerCase().trim()];
    },

    // Returns { name, year, email }
    getUserData: (email) => {
        const users = JSON.parse(localStorage.getItem('airis_users') || '{}');
        const user = users[email.toLowerCase().trim()];
        if (!user) return null;
        return {
            email: email.toLowerCase().trim(),
            name: user.name,
            year: user.year
        };
    },

    setSession: (email) => {
        localStorage.setItem('airis_session', email.toLowerCase().trim());
        const data = AuthService.getUserData(email);
        if (data) localStorage.setItem('airis_last_user', JSON.stringify(data));
    },

    getSession: () => {
        const email = localStorage.getItem('airis_session');
        if (!email) return null;
        return AuthService.getUserData(email);
    },

    getLastUser: () => {
        try {
            const data = localStorage.getItem('airis_last_user');
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    },

    logout: () => {
        localStorage.removeItem('airis_session');
    },

    clearUser: (email) => {
        const users = JSON.parse(localStorage.getItem('airis_users') || '{}');
        delete users[email.toLowerCase().trim()];
        localStorage.setItem('airis_users', JSON.stringify(users));
        localStorage.removeItem('airis_session');
    }
};

if (typeof window !== 'undefined') {
    window.AuthService = AuthService;
}

