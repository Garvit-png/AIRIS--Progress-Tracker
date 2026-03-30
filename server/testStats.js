require('dotenv').config({ path: '.env' });
const { getRepoStats } = require('./services/githubService');

(async () => {
    try {
        const stats = await getRepoStats('Garvit-png', 'AIRIS--Progress-Tracker');
        console.dir(stats, { depth: null });
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
})();
