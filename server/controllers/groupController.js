const Group = require('../models/Group');
const User = require('../models/User');
const Task = require('../models/Task');

// @desc    Create new group
// @route   POST /api/groups
// @access  Admin
exports.createGroup = async (req, res) => {
    try {
        const { name, description, repoUrl, members, inactivityLimitDays } = req.body;
        
        const group = await Group.create({
            name,
            description,
            repoUrl,
            members,
            inactivityLimitDays
        });

        res.status(201).json({
            success: true,
            data: group
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get all groups (Admin sees all, Member sees theirs)
// @route   GET /api/groups
// @access  Private
exports.getGroups = async (req, res) => {
    try {
        let query;
        
        // If admin, get all. If not, get only groups where user is a member.
        if (req.user.isAdmin || req.user.role?.toLowerCase() === 'admin' || req.user.role?.toLowerCase() === 'president' || req.user.role?.toLowerCase() === 'general secretary') {
            query = Group.find().populate('members', 'name email profilePicture githubUsername').lean();
        } else {
            query = Group.find({ members: req.user.id }).populate('members', 'name email profilePicture githubUsername').lean();
        }

        const groups = await query;

        res.status(200).json({
            success: true,
            count: groups.length,
            data: groups
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Update group (Admin only)
// @route   PATCH /api/groups/:id
// @access  Admin
exports.updateGroup = async (req, res) => {
    try {
        let group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        group = await Group.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('members', 'name email profilePicture');

        res.status(200).json({
            success: true,
            data: group
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Delete group (Admin only)
// @route   DELETE /api/groups/:id
// @access  Admin
exports.deleteGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        await group.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Assign task to all group members
// @route   POST /api/groups/:id/tasks
// @access  Admin
exports.assignGroupTask = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        const { title, description, deadline, isPriority } = req.body;

        // Create tasks for all members
        const tasks = await Promise.all(group.members.map(async (memberId) => {
            const member = await User.findById(memberId);
            if (!member) return null;

            return Task.create({
                senderEmail: req.user.email,
                senderName: req.user.name,
                targetEmail: member.email,
                title,
                description,
                deadline,
                isPriority: isPriority || false,
                targetGroup: group._id
            });
        }));

        res.status(201).json({
            success: true,
            message: `Task assigned to ${tasks.filter(t => t !== null).length} members`
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};
