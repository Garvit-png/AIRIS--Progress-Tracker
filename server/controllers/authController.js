const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const sendEmail = require('../services/emailService');
const fileStorageService = require('../services/fileStorageService');

const USERS_FILE = 'users.json';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, year } = req.body;
        const cleanEmail = email.toLowerCase().trim();

        // Check if user exists
        const userExists = await fileStorageService.findItem(USERS_FILE, u => u.email === cleanEmail);
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const isAdminEmail = cleanEmail === 'garvitgandhi10313@gmail.com' || cleanEmail === 'garvitgandhi0313@gmail.com';

        const newUser = {
            name,
            email: cleanEmail,
            password: hashedPassword,
            year,
            role: isAdminEmail ? 'Admin' : 'Member',
            isAdmin: isAdminEmail,
            status: isAdminEmail ? 'approved' : 'pending',
            isVerified: true, // AUTO-VERIFIED FOR NOW
            createdAt: new Date().toISOString()
        };

        const user = await fileStorageService.addItem(USERS_FILE, newUser);

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
            message: 'Registration successful! Identity initialized.',
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
exports.verifyEmail = async (req, res) => res.status(501).json({ message: 'Not implemented in DB-less mode' });

// @desc    Google login
// @route   POST /api/auth/google
// @access  Public
// exports.googleLogin = ... (DISABLED AS REQUESTED)

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide an email and password' });
        }

        const user = await fileStorageService.findItem(USERS_FILE, u => u.email.toLowerCase() === email.toLowerCase());
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
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
        const user = await fileStorageService.findItem(USERS_FILE, u => u.id === req.user.id);
        if (!user) throw new Error('User not found');
        
        const { password, ...userWithoutPassword } = user;
        res.status(200).json({ success: true, user: userWithoutPassword });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => res.status(501).json({ message: 'Not implemented in DB-less mode' });

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => res.status(501).json({ message: 'Not implemented in DB-less mode' });

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
    try {
        const updates = {};
        if (req.body.name) updates.name = req.body.name;
        if (req.body.profilePicture !== undefined) updates.profilePicture = req.body.profilePicture;

        const user = await fileStorageService.updateItem(USERS_FILE, req.user.id, updates);

        res.status(200).json({
            success: true,
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
