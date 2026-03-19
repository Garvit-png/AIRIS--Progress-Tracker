const express = require('express');
const {
    register,
    login,
    getMe,
    forgotPassword,
    resetPassword,
    verifyEmail,
    updateProfile
} = require('../controllers/authController');

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/verify/:token', verifyEmail);
router.put('/profile', protect, updateProfile);

module.exports = router;
