import config from '../config';

const API_URL = `${config.API_BASE_URL}/auth`;
const ADMIN_API_URL = `${config.API_BASE_URL}/admin`;

export const AuthService = {
    // Check if email is approved via backend (for now using the existing mock logic if backend doesn't have it yet, 
    // but the request was to integrate with the new auth system)
    isEmailApproved: async (email) => {
        // In this specific flow, we check if password is set on backend effectively by trying to login or register
        // But for the "Register if not exists" flow, we might need a dedicated check or just handle it in the flow
        const approvedEmails = [
            'admin@airis.tech',
            'garvitgandhi0313@gmail.com',
            'member@airis.tech',
            'garvit@email.com'
        ];
        return approvedEmails.some(e => e.toLowerCase() === email.toLowerCase().trim());
    },

    // Check if email has a password set (exists in DB)
    isPasswordSet: async (email) => {
        try {
            // We'll use a trick: try to login with a fake password or add a check endpoint
            // For now, let's assume we check via the login attempt or a specific "exists" logic
            // Since the user asked to update LoginPage to call backend, we'll handle step logic there
            return true; // Default to true to trigger password step, handled by 401/404 later
        } catch (error) {
            return false;
        }
    },

    register: async (name, email, password, year) => {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, year })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }
        return data;
    },

    login: async (email, password) => {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Store token and user
        localStorage.setItem('token', data.token);
        localStorage.setItem('current_user', JSON.stringify(data.user));
        return data;
    },

    getCurrentUser: async () => {
        const token = localStorage.getItem('token');
        if (!token) return null;

        try {
            const response = await fetch(`${API_URL}/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('current_user', JSON.stringify(data.user));
                return data.user;
            } else {
                AuthService.logout();
                return null;
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
            return null;
        }
    },

    getSession: () => {
        const user = localStorage.getItem('current_user');
        try {
            return user ? JSON.parse(user) : null;
        } catch {
            return null;
        }
    },

    getToken: () => {
        return localStorage.getItem('token');
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('current_user');
        window.location.href = '/login';
    },

    getApprovedEmails: async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${ADMIN_API_URL}/approved`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        return data.success ? data.data : [];
    },

    approveEmail: async (email) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${ADMIN_API_URL}/approve`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    revokeEmail: async (email) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${ADMIN_API_URL}/approve/${email}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);
        return true;
    },

    getUsers: async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${ADMIN_API_URL}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        return data.success ? data.data : [];
    },

    getUserPhoto: async (userId) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${ADMIN_API_URL}/users/${userId}/photo`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        return data.success ? data.data : null;
    },

    getPendingUsers: async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${ADMIN_API_URL}/pending`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        return data.success ? data.data : [];
    },

    updateUserStatus: async (userId, status, role) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${ADMIN_API_URL}/users/${userId}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ status, role })
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    forgotPassword: async (email) => {
        const response = await fetch(`${API_URL}/forgotpassword`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to send reset email');
        return data;
    },

    resetPassword: async (token, password) => {
        const response = await fetch(`${API_URL}/resetpassword/${token}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to reset password');
        return data;
    },

    verifyEmail: async (token) => {
        const response = await fetch(`${API_URL}/verify/${token}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Verification failed');
        return data;
    },

    googleLogin: async (idToken) => {
        const response = await fetch(`${API_URL}/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Google login failed');
        }

        // Store token and user
        localStorage.setItem('token', data.token);
        localStorage.setItem('current_user', JSON.stringify(data.user));
        return data;
    },

    updateProfile: async (profileData) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/profile`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(profileData)
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Profile update failed');
        }

        // Update local storage
        localStorage.setItem('current_user', JSON.stringify(data.user));
        return data.user;
    }
};

if (typeof window !== 'undefined') {
    window.AuthService = AuthService;
}

