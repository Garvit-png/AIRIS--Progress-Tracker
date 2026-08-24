/**
 * AIRIS — Frontend Application Config
 * Reads Vite environment variables (VITE_ prefix required).
 * Set values in frontend/.env for local dev.
 *
 * On Vercel: VITE_API_URL is not needed — the app calls its own /api (same origin).
 * On Render (separate backend): set VITE_API_URL=https://your-backend.onrender.com/api
 * Local dev: defaults to http://localhost:5002/api
 */

const isProd = import.meta.env.PROD;

function buildApiUrl() {
  // If explicitly set, always use that value
  if (import.meta.env.VITE_API_URL) {
    const raw = import.meta.env.VITE_API_URL.replace(/\/+$/, '');
    return raw.endsWith('/api') ? raw : `${raw}/api`;
  }

  // In production with no VITE_API_URL set → use same-origin /api
  // This works on Vercel where api/index.js handles /api/* on the same domain
  if (isProd) {
    return '/api';
  }

  // Local dev
  return 'http://localhost:5002/api';
}

export const config = {
  API_BASE_URL: buildApiUrl(),
  GOOGLE_CLIENT_ID:
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '23889302662-jtpfi5t5kigrpllf6p1m6qj49nmrs5at.apps.googleusercontent.com',
  IS_PROD: isProd,
};

export default config;
