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

// Middleware to restrict access to admins only
const authorize = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        return next();
    }
    return res.status(403).json({
        success: false,
        message: 'Access denied: Admin privileges required'
    });
};

router.use(protect);
router.use(requireApproved);
router.use(authorize);

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
