const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    senderEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    senderName: {
        type: String,
        required: true
    },
    targetEmail: {
        type: String,
        required: [true, 'Please provide a target email'],
        lowercase: true,
        trim: true
    },
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    deadline: {
        type: String
    },
    attachment: {
        name: String,
        path: String,
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'verified'],
        default: 'pending'
    },
    isPriority: {
        type: Boolean,
        default: false
    },
    targetGroup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);
module.exports = Task;
