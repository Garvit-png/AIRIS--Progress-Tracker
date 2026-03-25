const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect, requireApproved } = require('../middleware/authMiddleware');
router.use(protect);
router.use(requireApproved);
const path = require('path');

// Middleware to check if user is Admin or President
const authorizeAdminOrPresident = (req, res, next) => {
    if (req.user && (req.user.isAdmin || req.user.role === 'President' || req.user.role === 'Admin')) {
        return next();
    }
    return res.status(403).json({
        success: false,
        message: 'Not authorized: Requires Admin or President role'
    });
};

// @desc    Send task to a user
// @route   POST /api/tasks/send
// @access  Private (Admin/President)
router.post('/send', authorizeAdminOrPresident, async (req, res) => {
    try {
        const { targetEmail, title, description, deadline } = req.body;
        
        if (!targetEmail || !title) {
            return res.status(400).json({ success: false, message: 'Please provide target email and title' });
        }

        let attachment = null;
        if (req.files && req.files.file) {
            const file = req.files.file;
            const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
            const uploadPath = path.join(process.env.UPLOADS_DIR || path.join(__dirname, '../uploads'), fileName);
            
            await file.mv(uploadPath);
            attachment = {
                name: file.name,
                path: `/uploads/${fileName}`,
                type: file.mimetype
            };
        }

        const task = await Task.create({
            senderEmail: req.user.email,
            senderName: req.user.name,
            targetEmail: targetEmail.toLowerCase().trim(),
            title,
            description,
            deadline,
            attachment,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get tasks for the current user
// @route   GET /api/tasks/my-tasks
// @access  Private
router.get('/my-tasks', async (req, res) => {
    try {
        const myTasks = await Task.find({ targetEmail: req.user.email.toLowerCase() });
        
        res.status(200).json({
            success: true,
            data: myTasks
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get all tasks (for Admin/President to track progress)
// @route   GET /api/tasks/all
// @access  Private (Admin/President)
router.get('/all', authorizeAdminOrPresident, async (req, res) => {
    try {
        const allTasks = await Task.find();
        res.status(200).json({
            success: true,
            data: allTasks
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const task = await Task.findByIdAndUpdate(req.params.id, { status }, {
            new: true,
            runValidators: true
        });
        
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
