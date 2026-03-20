const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const sendEmail = require('../services/emailService');
const User = require('../models/User');

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

        const user = await User.create({
            name,
            email: cleanEmail,
            password,
            year,
            role: isAdminEmail ? 'Admin' : 'Member',
            isAdmin: isAdminEmail,
            status: isAdminEmail ? 'approved' : 'pending',
            isVerified: true // AUTO-VERIFIED FOR NOW
        });

        // Create token
        const token = jwt.sign(
            { 
                userId: user.id, 
                role: user.role, 
                isAdmin: user.isAdmin,
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
        if (!idToken) {
            return res.status(400).json({ success: false, message: 'Google ID token required' });
        }

        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const { email, name, picture } = ticket.getPayload();
        const cleanEmail = email.toLowerCase().trim();

        // Check if user exists
        let user = await User.findOne({ email: cleanEmail });

        if (!user) {
            console.log(`Google Auth: User not found for email ${cleanEmail}`);
            return res.status(404).json({ 
                success: false, 
                message: 'GMAIL NOT CONNECTED, REGISTER FIRST',
                code: 'USER_NOT_FOUND',
                email: cleanEmail,
                name: name
            });
        }

        if (user.status === 'rejected') {
            return res.status(403).json({ success: false, message: 'ACCOUNT ACCESS REJECTED' });
        }

        // Create token
        const token = jwt.sign(
            { 
                userId: user.id, 
                role: user.role, 
                isAdmin: user.isAdmin,
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
