const express = require('express');
const {
    addApprovedEmail,
    removeApprovedEmail,
    getApprovedEmails,
    getUsers,
    getPendingUsers,
    updateUserStatus,
    getUserPhoto,
    getApprovedUsers
} = require('../controllers/adminController');

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

// Middleware to restrict access to admins only
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: `User is not authorized to access this route`
            });
        }
        next();
    };
};

router.use(protect);
router.use(authorize('admin'));

router.get('/approved', getApprovedEmails);
router.post('/approve', addApprovedEmail);
router.delete('/approve/:email', removeApprovedEmail);
router.get('/users', getUsers);
router.get('/pending', getPendingUsers);
router.get('/users/:id/photo', getUserPhoto);
router.put('/users/:id/status', updateUserStatus);
router.get('/history', getApprovedUsers);

module.exports = router;
