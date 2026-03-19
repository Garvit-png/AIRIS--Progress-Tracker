const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const taskRoutes = require('./routes/taskRoutes');

// Load environment variables
dotenv.config();

let isDBConnected = false;
const connectDBWithRetry = async () => {
    if (isDBConnected) return;
    try {
        await connectDB();
        isDBConnected = true;
    } catch (err) {
        console.error('Initial DB connection failed:', err.message);
    }
};

const app = express();

// Health check route - DOES NOT REQUIRE DB
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server running' });
});

// Middleware to ensure DB is connected for all other routes
app.use(async (req, res, next) => {
    // These routes can work without MongoDB
    if (req.path === '/api/health' || 
        req.path.startsWith('/api/tasks') || 
        req.path.startsWith('/api/auth') || 
        req.path.startsWith('/api/admin') || 
        req.path.startsWith('/api/debug')) {
        return next();
    }
    
    try {
        if (mongoose.connection.readyState !== 1) {
            await connectDB();
        }
        next();
    } catch (err) {
        res.status(503).json({ 
            success: false, 
            message: 'Database connection currently unavailable. Please try again in 5 seconds.',
            error: err.message
        });
    }
});

// Request logging to help debug deployment
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Middleware
const allowedOrigins = [
    process.env.CLIENT_URL, 
    'https://airis-progress-tracker.vercel.app', 
    'http://localhost:5173',
    'http://localhost:5001'
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const isVercel = origin.endsWith('.vercel.app');
        const isAllowed = allowedOrigins.indexOf(origin) !== -1 || isVercel;

        if (isAllowed) {
            return callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
    },
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(fileUpload());

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, 'uploads');

// Static folder for uploads
app.use('/uploads', express.static(UPLOADS_DIR));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tasks', taskRoutes);

// Debug endpoint for deployment
app.get('/api/debug/status', (req, res) => {
    res.json({
        status: 'online',
        env: {
            NODE_ENV: process.env.NODE_ENV,
            HAS_MONGO_URI: !!process.env.MONGO_URI,
            HAS_JWT_SECRET: !!process.env.JWT_SECRET,
            HAS_CLIENT_URL: !!process.env.CLIENT_URL,
            HAS_GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID
        }
    });
});

// Serve frontend in production (catch-all)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
    });
} else {
    // In development, if we accidentally hit the backend port for a frontend route
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api/')) {
            res.status(404).json({
                success: false,
                message: `Route ${req.path} not found. If this is a frontend route, please use the Vite development port (usually http://localhost:5173)`
            });
        }
    });
}

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({
        success: false,
        message: 'INTERNAL SERVER ERROR',
        error: process.env.NODE_ENV === 'production' ? 'Unspecified' : err.message
    });
});

module.exports = app;

if (require.main === module) {
    const PORT = process.env.PORT || 5002;
    
    // Connect to DB once on startup to avoid buffering issues
    connectDB()
        .then(() => {
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
        })
        .catch(err => {
            console.error('CRITICAL: Failed to connect to MongoDB on startup:', err.message);
            // Still start the server so we can return error responses to the client
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT} (DB DISCONNECTED)`);
            });
        });
}
