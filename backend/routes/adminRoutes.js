const express = require('express');
const {
    getAllowedEmails,
    addAllowedEmail,
    removeAllowedEmail,
    getUsers,
    updateUser,
    deleteUser,
    getUserPhoto,
    getPortalStatus,
    setupPortalPassword,
    verifyPortalPassword
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All admin routes require a valid JWT + admin flag
const adminOnly = (req, res, next) => {
    if (req.user && req.user.isAdmin) return next();
    return res.status(403).json({ success: false, message: 'Admin access required' });
};

router.use(protect);
router.use(adminOnly);

// Whitelist (AllowedEmail) management
router.get('/allowed-emails',           getAllowedEmails);
router.post('/allowed-emails',          addAllowedEmail);
router.delete('/allowed-emails/:email', removeAllowedEmail);

// User management
router.get('/users',            getUsers);
router.put('/users/:id',        updateUser);
router.delete('/users/:id',     deleteUser);
router.get('/users/:id/photo',  getUserPhoto);

// Admin portal password
router.get('/portal-status',    getPortalStatus);
router.post('/portal-setup',    setupPortalPassword);
router.post('/portal-verify',   verifyPortalPassword);

module.exports = router;
