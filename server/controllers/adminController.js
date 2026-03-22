const User = require('../models/User');
const ApprovedEmail = require('../models/ApprovedEmail');

// @desc    Add email to whitelist
// @route   POST /api/admin/approve
// @access  Private/Admin
exports.addApprovedEmail = async (req, res) => {
    try {
        const { email, role, isAdmin } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Please provide an email' });
        }

        const cleanEmail = email.toLowerCase().trim();
        const existing = await ApprovedEmail.findOne({ email: cleanEmail });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email already approved' });
        }

        const approved = await ApprovedEmail.create({
            email: cleanEmail,
            role: role || 'Member',
            isAdmin: isAdmin || false,
            addedBy: req.user.id
        });

        res.status(201).json({
            success: true,
            data: approved
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Remove email from whitelist
// @route   DELETE /api/admin/approve/:email
// @access  Private/Admin
exports.removeApprovedEmail = async (req, res) => {
    try {
        const cleanEmail = req.params.email.toLowerCase().trim();
        const item = await ApprovedEmail.findOne({ email: cleanEmail });
        if (!item) {
            return res.status(404).json({ success: false, message: 'Email not found in whitelist' });
        }

        await item.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get all approved emails
// @route   GET /api/admin/approved
// @access  Private/Admin
exports.getApprovedEmails = async (req, res) => {
    try {
        const emails = await ApprovedEmail.find();

        res.status(200).json({
            success: true,
            count: emails.length,
            data: emails
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get all registered users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password -profilePicture');

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get all pending user approvals
// @route   GET /api/admin/pending
// @access  Private/Admin
exports.getPendingUsers = async (req, res) => {
    try {
        const users = await User.find({ status: 'pending' }).select('-password -profilePicture');

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update user status and role
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
exports.updateUserStatus = async (req, res) => {
    try {
        const { status, role, isAdmin, name } = req.body;
        
        const updates = {};
        if (status) updates.status = status;
        if (role) updates.role = role;
        if (isAdmin !== undefined) updates.isAdmin = isAdmin;
        if (name) updates.name = name;

        const user = await User.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get user profile picture
// @route   GET /api/admin/users/:id/photo
// @access  Private/Admin
exports.getUserPhoto = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: user.profilePicture
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get all users with approved status
// @route   GET /api/admin/history
// @access  Private/Admin
exports.getApprovedUsers = async (req, res) => {
    try {
        const users = await User.find({ status: 'approved' }).select('-password -profilePicture');

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
