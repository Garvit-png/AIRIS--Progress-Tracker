/**
 * Application Configuration
 * Handles environment-specific variables and constants
 */

const isProduction = import.meta.env.PROD;

export const config = {
    // Vite requires VITE_ prefix for client-side environment variables
    API_BASE_URL: import.meta.env.VITE_API_URL || (isProduction ? '/api' : 'http://localhost:5001/api'),
    IS_PROD: isProduction,
};

export default config;
