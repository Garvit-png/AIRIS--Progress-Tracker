/**
 * Application Configuration
 * Handles environment-specific variables and constants
 */

const isProduction = import.meta.env.PROD;

export const config = {
    // Vite requires VITE_ prefix for client-side environment variables
    API_BASE_URL: (() => {
        const defaultProdUrl = 'https://airis-progress-tracker.onrender.com/api';
        const defaultDevUrl = 'http://localhost:5001/api';
        
        let url = import.meta.env.VITE_API_URL || (isProduction ? defaultProdUrl : defaultDevUrl);
        
        if (url && !url.endsWith('/api') && url.startsWith('http')) {
            url += '/api';
        }
        return url;
    })(),
    GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '532663388476-7iiiepabt72281qja5vehie0qd5egc2q.apps.googleusercontent.com',
    IS_PROD: isProduction,
};

export default config;