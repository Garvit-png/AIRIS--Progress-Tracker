const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        try {
            // Attempt to fetch fresh user data from DB
            req.user = await User.findById(decoded.userId);
            
            // If DB hit fails but we have a valid token with role data, use that (Stateless Fallback)
            if (!req.user && decoded.role) {
                req.user = { 
                    id: decoded.userId, 
                    role: decoded.role, 
                    isAdmin: decoded.isAdmin,
                    email: decoded.email // This might be missing in payload, let's fix login/register too
                };
            }
        } catch (dbError) {
            // DB is likely down, use stateless fallback if possible
            if (decoded.role) {
                console.log('DB DOWN: Falling back to stateless auth for', decoded.userId);
                req.user = { 
                    id: decoded.userId, 
                    role: decoded.role, 
                    isAdmin: decoded.isAdmin 
                };
            } else {
                throw dbError;
            }
        }

        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
        }

        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }
};

// Middleware to restrict access to approved users only
exports.requireApproved = (req, res, next) => {
    if (req.user && req.user.status === 'approved') {
        return next();
    }
    
    return res.status(403).json({
        success: false,
        message: 'Access denied: Your account is pending approval or has been revoked.',
        status: req.user ? req.user.status : 'unknown'
    });
};
