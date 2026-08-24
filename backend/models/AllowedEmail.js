const mongoose = require('mongoose');

/**
 * AllowedEmail — the only whitelist that matters.
 * Only emails in this collection can log in via Google.
 * Managed by admins via /api/admin/allowed-emails routes.
 * Seed this manually in MongoDB Atlas or via the admin panel.
 */
const allowedEmailSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    name: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        default: 'Member'
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.AllowedEmail ||
    mongoose.model('AllowedEmail', allowedEmailSchema);
