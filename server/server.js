const express = require('express');
const dotenv = require('dotenv');
// Load environment variables immediately
dotenv.config();

const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const taskRoutes = require('./routes/taskRoutes');
const chatRoutes = require('./routes/chatRoutes');
const groupRoutes = require('./routes/groupRoutes');
const http = require('http');
const { Server } = require('socket.io');

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
    res.json({ status: 'Server running', time: new Date().toISOString() });
});

// For Render's default health checks
app.get('/healthz', (req, res) => {
    res.json({ status: 'Server healthy' });
});

// Request logging to help debug deployment
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Middleware to ensure DB is connected for all other routes
app.use(async (req, res, next) => {
    // Only health and debug routes can truly work without MongoDB
    if (req.path === '/api/health' || 
        req.path === '/healthz' ||
        req.path.startsWith('/api/debug')) {
        return next();
    }

    try {
        if (!process.env.MONGO_URI) return next();
        
        // Non-blocking check for serverless efficiency
        if (mongoose.connection.readyState !== 1) {
            console.log('DB disconnected, attempting rapid connect for', req.url);
            // Use a 5s limit for the request-time connection to prevent function timeout
            await Promise.race([
                connectDB(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('DB Connect Timeout')), 5000))
            ]);
        }
        next();
    } catch (err) {
        console.error('DB Middleware Error for', req.url, ':', err.message);
        res.status(503).json({
            success: false,
            message: 'Database connection currently unavailable.',
            error: err.message
        });
    }
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

// Inject Socket.io into request
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Mount routers
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/admin', '/admin'], adminRoutes);
app.use(['/api/tasks', '/tasks'], taskRoutes);
app.use(['/api/chat', '/chat'], chatRoutes);
app.use(['/api/groups', '/groups'], groupRoutes);

// Debug endpoint for deployment
app.get(['/api/debug/status', '/debug/status'], (req, res) => {
    res.json({
        status: 'online',
        env: {
            NODE_ENV: process.env.NODE_ENV,
            HAS_MONGO_URI: !!process.env.MONGO_URI,
            HAS_JWT_SECRET: !!process.env.JWT_SECRET,
            HAS_CLIENT_URL: !!process.env.CLIENT_URL,
            HAS_GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
            DATA_DIR: process.env.DATA_DIR || 'default'
        },
        cwd: process.cwd(),
        dir: __dirname,
        request: {
            url: req.url,
            path: req.path,
            originalUrl: req.originalUrl
        }
    });
});

// Diagnostic Pulse for Vercel debugging
app.get(['/api/debug/pulse', '/debug/pulse'], (req, res) => {
    res.json({
        pulse: 'active',
        timestamp: new Date().toISOString(),
        request: {
            url: req.url,
            path: req.path,
            originalUrl: req.originalUrl,
            headers: req.headers
        }
    });
});

// Serve frontend in production (catch-all)
const fsSync = require('fs');
const distPath = path.join(__dirname, '../dist');
const hasFrontend = fsSync.existsSync(distPath);

if (process.env.NODE_ENV === 'production' && hasFrontend) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
    });
} else {
    // API-only mode UI for Render root
    app.get('/', (req, res) => {
        res.json({
            status: 'online',
            message: 'AIRIS API is running. Access the frontend via your Vercel URL.',
            endpoints: ['/api/auth', '/api/admin', '/api/tasks', '/api/health']
        });
    });

    // In development or if frontend missing
    app.all('*', (req, res) => {
        res.status(404).json({
            success: false,
            message: `Route ${req.method} ${req.path} not found.`
        });
    });
}

app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({
        success: false,
        message: 'INTERNAL SERVER ERROR',
        error: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        credentials: true
    }
});

// Socket.io Real-time Chat Logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join an individual user room (for receiving messages across any conversation)
    socket.on('join_user', (userId) => {
        if (!userId) return;
        const roomId = `user_${userId}`;
        socket.join(roomId);
        console.log(`[SIGNAL] Client ${socket.id} joined secure room: ${roomId}`);
    });

    // Handle sending a message
    socket.on('send_message', (data, callback) => {
        const { conversationId, message, participantIds } = data;
        
        // Broadcast to all participants in their private rooms
        if (participantIds && Array.isArray(participantIds)) {
            participantIds.forEach(id => {
                if (!id) return;
                const roomId = `user_${id.toString()}`;
                io.to(roomId).emit('receive_message', message);
            });
        } else {
            // Fallback to old behavior if participantIds not provided
            socket.to(conversationId).emit('receive_message', message);
        }

        // ACK for WhatsApp-level reliability
        if (callback && typeof callback === 'function') {
            callback({ success: true, timestamp: new Date(), msgId: message._id || message.tempId });
        }
    });

    // Handle typing status (still per-conversation is fine)
    socket.on('typing', (data) => {
        const { conversationId, userId, isTyping, participantIds } = data;
        if (participantIds && Array.isArray(participantIds)) {
            participantIds.forEach(id => {
                if (id && id.toString() !== userId?.toString()) {
                    io.to(`user_${id.toString()}`).emit('user_typing', { conversationId, userId, isTyping });
                }
            });
        }
    });

    // Handle read receipt
    socket.on('mark_read', (data) => {
        const { conversationId, userId, participantIds } = data;
        if (participantIds && Array.isArray(participantIds)) {
            participantIds.forEach(id => {
                if (id && id.toString() !== userId?.toString()) {
                    io.to(`user_${id.toString()}`).emit('message_read', { conversationId, userId });
                }
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

module.exports = app;

if (require.main === module) {
    const PORT = process.env.PORT || 5002;

    // Connect to DB once on startup to avoid buffering issues
    connectDB()
        .then(() => {
            httpServer.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
        })
        .catch(err => {
            console.error('CRITICAL: Failed to connect to MongoDB on startup:', err.message);
            // Still start the server so we can return error responses to the client
            httpServer.listen(PORT, () => {
                console.log(`Server running on port ${PORT} (DB DISCONNECTED)`);
            });
        });
}
