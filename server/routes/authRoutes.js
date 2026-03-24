const express = require('express');
const {
    register,
    login,
    googleLogin,
    getMe,
    forgotPassword,
    resetPassword,
    verifyEmail,
    updateProfile,
    findUserByEmail
} = require('../controllers/authController');

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/verify/:token', verifyEmail);
router.put('/profile', protect, updateProfile);
router.get('/users/search/:email', protect, findUserByEmail);

module.exports = router;
