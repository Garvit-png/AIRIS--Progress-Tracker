import config from '../config';

const API_URL = `${config.API_BASE_URL}/auth`;
const ADMIN_API_URL = `${config.API_BASE_URL}/admin`;
const TASK_API_URL = `${config.API_BASE_URL}/tasks`;

const safeJson = async (response) => {
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error('SERVER RETURNED NON-JSON RESPONSE:', text.substring(0, 200));
        return { 
            success: false, 
            message: 'SERVER COMMUNICATION FAILED',
            debug: text.substring(0, 100)
        };
    }
};

// Resilient fetch with timeout to prevent infinite hangs
const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        if (error.name === 'AbortError') {
            throw new Error('TIMEOUT: Connection took too long. Server might be waking up.');
        }
        throw error;
    }
};

// Simple persistent cache for instant UI
const cache = {
    get: (key) => {
        try {
            const data = localStorage.getItem(`cache_${key}`);
            return data ? JSON.parse(data) : null;
        } catch { return null; }
    },
    set: (key, value) => {
        try {
            localStorage.setItem(`cache_${key}`, JSON.stringify(value));
        } catch (e) { console.warn('Cache write failed', e); }
    }
};

export const AuthService = {
    cache, // Expose cache for direct use if needed
    // Check if email is approved via backend (for now using the existing mock logic if backend doesn't have it yet, 
    // but the request was to integrate with the new auth system)
    isEmailApproved: async (email) => {
        // This is a legacy function. We now let the backend handle everything during the main login flow.
        return true; 
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

        const data = await safeJson(response);
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        // Store token and user for auto-login
        if (data.token) {
            try {
                localStorage.setItem('token', data.token);
                localStorage.setItem('current_user', JSON.stringify(data.user));
            } catch (storageError) {
                console.warn('LocalStorage quota exceeded, clearing and retrying...', storageError);
                localStorage.clear();
                localStorage.setItem('token', data.token);
                localStorage.setItem('current_user', JSON.stringify(data.user));
            }
        }
        return data;
    },

    login: async (email, password) => {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await safeJson(response);
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Store token and user
        try {
            localStorage.setItem('token', data.token);
            localStorage.setItem('current_user', JSON.stringify(data.user));
        } catch (storageError) {
            console.warn('LocalStorage quota exceeded, clearing and retrying...', storageError);
            localStorage.clear();
            localStorage.setItem('token', data.token);
            localStorage.setItem('current_user', JSON.stringify(data.user));
        }
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

            const data = await safeJson(response);

            if (response.ok) {
                localStorage.setItem('current_user', JSON.stringify(data.user || data));
                return data.user || data;
            } else {
                AuthService.logout();
                return null;
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
            return null;
        }
    },

    getMe: async () => {
        const token = localStorage.getItem('token');
        if (!token) return null;

        const response = await fetch(`${API_URL}/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await safeJson(response);
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch user');
        }
        return data.user || data;
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
        const data = await safeJson(response);
        return data.success ? data.data : [];
    },

    approveEmail: async (email, role, isAdmin) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${ADMIN_API_URL}/approve`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ email, role, isAdmin })
        });
        const data = await safeJson(response);
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    revokeEmail: async (email) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${ADMIN_API_URL}/approve/${email}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await safeJson(response);
        if (!data.success) throw new Error(data.message);
        return true;
    },

    getUserPhoto: async (id) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${ADMIN_API_URL}/users/${id}/photo`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await safeJson(response);
        return data.success ? data.data : '';
    },

    getConversations: async () => {
         const token = localStorage.getItem('token');
         if (!token) return { success: false, message: 'Not authenticated' };
 
         const baseUrl = config.API_BASE_URL.includes('onrender.com') 
             ? config.API_BASE_URL.replace('/api', '') 
             : 'https://airis-backend.onrender.com';
 
         try {
             const response = await fetch(`${baseUrl}/api/chat/conversations`, {
                 headers: { 'Authorization': `Bearer ${token}` }
             });
             return await safeJson(response);
         } catch (error) {
             return { success: false, message: error.message };
         }
     },
 
     getMessages: async (conversationId) => {
         const token = localStorage.getItem('token');
         if (!token) return { success: false, message: 'Not authenticated' };
 
         const baseUrl = config.API_BASE_URL.includes('onrender.com') 
             ? config.API_BASE_URL.replace('/api', '') 
             : 'https://airis-backend.onrender.com';
 
         try {
             const response = await fetch(`${baseUrl}/api/chat/messages/${conversationId}`, {
                 headers: { 'Authorization': `Bearer ${token}` }
             });
             return await safeJson(response);
         } catch (error) {
             return { success: false, message: error.message };
         }
     },
 
     getMembers: async () => {
        const token = localStorage.getItem('token');
        if (!token) return { success: false, message: 'Not authenticated' };

        try {
            const response = await fetch(`${API_URL}/members`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await safeJson(response);
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    getUsers: async () => {
        const token = localStorage.getItem('token');
        const response = await fetchWithTimeout(`${ADMIN_API_URL}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        }, 12000); // 12s timeout for large user lists
        const data = await safeJson(response);
        if (data.success) {
            cache.set('users', data.data);
            return data.data;
        }
        return data.success ? data.data : [];
    },

    getPendingUsers: async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${ADMIN_API_URL}/pending`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await safeJson(response);
        return data.success ? data.data : [];
    },

    getApprovedUsers: async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${ADMIN_API_URL}/history`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await safeJson(response);
        return data.success ? data.data : [];
    },

    updateUserStatus: async (userId, status, role, isAdmin, name) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${ADMIN_API_URL}/users/${userId}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ status, role, isAdmin, name })
        });
        const data = await safeJson(response);
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    forgotPassword: async (email) => {
        const response = await fetch(`${API_URL}/forgotpassword`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await safeJson(response);
        if (!response.ok) throw new Error(data.message || 'Failed to send reset email');
        return data;
    },

    resetPassword: async (token, password) => {
        const response = await fetch(`${API_URL}/resetpassword/${token}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });
        const data = await safeJson(response);
        if (!response.ok) throw new Error(data.message || 'Failed to reset password');
        return data;
    },

    verifyEmail: async (token) => {
        const response = await fetch(`${API_URL}/verify/${token}`);
        const data = await safeJson(response);
        if (!response.ok) throw new Error(data.message || 'Verification failed');
        return data;
    },

    googleLogin: async (idToken) => {
        const response = await fetch(`${API_URL}/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken })
        });

        const data = await safeJson(response);

        if (!response.ok) {
            throw new Error(data.message || 'Google login failed');
        }

        // Store token and user
        try {
            localStorage.setItem('token', data.token);
            localStorage.setItem('current_user', JSON.stringify(data.user));
        } catch (storageError) {
            console.warn('LocalStorage quota exceeded, clearing and retrying...', storageError);
            localStorage.clear();
            localStorage.setItem('token', data.token);
            localStorage.setItem('current_user', JSON.stringify(data.user));
        }
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

        const data = await safeJson(response);

        if (!response.ok) {
            throw new Error(data.message || 'Profile update failed');
        }

        // Update local storage
        try {
            localStorage.setItem('current_user', JSON.stringify(data.user));
        } catch (storageError) {
            console.warn('LocalStorage quota exceeded, clearing and retrying...', storageError);
            localStorage.clear();
            localStorage.setItem('current_user', JSON.stringify(data.user));
        }
        return data.user;
    },

    // Task Management
    sendTask: async (taskData, file) => {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        
        // Append task metadata
        Object.keys(taskData).forEach(key => {
            formData.append(key, taskData[key]);
        });
        
        // Append file if exists
        if (file) {
            formData.append('file', file);
        }

        const response = await fetch(`${TASK_API_URL}/send`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}` 
            },
            body: formData
        });
        const data = await safeJson(response);
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    getMyTasks: async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${TASK_API_URL}/my-tasks`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await safeJson(response);
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    getAllTasks: async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${TASK_API_URL}/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await safeJson(response);
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    updateTaskStatus: async (taskId, status) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${TASK_API_URL}/${taskId}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ status })
        });
        const data = await safeJson(response);
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    getAttachmentUrl: (path) => {
        if (!path) return '';
        // Use relative path which will be proxied by Vite in dev 
        // or served by the same origin in production.
        return path;
    },

    // Admin Portal Password Management
    getPortalStatus: async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${ADMIN_API_URL}/portal-status`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await safeJson(response);
        return data; // returns { success, isSet }
    },

    setupPortalPassword: async (password) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${ADMIN_API_URL}/portal-setup`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ password })
        });
        const data = await safeJson(response);
        if (!data.success) throw new Error(data.message);
        return data;
    },

    verifyPortalPassword: async (password) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${ADMIN_API_URL}/portal-verify`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ password })
        });
        const data = await safeJson(response);
        if (!data.success) throw new Error(data.message);
        return data;
    },

    // Group Management
    getGroups: async () => {
        const token = localStorage.getItem('token');
        const response = await fetchWithTimeout(`${config.API_BASE_URL}/groups`, {
            headers: { 'Authorization': `Bearer ${token}` }
        }, 10000); // 10s timeout
        const data = await safeJson(response);
        if (data.success) {
            cache.set('groups', data.data);
            return data.data;
        }
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    createGroup: async (groupData) => {
        const token = localStorage.getItem('token');
        const response = await fetchWithTimeout(`${config.API_BASE_URL}/groups`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(groupData)
        }, 12000); // 12s timeout for creation
        const data = await safeJson(response);
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    updateGroup: async (groupId, groupData) => {
        const token = localStorage.getItem('token');
        const response = await fetchWithTimeout(`${config.API_BASE_URL}/groups/${groupId}`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(groupData)
        }, 10000);
        const data = await safeJson(response);
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    deleteGroup: async (groupId) => {
        const token = localStorage.getItem('token');
        const response = await fetchWithTimeout(`${config.API_BASE_URL}/groups/${groupId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        }, 10000);
        const data = await safeJson(response);
        if (!data.success) throw new Error(data.message);
        return true;
    },

    assignGroupTask: async (groupId, taskData) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}/groups/${groupId}/tasks`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(taskData)
        });
        const data = await safeJson(response);
        if (!data.success) throw new Error(data.message);
        return data.message;
    },

    /**
     * Helper to get full URL for uploaded files
     */
    getFileUrl: (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        
        // Base backend URL (without /api)
        const getBaseUrl = () => {
            const apiBase = config.API_BASE_URL;
            if (apiBase.startsWith('http')) {
                return apiBase.replace(/\/api\/?$/, '');
            }
            return window.location.origin;
        };
        const baseUrl = getBaseUrl();
            
        // Ensure path starts with /uploads/ if it's a relative asset
        let cleanPath = path.startsWith('/') ? path : `/${path}`;
        if (!cleanPath.startsWith('/uploads/') && !cleanPath.startsWith('/static/')) {
            cleanPath = `/uploads${cleanPath}`;
        }
            
        return `${baseUrl}${cleanPath}`;
    }
};

if (typeof window !== 'undefined') {
    window.AuthService = AuthService;
}

