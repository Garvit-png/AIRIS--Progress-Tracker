const User = require('../models/User');
const ApprovedEmail = require('../models/ApprovedEmail');
const AdminSettings = require('../models/AdminSettings');

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

        // SYNC: If role is Admin, force isAdmin to true
        let finalIsAdmin = isAdmin || false;
        if (role === 'Admin') {
            finalIsAdmin = true;
        }

        const approved = await ApprovedEmail.create({
            email: cleanEmail,
            role: role || 'Member',
            isAdmin: finalIsAdmin,
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
        
        // SYNC: Also demote any existing registered user to pending
        await User.findOneAndUpdate({ email: cleanEmail }, { status: 'pending' });

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
        const users = await User.find()
            .select('name email role isAdmin status year profilePicture')
            .lean();

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
        const users = await User.find({ status: 'pending' })
            .select('name email role year createdAt')
            .lean();

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
        
        // SYNC: If role is Admin, force isAdmin to true
        if (role === 'Admin') {
            updates.isAdmin = true;
        } else if (isAdmin !== undefined) {
            updates.isAdmin = isAdmin;
        }

        if (name) updates.name = name;

        const user = await User.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // SYNC: If status is being revoked (set to pending or rejected), remove from whitelist
        if (status === 'pending' || status === 'rejected') {
            await ApprovedEmail.deleteOne({ email: user.email.toLowerCase().trim() });
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
        const users = await User.find({ status: 'approved' })
            .select('name email role isAdmin status year profilePicture')
            .lean();

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Check if admin portal password is set
// @route   GET /api/admin/portal-status
// @access  Private/Admin
exports.getPortalStatus = async (req, res) => {
    try {
        const settings = await AdminSettings.findOne();
        res.status(200).json({
            success: true,
            isSet: !!settings
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Set initial admin portal password
// @route   POST /api/admin/portal-setup
// @access  Private/Admin
exports.setupPortalPassword = async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ success: false, message: 'Please provide a password' });
        }

        const existing = await AdminSettings.findOne();
        if (existing) {
            return res.status(400).json({ success: false, message: 'Portal password already set' });
        }

        await AdminSettings.create({ adminPortalPassword: password });

        res.status(201).json({
            success: true,
            message: 'Portal password set successfully'
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Verify admin portal password
// @route   POST /api/admin/portal-verify
// @access  Private/Admin
exports.verifyPortalPassword = async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ success: false, message: 'Please provide a password' });
        }

        const settings = await AdminSettings.findOne();
        if (!settings) {
            return res.status(404).json({ success: false, message: 'Portal password not set yet' });
        }

        const isMatch = await settings.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid portal password' });
        }

        res.status(200).json({
            success: true,
            message: 'Portal unlocked'
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
