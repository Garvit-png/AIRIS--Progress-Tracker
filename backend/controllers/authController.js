const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const AllowedEmail = require('../models/AllowedEmail');

// ── Domain + whitelist helpers ────────────────────────────────
const ALLOWED_DOMAIN = process.env.ALLOWED_DOMAIN || 'nst.rishihood.edu.in';

// Hard admin override — these bypass whitelist checks
const ADMIN_EMAILS = [
    'garvitgandhi10313@gmail.com',
    'garvitgandhi0313@gmail.com'
];

const isDomainAllowed = (email) =>
    ADMIN_EMAILS.includes(email) || email.endsWith(`@${ALLOWED_DOMAIN}`);

// ── Token helper ──────────────────────────────────────────────
const signToken = (user) =>
    jwt.sign(
        { userId: user.id, role: user.role, isAdmin: user.isAdmin, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );

// ── Google Login ──────────────────────────────────────────────
// @route  POST /api/auth/google
// @access Public
const oauthClient = new OAuth2Client();

exports.googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) return res.status(400).json({ success: false, message: 'ID token required' });

        const googleClientId = process.env.GOOGLE_CLIENT_ID;
        if (!googleClientId) {
            console.error('GOOGLE_CLIENT_ID env var is missing');
            return res.status(500).json({ success: false, message: 'Server misconfiguration: GOOGLE_CLIENT_ID missing' });
        }

        const ticket = await oauthClient.verifyIdToken({ idToken, audience: googleClientId });
        const { email, name, picture, sub: googleId } = ticket.getPayload();
        const cleanEmail = email.toLowerCase().trim();

        // 1. Domain check first (fast reject)
        if (!isDomainAllowed(cleanEmail)) {
            return res.status(403).json({
                success: false,
                message: `Access restricted to @${ALLOWED_DOMAIN} accounts only.`
            });
        }

        // 2. Whitelist check — must be in AllowedEmail (admin overrides bypass this)
        const isAdmin = ADMIN_EMAILS.includes(cleanEmail);
        if (!isAdmin) {
            const allowed = await AllowedEmail.findOne({ email: cleanEmail });
            if (!allowed) {
                return res.status(403).json({
                    success: false,
                    message: 'Your email is not on the access list. Contact your admin.'
                });
            }
        }

        // 3. Find or create user — always approved
        let user = await User.findOne({ email: cleanEmail });

        if (!user) {
            const allowedEntry = await AllowedEmail.findOne({ email: cleanEmail });
            user = await User.create({
                name: name || 'NSTRU Member',
                email: cleanEmail,
                password: crypto.randomBytes(32).toString('hex'),
                role: isAdmin ? 'Admin' : (allowedEntry?.role || 'Member'),
                isAdmin,
                status: 'approved',
                isVerified: true,
                googleId,
                profilePicture: picture || ''
            });
        } else {
            // Update on each login
            if (!user.googleId) user.googleId = googleId;
            user.profilePicture = user.profilePicture || picture;
            user.status = 'approved'; // Always ensure approved
            if (isAdmin) user.isAdmin = true;
            await user.save();
        }

        const token = signToken(user);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isAdmin: user.isAdmin,
                status: user.status,
                profilePicture: user.profilePicture || picture
            }
        });
    } catch (error) {
        console.error('Google Auth Error:', error.message);
        res.status(401).json({ success: false, message: `Google authentication failed: ${error.message}` });
    }
};

// ── Get current user ──────────────────────────────────────────
// @route  GET /api/auth/me
// @access Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).lean();
        if (!user) throw new Error('User not found');
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ── Update profile ────────────────────────────────────────────
// @route  PUT /api/auth/profile
// @access Private
exports.updateProfile = async (req, res) => {
    try {
        const updates = {};
        if (req.body.name) updates.name = req.body.name;
        if (req.body.profilePicture !== undefined) updates.profilePicture = req.body.profilePicture;

        const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isAdmin: user.isAdmin,
                status: user.status,
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ── Find user by email (chat) ─────────────────────────────────
// @route  GET /api/auth/users/search/:email
// @access Private
exports.findUserByEmail = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email.toLowerCase().trim() })
            .select('name email profilePicture').lean();
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── Search users by name (chat) ───────────────────────────────
// @route  GET /api/auth/users/search-name/:query
// @access Private
exports.searchUsersByName = async (req, res) => {
    try {
        const query = req.params.query.trim();
        if (!query || query.length < 2) return res.status(200).json({ success: true, users: [] });

        const tokens = query.split(/\s+/).filter(t => t.length > 0);
        const users = await User.find({
            $and: tokens.map(t => ({ name: { $regex: t, $options: 'i' } })),
            status: 'approved',
            _id: { $ne: req.user.id }
        }).select('name email profilePicture role').limit(10).lean();

        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── Get approved members (chat discovery) ────────────────────
// @route  GET /api/auth/members
// @access Private
exports.getApprovedMembers = async (req, res) => {
    try {
        const members = await User.find({
            status: 'approved',
            _id: { $ne: req.user._id || req.user.id }
        }).select('name profilePicture role').sort({ name: 1 }).lean();

        res.status(200).json({ success: true, members });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── Stubs (not used but routes still registered) ─────────────
exports.register       = (req, res) => res.status(410).json({ success: false, message: 'Registration via password is disabled. Use Google Sign-In.' });
exports.login          = (req, res) => res.status(410).json({ success: false, message: 'Password login is disabled. Use Google Sign-In.' });
exports.forgotPassword = (req, res) => res.status(410).json({ success: false, message: 'Not available.' });
exports.resetPassword  = (req, res) => res.status(410).json({ success: false, message: 'Not available.' });
exports.verifyEmail    = (req, res) => res.status(410).json({ success: false, message: 'Not available.' });
