const User = require('../models/User');
const ApprovedEmail = require('../models/ApprovedEmail');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../services/emailService');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, year } = req.body;
        const cleanEmail = email.toLowerCase().trim();

        // Check if email is in ApprovedEmail collection
        const isApproved = await ApprovedEmail.findOne({ email: cleanEmail });
        
        // TEMPORARY: Allow garvitgandhi0313@gmail.com to register as admin even if not in list yet
        const isAdminEmail = cleanEmail === 'garvitgandhi0313@gmail.com';
        
        if (!isApproved && !isAdminEmail) {
            return res.status(403).json({ 
                success: false, 
                message: 'ACCESS DENIED: EMAIL NOT AUTHORIZED' 
            });
        }

        // Check if user exists
        const userExists = await User.findOne({ email: cleanEmail });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Create user (unverified)
        const verificationToken = crypto.randomBytes(20).toString('hex');
        
        await User.create({
            name,
            email: cleanEmail,
            password,
            year,
            role: isAdminEmail ? 'admin' : 'member',
            verificationToken,
            isVerified: false
        });

        // Create verification url
        const verificationUrl = `${req.protocol}://${req.get('host')}/verify-email/${verificationToken}`;
        
        const message = `Welcome to AIRIS! Please verify your email by clicking the link: ${verificationUrl}`;
        const html = `
            <h1>Welcome to AIRIS</h1>
            <p>Please click the button below to finish your registration:</p>
            <a href="${verificationUrl}" style="background: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
        `;

        try {
            await sendEmail({
                email: cleanEmail,
                subject: 'AIRIS Email Verification',
                message,
                html
            });

            res.status(201).json({
                success: true,
                message: 'Verification email sent'
            });
        } catch (err) {
            // If email fails, delete the user so they can try again
            await User.deleteOne({ email: cleanEmail });
            return res.status(500).json({ success: false, message: 'Email could not be sent' });
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Verify email
// @route   GET /api/auth/verify/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
    try {
        const user = await User.findOne({ verificationToken: req.params.token });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid verification token' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Email verified successfully. You can now login.'
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Google login
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = async (req, res, next) => {
    try {
        console.log('Google Login Request Received');
        const { idToken } = req.body;
        console.log('Verifying Token:', idToken ? 'Token present' : 'Token missing');
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const { name, email, sub: googleId } = ticket.getPayload();
        console.log('Token Verified for:', email);

        let user = await User.findOne({ email });

        if (user) {
            // Link googleId if not linked
            if (!user.googleId) {
                user.googleId = googleId;
                user.isVerified = true; // Google emails are verified
                await user.save();
            }
        } else {
            // New user via Google
            const cleanEmail = email.toLowerCase().trim();
            const isApproved = await ApprovedEmail.findOne({ email: cleanEmail });
            const isAdminEmail = cleanEmail === 'garvitgandhi0313@gmail.com';

            if (!isApproved && !isAdminEmail) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'ACCESS DENIED: EMAIL NOT AUTHORIZED' 
                });
            }

            user = await User.create({
                name,
                email: cleanEmail,
                googleId,
                isVerified: true,
                password: crypto.randomBytes(16).toString('hex') // Random password for OAuth users
            });
        }

        // Create token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
        console.log('Google Login Successful');
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide an email and password' });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(401).json({ success: false, message: 'Please verify your email to login' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
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

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'There is no user with that email' });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

        // Create reset url
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please click the link below to reset your password: \n\n ${resetUrl}`;
        const html = `
            <h1>Password Reset Request</h1>
            <p>Please click the button below to reset your password:</p>
            <a href="${resetUrl}" style="background: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p>If you did not request this, please ignore this email.</p>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Request',
                message,
                html
            });

            res.status(200).json({
                success: true,
                message: 'Email sent'
            });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ success: false, message: 'Email could not be sent' });
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid token' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful'
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
