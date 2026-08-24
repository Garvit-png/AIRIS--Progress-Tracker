const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSettingsSchema = new mongoose.Schema({
    adminPortalPassword: {
        type: String,
        required: [true, 'Please add a password'],
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password using bcrypt
AdminSettingsSchema.pre('save', async function (next) {
    if (!this.isModified('adminPortalPassword')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.adminPortalPassword = await bcrypt.hash(this.adminPortalPassword, salt);
});

// Match user entered password to hashed password in database
AdminSettingsSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.adminPortalPassword);
};

module.exports = mongoose.model('AdminSettings', AdminSettingsSchema);
