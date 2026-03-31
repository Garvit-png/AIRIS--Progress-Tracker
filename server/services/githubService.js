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

        const contribData = Array.isArray(contribRes.data) ? contribRes.data : [];
        const repoData = repoRes.data;
        const langData = langRes.data;
        const issuesData = issuesRes?.data || [];
        const commitsData = commitsRes?.data || [];

        // Identify true last updated from newest commit or fallback to repo pushed_at
        const trueLastUpdated = commitsData.length > 0 && commitsData[0].commit?.author?.date 
            ? commitsData[0].commit.author.date 
            : repoData.pushed_at;

        // Helper to normalize keys (case-insensitive and trimmed)
        const normalizeKey = (key) => (key ? String(key).toLowerCase().trim() : '');

        // Build base map of contributors from stats/contributors
        const contributorMap = new Map();
        contribData.forEach(c => {
            const normalizedLogin = normalizeKey(c.author.login);
            contributorMap.set(normalizedLogin, {
                login: c.author.login,
                avatar: c.author.avatar_url,
                commits: c.total,
                activeIssues: [],
                recentActivity: []
            });
        });

        // Inject real-time commits to augment stale counts or add missing users
        commitsData.forEach(commit => {
            // Find author login or fallback to git name/email. Prefer GitHub's login if linked.
            const rawIdentifier = commit.author?.login || commit.commit.author.name || commit.commit.author.email;
            const lookupKey = normalizeKey(rawIdentifier);
            const avatar = commit.author?.avatar_url || 'https://github.com/identicons/user.png';
            
            if (!contributorMap.has(lookupKey)) {
                // First time seeing this contributor (meaning GitHub stats hasn't cached them yet)
                contributorMap.set(lookupKey, {
                    login: rawIdentifier,
                    avatar: avatar,
                    commits: 0,
                    activeIssues: [],
                    recentActivity: []
                });
            }

            const c = contributorMap.get(lookupKey);
            
            // Only increment if they weren't in the base cache at all
            if (!contribData.some(cached => normalizeKey(cached.author.login) === lookupKey)) {
                c.commits += 1;
            }

            // Populate recent activity (ALL fetched commits)
            c.recentActivity.push({
                message: commit.commit.message.split('\n')[0],
                date: commit.commit.author.date,
                url: commit.html_url
            });
        });

        const activeContributors = Array.from(contributorMap.values());

        // Process Language Profile (Top 3)
        const totalBytes = Object.values(langData).reduce((a, b) => a + b, 0);
        const languages = Object.entries(langData)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([name, bytes]) => ({
                name,
                percent: Math.round((bytes / totalBytes) * 100)
            }));
            
        const enrichedContributors = activeContributors.map(c => {
            const login = c.login;
            
            // Extract assigned active issues for this person
            c.activeIssues = issuesData
                .filter(issue => issue.assignee?.login === login || issue.assignees?.some(a => a.login === login))
                .map(issue => ({
                    title: issue.title,
                    url: issue.html_url,
                    number: issue.number
                }));
                
            return c;
        });

        // Sort by commits
        enrichedContributors.sort((a, b) => b.commits - a.commits);

        // Recalculate total
        const finalTotalCommits = enrichedContributors.reduce((acc, curr) => acc + curr.commits, 0) || contribData.reduce((acc, curr) => acc + curr.total, 0);

        const newStats = {
            totalCommits: finalTotalCommits,
            contributors: enrichedContributors,
            profile: {
                stars: repoData.stargazers_count,
                forks: repoData.forks_count,
                openIssues: repoData.open_issues_count,
                lastUpdated: trueLastUpdated,
                primaryLanguage: repoData.language,
                languages
            }
        };
            
        // 3. Save to Redis Cache (1 minute = 60 seconds)
        await cacheSetEx(cacheKey, 60, newStats);

        return { status: 200, data: newStats };
    } catch (error) {
        console.error('GitHub Service Error:', error);
        throw error;
    }
};
