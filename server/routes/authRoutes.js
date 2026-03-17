const express = require('express');
const {
    register,
    login,
    getMe,
    forgotPassword,
    resetPassword,
    verifyEmail,
    googleLogin
} = require('../controllers/authController');

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/verify/:token', verifyEmail);
router.post('/google', googleLogin);

module.exports = router;
