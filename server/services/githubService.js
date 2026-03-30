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
        const cacheKey = `github_intelligence_v2:${slug}`;

        // 1. Check Redis Cache First
        const cachedData = await cacheGet(cacheKey);
        if (cachedData) {
            console.log(`⚡ Redis Cache Hit: ${cacheKey}`);
            return { status: 200, data: cachedData };
        }

        console.log(`🔌 Fetching from GitHub API: ${slug}`);
        // 2. Fetch from GitHub Concurrent Streams
        const [contribRes, repoRes, langRes, issuesRes, commitsRes] = await Promise.all([
            fetchGitHubAPI(`/repos/${slug}/stats/contributors`),
            fetchGitHubAPI(`/repos/${slug}`),
            fetchGitHubAPI(`/repos/${slug}/languages`),
            fetchGitHubAPI(`/repos/${slug}/issues?state=open`),
            fetchGitHubAPI(`/repos/${slug}/commits?per_page=100`).catch(() => ({ data: [] })) // catch if commits fail for some reason
        ]);

        if (contribRes.status === 202) {
            return { status: 202, message: 'Stats are compiling, try again shortly.' };
        }

        const contribData = contribRes.data;
        const repoData = repoRes.data;
        const langData = langRes.data;
        const issuesData = issuesRes?.data || [];
        const commitsData = commitsRes?.data || [];

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
                
            const enrichedContributors = sorted.map(c => {
                const login = c.author.login;
                
                // Extract assigned active issues for this person
                const assignedIssues = issuesData
                    .filter(issue => issue.assignee?.login === login || issue.assignees?.some(a => a.login === login))
                    .map(issue => ({
                        title: issue.title,
                        url: issue.html_url,
                        number: issue.number
                    }));
                    
                // Extract recent activity context
                const recentActivity = commitsData
                    .filter(commit => commit.author?.login === login)
                    .slice(0, 3) // Give top 3 most recent commits
                    .map(commit => ({
                        message: commit.commit.message.split('\n')[0],
                        date: commit.commit.author.date,
                        url: commit.html_url
                    }));

                return {
                    login: login,
                    avatar: c.author.avatar_url,
                    commits: c.total,
                    activeIssues: assignedIssues,
                    recentActivity: recentActivity
                }
            });

            const newStats = {
                totalCommits: contribData.reduce((acc, curr) => acc + curr.total, 0),
                contributors: enrichedContributors,
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
