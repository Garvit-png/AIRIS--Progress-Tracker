const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get all conversations for a user
// @route   GET /api/chat/conversations
// @access  Private
exports.getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: { $in: [req.user.id] }
        })
        .populate('participants', 'name email profilePicture')
        .populate('lastMessage')
        .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            data: conversations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get or create a DM conversation
// @route   POST /api/chat/conversation/dm
// @access  Private
exports.getOrCreateDM = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    try {
        // Find existing DM
        let conversation = await Conversation.findOne({
            isGroup: false,
            participants: { $all: [req.user.id, userId], $size: 2 }
        })
        .populate('participants', 'name email profilePicture')
        .populate('lastMessage');

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [req.user.id, userId],
                isGroup: false
            });
            
            conversation = await Conversation.findById(conversation._id)
                .populate('participants', 'name email profilePicture');
        }

        res.status(200).json({
            success: true,
            data: conversation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create a group conversation
// @route   POST /api/chat/conversation/group
// @access  Private
exports.createGroup = async (req, res) => {
    const { name, participants, image } = req.body;

    if (!name || !participants || participants.length === 0) {
        return res.status(400).json({ success: false, message: 'Group name and participants are required' });
    }

    try {
        // Add current user to participants if not already there
        const allParticipants = [...new Set([...participants, req.user.id])];

        const conversation = await Conversation.create({
            groupName: name,
            participants: allParticipants,
            isGroup: true,
            groupAdmin: req.user.id,
            groupImage: image || ''
        });

        const populatedConversation = await Conversation.findById(conversation._id)
            .populate('participants', 'name email profilePicture');

        res.status(201).json({
            success: true,
            data: populatedConversation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get messages for a conversation
// @route   GET /api/chat/messages/:conversationId
// @access  Private
exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            conversation: req.params.conversationId
        })
        .populate('sender', 'name email profilePicture')
        .sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            data: messages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Send a message
// @route   POST /api/chat/message
// @access  Private
exports.sendMessage = async (req, res) => {
    const { conversationId, text } = req.body;

    if (!conversationId || !text) {
        return res.status(400).json({ success: false, message: 'Conversation ID and text are required' });
    }

    try {
        const message = await Message.create({
            conversation: conversationId,
            sender: req.user.id,
            text
        });

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'name email profilePicture');

        // Update conversation lastMessage
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: message._id,
            updatedAt: Date.now()
        });

        res.status(201).json({
            success: true,
            data: populatedMessage
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
