const User = require('../models/User');
const AllowedEmail = require('../models/AllowedEmail');
const AdminSettings = require('../models/AdminSettings');

// ── AllowedEmail management ───────────────────────────────────

// @desc   List all allowed emails
// @route  GET /api/admin/allowed-emails
exports.getAllowedEmails = async (req, res) => {
    try {
        const list = await AllowedEmail.find().sort({ addedAt: -1 }).lean();
        res.status(200).json({ success: true, count: list.length, data: list });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc   Add an email to the whitelist
// @route  POST /api/admin/allowed-emails
exports.addAllowedEmail = async (req, res) => {
    try {
        const { email, name, role, isAdmin } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

        const clean = email.toLowerCase().trim();
        const existing = await AllowedEmail.findOne({ email: clean });
        if (existing) return res.status(400).json({ success: false, message: 'Email already in whitelist' });

        const entry = await AllowedEmail.create({
            email: clean,
            name: name || '',
            role: role || 'Member',
            isAdmin: role === 'Admin' ? true : (isAdmin || false)
        });

        // If user already registered, ensure they're approved with the right role
        await User.findOneAndUpdate(
            { email: clean },
            { status: 'approved', role: entry.role, isAdmin: entry.isAdmin },
            { new: true }
        );

        res.status(201).json({ success: true, data: entry });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc   Remove an email from the whitelist
// @route  DELETE /api/admin/allowed-emails/:email
exports.removeAllowedEmail = async (req, res) => {
    try {
        const clean = decodeURIComponent(req.params.email).toLowerCase().trim();
        const entry = await AllowedEmail.findOneAndDelete({ email: clean });
        if (!entry) return res.status(404).json({ success: false, message: 'Email not found in whitelist' });

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// ── User management ───────────────────────────────────────────

// @desc   List all registered users
// @route  GET /api/admin/users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('name email role isAdmin status year profilePicture createdAt')
            .lean();
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc   Update a user's role / isAdmin
// @route  PUT /api/admin/users/:id
exports.updateUser = async (req, res) => {
    try {
        const { role, isAdmin, name } = req.body;
        const updates = {};
        if (role)            updates.role    = role;
        if (name)            updates.name    = name;
        if (role === 'Admin') updates.isAdmin = true;
        else if (isAdmin !== undefined) updates.isAdmin = isAdmin;

        const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Keep AllowedEmail in sync
        await AllowedEmail.findOneAndUpdate(
            { email: user.email },
            { role: user.role, isAdmin: user.isAdmin },
            { new: true }
        );

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc   Remove a user entirely
// @route  DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        // Also remove from whitelist
        await AllowedEmail.findOneAndDelete({ email: user.email });
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc   Get user profile picture
// @route  GET /api/admin/users/:id/photo
exports.getUserPhoto = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, data: user.profilePicture });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── Admin portal password ─────────────────────────────────────

exports.getPortalStatus = async (req, res) => {
    try {
        const settings = await AdminSettings.findOne();
        res.status(200).json({ success: true, isSet: !!settings });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.setupPortalPassword = async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) return res.status(400).json({ success: false, message: 'Password required' });
        const existing = await AdminSettings.findOne();
        if (existing) return res.status(400).json({ success: false, message: 'Portal password already set' });
        await AdminSettings.create({ adminPortalPassword: password });
        res.status(201).json({ success: true, message: 'Portal password set' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.verifyPortalPassword = async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) return res.status(400).json({ success: false, message: 'Password required' });
        const settings = await AdminSettings.findOne();
        if (!settings) return res.status(404).json({ success: false, message: 'Portal password not set' });
        const isMatch = await settings.matchPassword(password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid portal password' });
        res.status(200).json({ success: true, message: 'Portal unlocked' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
