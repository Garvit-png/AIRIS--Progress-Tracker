/**
 * AIRIS — Frontend Application Config
 * Reads Vite environment variables (VITE_ prefix required).
 * Set values in frontend/.env for local dev.
 */

const isProd = import.meta.env.PROD;

function buildApiUrl() {
  const raw =
    import.meta.env.VITE_API_URL ||
    (isProd
      ? 'https://airis-progress-tracker.onrender.com/api'
      : 'http://localhost:5002/api');

  const stripped = raw.replace(/\/+$/, '');
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
