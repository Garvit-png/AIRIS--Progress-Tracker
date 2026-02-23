/**
 * GitHub API Service for AIRIS
 * Fetches real-time data for user profiles, stats, and activity.
 */

const BASE_URL = 'https://api.github.com'

const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)
    try {
        const response = await fetch(url, { ...options, signal: controller.signal })
        clearTimeout(id)
        return response
    } catch (err) {
        clearTimeout(id)
        if (err.name === 'AbortError') throw new Error('REQUEST TIMEOUT')
        throw err
    }
}

const mapProfile = (p) => ({
    name: p.name || p.login,
    login: p.login,
    avatar: p.avatar_url,
    followers: p.followers || 0,
    following: p.following || 0,
    publicRepos: p.public_repos || 0,
    bio: p.bio || '',
    location: p.location || 'Unknown',
})

export const fetchGitHubData = async (username) => {
    console.log('[Service] Fetching data for:', username)
    try {
        // 1. Fetch User Profile
        const profileRes = await fetchWithTimeout(`${BASE_URL}/users/${encodeURIComponent(username)}`)
        if (!profileRes.ok) {
            if (profileRes.status === 404) throw new Error('USER NOT FOUND')
            if (profileRes.status === 403) throw new Error('RATE LIMIT EXCEEDED')
            throw new Error('API ERROR')
        }
        const profileData = await profileRes.json()
        const profile = mapProfile(profileData)

        // 2. Fetch Repositories
        let totalStars = 0
        try {
            const reposRes = await fetchWithTimeout(`${BASE_URL}/users/${username}/repos?per_page=100&sort=updated`)
            if (reposRes.ok) {
                const repos = await reposRes.json()
                totalStars = Array.isArray(repos) ? repos.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0) : 0
            }
        } catch (e) {
            console.warn('[Service] Repo fetch failed, continuing with 0 stars')
        }

        // 3. Fetch Recent Events & Calculate Activity Density (Expanded to 90 Days)
        let events = []
        let activityMap = {} // dateString -> count
        const ninetyDaysAgo = new Date()
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

        try {
            // Fetch up to 3 pages to get a dense activity map (max 300 events)
            for (let page = 1; page <= 3; page++) {
                const eventsRes = await fetchWithTimeout(`${BASE_URL}/users/${username}/events/public?per_page=100&page=${page}`)
                if (!eventsRes.ok) break

                const rawEvents = await eventsRes.json()
                if (!Array.isArray(rawEvents) || rawEvents.length === 0) break

                let reachedEnd = false
                rawEvents.forEach(event => {
                    const eventDate = new Date(event.created_at)

                    // Populate activity map for the last 90 days
                    if (eventDate >= ninetyDaysAgo) {
                        const dateKey = eventDate.toISOString().split('T')[0]
                        activityMap[dateKey] = (activityMap[dateKey] || 0) + 1
                    } else {
                        reachedEnd = true
                    }

                    // Map to event list for UI (keep only latest 20 across all pages)
                    if (events.length < 20) {
                        const repoName = event.repo?.name?.split('/')[1] || 'repository'
                        let message = ''
                        switch (event.type) {
                            case 'PushEvent': message = `Pushed ${event.payload?.commits?.length || 1} commit(s) to ${repoName}`; break
                            case 'CreateEvent': message = `Created ${event.payload?.ref_type || 'resource'} in ${repoName}`; break
                            case 'WatchEvent': message = `Starred ${repoName}`; break
                            default: message = `Action in ${repoName}`
                        }
                        events.push({
                            id: event.id,
                            time: eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            message,
                            type: event.type
                        })
                    }
                })

                if (reachedEnd) break
            }
        } catch (e) {
            console.warn('[Service] Events fetch failed')
        }

        return {
            profile,
            stats: {
                totalStars,
                repoCount: profile.publicRepos || 0,
                followers: profile.followers || 0
            },
            events,
            activityData: activityMap
        }
    } catch (err) {
        console.error('[Service] Fetch Error:', err)
        throw err
    }
}
