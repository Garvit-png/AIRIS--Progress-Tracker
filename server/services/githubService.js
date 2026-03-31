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

exports.getRepoStats = async (owner, repo, force = false) => {
    try {
        const slug = `${owner}/${repo}`;
        const cacheKey = `github_intelligence_v2:${slug}`;

        // 1. Check Redis Cache (unless force refresh is active)
        if (!force) {
            const cachedData = await cacheGet(cacheKey);
            if (cachedData) {
                console.log(`⚡ Redis Cache Hit: ${cacheKey}`);
                return { status: 200, data: cachedData };
            }
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

        const repoData = repoRes.data || {};
        const defaultBranch = repoData.default_branch || 'main';

        // 2b. If we didn't get commits yet or want to be specific, we could re-fetch, 
        // but for speed we'll assume the initial concurrent fetch got the default branch.
        // If the user pushed to a DIFFERENT branch, we'd need a branch selector (future feature).
        
        const contribData = Array.isArray(contribRes.data) ? contribRes.data : [];
        const langData = langRes.data || {};
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
            const rawLogin = commit.author?.login;
            const rawName = commit.commit.author.name;
            const rawEmail = commit.commit.author.email;
            
            let targetContributor = null;
            
            // 1. Precise Match by Login
            if (rawLogin) {
                targetContributor = contributorMap.get(normalizeKey(rawLogin));
            }
            
            // 2. Fuzzy Match by Name or Email Prefix if not found by login
            if (!targetContributor && (rawName || rawEmail)) {
                const normName = normalizeKey(rawName);
                const normEmailPrefix = rawEmail ? normalizeKey(rawEmail.split('@')[0]) : '';
                
                // Search existing contributors for a name/login match
                for (const [login, data] of contributorMap.entries()) {
                    if (login === normName || login === normEmailPrefix || login.includes(normName) || normName.includes(login)) {
                        targetContributor = data;
                        break;
                    }
                }
            }
            
            // 3. Fallback: Create new entry if still not found
            if (!targetContributor) {
                const identifier = rawLogin || rawName || rawEmail || 'Unknown';
                const lookupKey = normalizeKey(identifier);
                
                if (!contributorMap.has(lookupKey)) {
                    contributorMap.set(lookupKey, {
                        login: identifier,
                        avatar: commit.author?.avatar_url || 'https://github.com/identicons/user.png',
                        commits: 0,
                        activeIssues: [],
                        recentActivity: []
                    });
                }
                targetContributor = contributorMap.get(lookupKey);
            }

            // Increment base count for new contributors only
            const isKnown = contribData.some(cached => {
                const cLogin = normalizeKey(cached.author.login);
                return cLogin === normalizeKey(rawLogin) || cLogin === normalizeKey(rawName);
            });
            
            if (!isKnown && targetContributor.recentActivity.length === 1) {
                targetContributor.commits += 1;
            }

            // Populate recent activity
            targetContributor.recentActivity.push({
                message: commit.commit.message.split('\n')[0],
                date: commit.commit.author.date,
                url: commit.html_url
            });
        });

        const activeContributors = Array.from(contributorMap.values()).map(c => {
            // REAL-TIME SYNC: Force commit count to be at least the number of recent commits discovered
            // This fixes the stale stats API from GitHub (e.g. showing 14 when we see 18 in recent log)
            if (c.recentActivity.length > c.commits) {
                c.commits = c.recentActivity.length;
            }
            return c;
        });

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
                languages,
                contributors: enrichedContributors // Added for UI count
            }
        };
            
        // 3. Save to Redis Cache (Strict 10s TTL for "Instant" feel)
        await cacheSetEx(cacheKey, 10, newStats);

        return { status: 200, data: newStats };
    } catch (error) {
        console.error('GitHub Service Error:', error);
        throw error;
    }
};
