const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const path = require('path');

// 1. Initial Configuration
dotenv.config();
const app = express();

// Absolute Path Fallbacks
const distPath = path.join(__dirname, '../dist');

// 2. Monolithic Database Connection
const connectDB = async () => {
    if (!process.env.MONGO_URI) return;
    try {
        if (mongoose.connection.readyState === 1) return;
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
        });
        console.log("DB LIFT-OFF SUCCESSFUL (MONOLITH_MODE)");
    } catch (err) {
        console.error("DB FAIL:", err.message);
    }
};

// 3. Models Inlining (Prevents "Model Not Found" during bundling)
const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: { type: String, select: false },
    role: { type: String, default: 'Member' },
    isAdmin: { type: Boolean, default: false },
    status: { type: String, default: 'pending' },
    profilePicture: String
}, { timestamps: true });

const GroupSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    description: String,
    repoUrl: String,
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const TaskSchema = new mongoose.Schema({
    senderName: String,
    senderEmail: String,
    targetEmail: String,
    title: String,
    description: String,
    deadline: Date,
    status: { type: String, default: 'pending' },
    isPriority: { type: Boolean, default: false },
    targetGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Group = mongoose.models.Group || mongoose.model('Group', GroupSchema);
const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);

// 4. Security Middleware
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next();
    } catch (err) {
        res.status(401).json({ success: false, message: 'Invalid Token' });
    }
};

const admin = (req, res, next) => {
    const isAdmin = req.user && (
        req.user.isAdmin || 
        ['president', 'general secretary', 'admin', 'gs'].includes(req.user.role?.toLowerCase())
    );
    if (!isAdmin) return res.status(403).json({ success: false, message: 'Admin access required' });
    next();
};

// 5. Global Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));

// Rapid Database Activation
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// 6. Monolithic Project Routes (The "Pulse" Engine)
app.get('/api/debug/pulse', (req, res) => {
    res.json({ pulse: 'active', mode: 'monolith_safe', time: new Date().toISOString() });
});

app.get('/api/groups', protect, async (req, res) => {
    try {
        let query;
        const isAdmin = req.user.isAdmin || ['president', 'general secretary', 'admin', 'gs'].includes(req.user.role?.toLowerCase());
        if (isAdmin) {
            query = Group.find().populate('members', 'name email profilePicture').lean();
        } else {
            query = Group.find({ members: req.user.id }).populate('members', 'name email profilePicture').lean();
        }
        const data = await query;
        res.json({ success: true, count: data.length, data });
    } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

app.post('/api/groups', protect, admin, async (req, res) => {
    try {
        const group = await Group.create(req.body);
        res.status(201).json({ success: true, data: group });
    } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

app.patch('/api/groups/:id', protect, admin, async (req, res) => {
    try {
        const group = await Group.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('members', 'name email profilePicture');
        res.json({ success: true, data: group });
    } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

app.delete('/api/groups/:id', protect, admin, async (req, res) => {
    try {
        await Group.findByIdAndDelete(req.params.id);
        res.json({ success: true, data: {} });
    } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

app.post('/api/groups/:id/tasks', protect, admin, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
        const { title, description, deadline, isPriority } = req.body;
        const tasks = await Promise.all(group.members.map(async (memberId) => {
            const member = await User.findById(memberId);
            if (!member) return null;
            return Task.create({
                senderEmail: req.user.email, senderName: req.user.name,
                targetEmail: member.email, title, description, deadline,
                isPriority: isPriority || false, targetGroup: group._id
            });
        }));
        res.status(201).json({ success: true, message: `Task assigned to members` });
    } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// 7. Bridge to Legacy Micro-services (If they exist)
const authRoutes = require('../server/routes/authRoutes');
const adminRoutes = require('../server/routes/adminRoutes');
const taskRoutes = require('../server/routes/taskRoutes');
const chatRoutes = require('../server/routes/chatRoutes');

app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/admin', '/admin'], adminRoutes);
app.use(['/api/tasks', '/tasks'], taskRoutes);
app.use(['/api/chat', '/chat'], chatRoutes);

// 8. Static Frontend Handler
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

// 9. Export for Vercel Serverless
module.exports = app;
