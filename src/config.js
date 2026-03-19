/**
 * Application Configuration
 * Handles environment-specific variables and constants
 */

const isProduction = import.meta.env.PROD;

export const config = {
    // Vite requires VITE_ prefix for client-side environment variables
    API_BASE_URL: import.meta.env.VITE_API_URL || (isProduction ? '/api' : 'http://localhost:5002/api'),
    GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '532663388476-7iiiepabt72281qja5vehie0qd5egc2q.apps.googleusercontent.com',
    IS_PROD: isProduction,
};

export default config;
