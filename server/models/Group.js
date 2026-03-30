const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a group name'],
        trim: true,
        unique: true
    },
    description: {
        type: String,
        trim: true
    },
    repoUrl: {
        type: String,
        trim: true,
        default: ''
    },
    inactivityLimitDays: {
        type: Number,
        default: 3,
        min: 1
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports = mongoose.models.Group || mongoose.model('Group', groupSchema);
