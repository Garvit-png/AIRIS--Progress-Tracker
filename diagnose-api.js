const fetch = require('node-fetch');

const BASE_URL = 'https://api.github.com';

const fetchGitHubData = async (username) => {
    console.log('Fetching data for:', username);
    try {
        const profileRes = await fetch(`${BASE_URL}/users/${encodeURIComponent(username)}`);
        if (!profileRes.ok) {
            console.error('Profile Error:', profileRes.status);
            return;
        }
        const profileData = await profileRes.json();
        console.log('Profile Success:', profileData.login);

        const reposRes = await fetch(`${BASE_URL}/users/${encodeURIComponent(username)}/repos?per_page=5`);
        if (reposRes.ok) {
            const repos = await reposRes.json();
            console.log('Repos Success:', Array.isArray(repos) ? repos.length : 'Not an array');
        }

        const eventsRes = await fetch(`${BASE_URL}/users/${encodeURIComponent(username)}/events/public?per_page=5`);
        if (eventsRes.ok) {
            const events = await eventsRes.json();
            console.log('Events Success:', Array.isArray(events) ? events.length : 'Not an array');
        }
    } catch (err) {
        console.error('Network Error:', err.message);
    }
};

const user = process.argv[2] || 'garvit-gandhi';
fetchGitHubData(user);
