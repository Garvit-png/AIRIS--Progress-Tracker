const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

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
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const path = require('path');

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server running' });
});

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
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
