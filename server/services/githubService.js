const GITHUB_TOKEN = process.env.GITHUB_PAT;

const fetchGitHubAPI = async (endpoint) => {
    const url = `https://api.github.com${endpoint}`;
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'AIRIS-Progress-Tracker-Backend'
        }
    });

    // 202 means GitHub is generating the stats in the background
    if (response.status === 202) {
        return { status: 202, data: null };
    }

    if (!response.ok) {
        throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { status: 200, data };
};

const { cacheGet, cacheSetEx } = require('../config/redis');

exports.getRepoStats = async (owner, repo) => {
    try {
        const slug = `${owner}/${repo}`;
        const cacheKey = `github_stats:${slug}`;

        // 1. Check Redis Cache First
        const cachedData = await cacheGet(cacheKey);
        if (cachedData) {
            console.log(`⚡ Redis Cache Hit: ${cacheKey}`);
            return { status: 200, data: cachedData };
        }

        console.log(`🔌 Fetching from GitHub API: ${slug}`);
        // 2. Fetch from GitHub Concurrent Streams
        const [contribRes, repoRes, langRes] = await Promise.all([
            fetchGitHubAPI(`/repos/${slug}/stats/contributors`),
            fetchGitHubAPI(`/repos/${slug}`),
            fetchGitHubAPI(`/repos/${slug}/languages`)
        ]);

        if (contribRes.status === 202) {
            return { status: 202, message: 'Stats are compiling, try again shortly.' };
        }

        const contribData = contribRes.data;
        const repoData = repoRes.data;
        const langData = langRes.data;

        if (Array.isArray(contribData)) {
            const sorted = [...contribData].sort((a, b) => b.total - a.total);
            
            // Process Language Profile (Top 3)
            const totalBytes = Object.values(langData).reduce((a, b) => a + b, 0);
            const languages = Object.entries(langData)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([name, bytes]) => ({
                    name,
                    percent: Math.round((bytes / totalBytes) * 100)
                }));

            const newStats = {
                totalCommits: contribData.reduce((acc, curr) => acc + curr.total, 0),
                contributors: sorted.map(c => ({
                    login: c.author.login,
                    avatar: c.author.avatar_url,
                    commits: c.total
                })),
                profile: {
                    stars: repoData.stargazers_count,
                    forks: repoData.forks_count,
                    openIssues: repoData.open_issues_count,
                    lastUpdated: repoData.pushed_at,
                    primaryLanguage: repoData.language,
                    languages
                }
            };
            
            // 3. Save to Redis Cache (10 minutes = 600 seconds)
            await cacheSetEx(cacheKey, 600, newStats);

            return { status: 200, data: newStats };
        }

        return { status: 400, message: 'Invalid contributor array received from GitHub' };
    } catch (error) {
        console.error('GitHub Service Error:', error);
        throw error;
    }
};
