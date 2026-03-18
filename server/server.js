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

// Middleware
const allowedOrigins = [process.env.CLIENT_URL, 'https://airis-progress-tracker.vercel.app', 'http://localhost:5173'];
app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
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

module.exports = app;

if (require.main === module) {
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
