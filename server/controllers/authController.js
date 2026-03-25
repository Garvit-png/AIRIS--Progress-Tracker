const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const sendEmail = require('../services/emailService');
const User = require('../models/User');
const ApprovedEmail = require('../models/ApprovedEmail');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, year } = req.body;
        const cleanEmail = email.toLowerCase().trim();

        // Check if user exists
        const userExists = await User.findOne({ email: cleanEmail });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const isAdminEmail = cleanEmail === 'garvitgandhi10313@gmail.com' || cleanEmail === 'garvitgandhi0313@gmail.com';
        const isPreAuth = await ApprovedEmail.findOne({ email: cleanEmail });

        let newRole = 'Member';
        let newStatus = 'pending';
        let newIsAdmin = false;

        if (isAdminEmail) {
            newRole = 'Admin';
            newStatus = 'approved';
            newIsAdmin = true;
        } else if (isPreAuth) {
            newStatus = 'approved';
            if (isPreAuth.role) newRole = isPreAuth.role;
            if (isPreAuth.isAdmin !== undefined) newIsAdmin = isPreAuth.isAdmin;
        }

        const user = await User.create({
            name,
            email: cleanEmail,
            password,
            year,
            role: newRole,
            isAdmin: newIsAdmin,
            status: newStatus,
            isVerified: true // AUTO-VERIFIED FOR NOW
        });

        // Create token
        const token = jwt.sign(
            { 
                userId: user.id, 
                role: user.role, 
                isAdmin: user.isAdmin,
                status: user.status,
                email: user.email 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '30d' }
        );

        res.status(201).json({
            success: true,
            message: 'REGISTRATION RECEIVED. ACCOUNT PENDING APPROVAL.',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isAdmin: user.isAdmin,
                status: user.status
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Verify email
// @route   GET /api/auth/verify/:token
// @access  Public
exports.verifyEmail = async (req, res) => res.status(501).json({ message: 'Not implemented' });

// @desc    Google login
// @route   POST /api/auth/google
// @access  Public
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;
        
        if (!process.env.GOOGLE_CLIENT_ID) {
            console.error('CRITICAL: GOOGLE_CLIENT_ID is missing in environment variables');
            return res.status(500).json({ success: false, message: 'Server configuration error' });
        }

        if (!idToken) {
            return res.status(400).json({ success: false, message: 'Google ID token required' });
        }

        console.log('Google Auth: Attempting verification...');

        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;
        const cleanEmail = email.toLowerCase().trim();

        console.log(`Google Auth Payload: email="${email}", cleanEmail="${cleanEmail}", name="${name}"`);

        // Check if user exists and is pre-authorized in parallel for maximum speed
        const [user, isPreAuth] = await Promise.all([
            User.findOne({ email: cleanEmail }),
            ApprovedEmail.findOne({ email: cleanEmail })
        ]);

        if (!user) {
            const isAdminEmail = cleanEmail === 'garvitgandhi10313@gmail.com' || cleanEmail === 'garvitgandhi0313@gmail.com';

            let newRole = 'Member';
            let newStatus = 'pending';
            let newIsAdmin = false;

            if (isAdminEmail) {
                newRole = 'Admin';
                newStatus = 'approved';
                newIsAdmin = true;
            } else if (isPreAuth) {
                newStatus = 'approved';
                if (isPreAuth.role) newRole = isPreAuth.role;
                if (isPreAuth.isAdmin !== undefined) newIsAdmin = isPreAuth.isAdmin;
            }

            console.log(`Google Auth: Auto-creating log-in user for ${cleanEmail}. Status: ${newStatus}`);
            user = await User.create({
                name: name || 'Google User',
                email: cleanEmail,
                password: crypto.randomBytes(20).toString('hex'), // Dummy password
                role: newRole,
                isAdmin: newIsAdmin,
                status: newStatus,
                isVerified: true,
                googleId,
                profilePicture: picture || ''
            });
        } else {
            // SYNC: If user is pending but is now in the whitelist, auto-approve them
            if (user.status === 'pending' && isPreAuth) {
                user.status = 'approved';
                if (isPreAuth.role) user.role = isPreAuth.role;
                if (isPreAuth.isAdmin !== undefined) user.isAdmin = isPreAuth.isAdmin;
            }
            
            // Link Google ID if it isn't linked yet
            if (!user.googleId) {
                user.googleId = googleId;
            }
            user.profilePicture = user.profilePicture || picture;
            await user.save();
        }

        if (user.status === 'rejected') {
            return res.status(403).json({ success: false, message: 'ACCOUNT ACCESS REJECTED' });
        }

        const token = jwt.sign(
            { 
                userId: user.id, 
                role: user.role, 
                isAdmin: user.isAdmin,
                status: user.status,
                email: user.email 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '30d' }
        );

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
        res.status(401).json({ success: false, message: 'Google authentication failed' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide an email and password' });
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'ACCOUNT NOT FOUND, REGISTER FIRST' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Allow pending users to login so they can see their status in the app
        if (user.status === 'rejected') {
            return res.status(403).json({ success: false, message: 'ACCOUNT ACCESS REJECTED' });
        }

        // Create token
        const token = jwt.sign(
            { 
                userId: user.id, 
                role: user.role, 
                isAdmin: user.isAdmin,
                status: user.status,
                email: user.email 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '30d' }
        );

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
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) throw new Error('User not found');
        
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => res.status(501).json({ message: 'Not implemented' });

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => res.status(501).json({ message: 'Not implemented' });

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
    try {
        const updates = {};
        if (req.body.name) updates.name = req.body.name;
        if (req.body.profilePicture !== undefined) updates.profilePicture = req.body.profilePicture;

        const user = await User.findByIdAndUpdate(req.user.id, updates, {
            new: true,
            runValidators: true
        });

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

// @desc    Find user by email (for starting chats)
// @route   GET /api/auth/users/search/:email
// @access  Private
exports.findUserByEmail = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email.toLowerCase().trim() })
            .select('name email profilePicture');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Search users by name (fuzzy search for starting chats)
// @route   GET /api/auth/users/search-name/:query
// @access  Private
exports.searchUsersByName = async (req, res) => {
    try {
        const query = req.params.query.trim();
        if (!query || query.length < 2) {
            return res.status(200).json({ success: true, users: [] });
        }

        const users = await User.find({
            name: { $regex: query, $options: 'i' },
            status: 'approved',
            _id: { $ne: req.user.id } // Don't find self
        })
        .select('name email profilePicture role')
        .limit(10);

        res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all approved members (for chat discovery)
// @route   GET /api/auth/members
// @access  Private
exports.getApprovedMembers = async (req, res) => {
    try {
        const members = await User.find({
            status: 'approved',
            _id: { $ne: req.user.id } // Don't include self
        })
        .select('name profilePicture role')
        .sort({ name: 1 });

        res.status(200).json({
            success: true,
            members
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
