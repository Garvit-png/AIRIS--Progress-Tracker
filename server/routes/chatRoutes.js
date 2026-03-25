const express = require('express');
const {
    getConversations,
    getOrCreateDM,
    createGroup,
    getMessages,
    sendMessage
} = require('../controllers/chatController');

const router = express.Router();

const { protect, requireApproved } = require('../middleware/authMiddleware');

router.use(protect);
router.use(requireApproved);

router.get('/conversations', getConversations);
router.post('/conversation/dm', getOrCreateDM);
router.post('/conversation/group', createGroup);
router.get('/messages/:conversationId', getMessages);
router.post('/message', sendMessage);

module.exports = router;
