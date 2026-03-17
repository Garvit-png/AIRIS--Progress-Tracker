const ApprovedEmail = require('../models/ApprovedEmail');
const User = require('../models/User');

// @desc    Add email to whitelist
// @route   POST /api/admin/approve
// @access  Private/Admin
exports.addApprovedEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Please provide an email' });
        }

        const existing = await ApprovedEmail.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email already approved' });
        }

        const approved = await ApprovedEmail.create({
            email: email.toLowerCase(),
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
        const approved = await ApprovedEmail.findOneAndDelete({ email: req.params.email.toLowerCase() });

        if (!approved) {
            return res.status(404).json({ success: false, message: 'Email not found in whitelist' });
        }

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
        const emails = await ApprovedEmail.find().populate('addedBy', 'name email');

        res.status(200).json({
            success: true,
            count: emails.length,
            data: emails
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
