const express = require('express');
const {
    addApprovedEmail,
    removeApprovedEmail,
    getApprovedEmails,
    getUsers,
    getPendingUsers,
    updateUserStatus,
    getUserPhoto,
    getApprovedUsers,
    getPortalStatus,
    setupPortalPassword,
    verifyPortalPassword
} = require('../controllers/adminController');
const { protect, requireApproved } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(requireApproved);
router.use(authorize('admin'));

router.get('/approved', getApprovedEmails);
router.post('/approve', addApprovedEmail);
router.delete('/approve/:email', removeApprovedEmail);
router.get('/users', getUsers);
router.get('/pending', getPendingUsers);
router.get('/users/:id/photo', getUserPhoto);
router.put('/users/:id/status', updateUserStatus);
router.get('/history', getApprovedUsers);
router.get('/portal-status', getPortalStatus);
router.post('/portal-setup', setupPortalPassword);
router.post('/portal-verify', verifyPortalPassword);

module.exports = router;
