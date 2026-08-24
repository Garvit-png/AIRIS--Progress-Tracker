const githubService = require('../services/githubService');

exports.getRepoStats = async (req, res) => {
    try {
        const { owner, repo } = req.params;
        if (!owner || !repo) {
            return res.status(400).json({ success: false, message: 'Repository owner and name are required' });
        }

        const { force } = req.query;
        const result = await githubService.getRepoStats(owner, repo, force === 'true');

        if (result.status === 202) {
            return res.status(202).json({ success: true, message: result.message, data: null });
        }

        if (result.status === 200) {
            return res.status(200).json({ success: true, data: result.data });
        }

        return res.status(400).json({ success: false, message: result.message });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server Error while fetching GitHub stats' });
    }
};
