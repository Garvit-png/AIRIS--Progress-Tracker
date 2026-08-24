/**
 * AIRIS — Frontend Application Config
 *
 * Reads Vite environment variables (must be prefixed VITE_).
 * Set values in .env for local dev, or in your hosting platform's
 * environment settings for production (Vercel dashboard, etc.).
 *
 * Available vars:
 *   VITE_API_URL          — full backend API base URL, e.g. http://localhost:5002/api
 *   VITE_GOOGLE_CLIENT_ID — Google OAuth client ID
 */

const isProd = import.meta.env.PROD;

// Normalise the API base URL:
//   - strip trailing slash
//   - always end with /api
function buildApiUrl() {
  const raw =
    import.meta.env.VITE_API_URL ||
    (isProd
      ? 'https://airis-progress-tracker.onrender.com/api'
      : 'http://localhost:5002/api');              // ← was 5001, fixed to match server PORT

  const stripped = raw.replace(/\/+$/, '');        // remove any trailing slashes
  return stripped.endsWith('/api') ? stripped : `${stripped}/api`;
}

export const config = {
  API_BASE_URL: buildApiUrl(),

  GOOGLE_CLIENT_ID:
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '532663388476-7iiiepabt72281qja5vehie0qd5egc2q.apps.googleusercontent.com',

  IS_PROD: isProd,
};

export default config;
