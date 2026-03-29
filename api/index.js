const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');

// 1. Initial Configuration
dotenv.config();
const app = express();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
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
        console.log("DB LIFT-OFF SUCCESSFUL (THE_SINGULARITY)");
    } catch (err) {
        console.error("DB FAIL:", err.message);
    }
};

// 3. THE SINGULARITY MODELS (INLINED)
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { type: String, default: 'Member' },
    isAdmin: { type: Boolean, default: false },
    status: { type: String, default: 'pending' },
    profilePicture: { type: String, default: '' },
    googleId: { type: String, unique: true, sparse: true }
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const GroupSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: String,
    repoUrl: String,
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const TaskSchema = new mongoose.Schema({
    senderEmail: String,
    senderName: String,
    targetEmail: String,
    title: String,
    description: String,
    deadline: String,
    status: { type: String, default: 'pending' },
    isPriority: { type: Boolean, default: false },
    targetGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }
}, { timestamps: true });

const ApprovedEmailSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    role: { type: String, default: 'Member' },
    isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

// SAFE COMPILATION (SINGLETON)
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Group = mongoose.models.Group || mongoose.model('Group', GroupSchema);
const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);
const ApprovedEmail = mongoose.models.ApprovedEmail || mongoose.model('ApprovedEmail', ApprovedEmailSchema);

// 4. Middlewares
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.userId || decoded.id);
        next();
    } catch (err) {
        res.status(401).json({ success: false, message: 'Invalid Token' });
    }
};

const admin = (req, res, next) => {
    const isAuthorized = req.user && (
        req.user.isAdmin || 
        ['president', 'general secretary', 'admin', 'gs'].includes(req.user.role?.toLowerCase())
    );
    if (!isAuthorized) return res.status(403).json({ success: false, message: 'Admin access required' });
    next();
};

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(async (req, res, next) => { await connectDB(); next(); });

// 5. THE SINGULARITY ROUTES

// Diagnostics
app.get('/api/debug/pulse', (req, res) => res.json({ mode: 'singularity', time: new Date().toISOString() }));

// Auth: Login & Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const cleanEmail = email.toLowerCase().trim();
        const existing = await User.findOne({ email: cleanEmail });
        if (existing) return res.status(400).json({ success: false, message: 'User already exists' });
        
        const isPreAuth = await ApprovedEmail.findOne({ email: cleanEmail });
        const user = await User.create({ 
            name, email: cleanEmail, password,
            status: isPreAuth ? 'approved' : 'pending',
            role: isPreAuth?.role || 'Member',
            isAdmin: isPreAuth?.isAdmin || false
        });
        const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.status(201).json({ success: true, token, user });
    } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.json({ success: true, token, user });
    } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

app.post('/api/auth/google', async (req, res) => {
    try {
        const { idToken } = req.body;
        const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
        const { email, name, picture } = ticket.getPayload();
        const cleanEmail = email.toLowerCase().trim();
        let user = await User.findOne({ email: cleanEmail });
        if (!user) {
            const isPreAuth = await ApprovedEmail.findOne({ email: cleanEmail });
            user = await User.create({ 
                name, email: cleanEmail, password: crypto.randomBytes(20).toString('hex'),
                status: isPreAuth ? 'approved' : 'pending',
                profilePicture: picture || ''
            });
        }
        const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.json({ success: true, token, user });
    } catch (err) { res.status(401).json({ success: false, message: 'Google Auth Failed' }); }
});

app.get('/api/auth/me', protect, async (req, res) => {
    res.json({ success: true, user: req.user });
});

app.get('/api/auth/members', protect, async (req, res) => {
    const members = await User.find({ status: 'approved', _id: { $ne: req.user.id } }).select('name profilePicture role').lean();
    res.json({ success: true, members });
});

// Groups
app.get('/api/groups', protect, async (req, res) => {
    const isAdmin = req.user.isAdmin || ['president', 'general secretary', 'admin', 'gs'].includes(req.user.role?.toLowerCase());
    const query = isAdmin ? Group.find() : Group.find({ members: req.user.id });
    const data = await query.populate('members', 'name email profilePicture').lean();
    res.json({ success: true, data });
});

app.post('/api/groups', protect, admin, async (req, res) => {
    const group = await Group.create(req.body);
    res.status(201).json({ success: true, data: group });
});

app.patch('/api/groups/:id', protect, admin, async (req, res) => {
    const group = await Group.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('members', 'name email profilePicture');
    res.json({ success: true, data: group });
});

app.delete('/api/groups/:id', protect, admin, async (req, res) => {
    await Group.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: {} });
});

// Tasks
app.get('/api/tasks/my-tasks', protect, async (req, res) => {
    const tasks = await Task.find({ targetEmail: req.user.email.toLowerCase() }).lean();
    res.json({ success: true, data: tasks });
});

app.post('/api/tasks/send', protect, admin, async (req, res) => {
    const task = await Task.create({ ...req.body, senderEmail: req.user.email, senderName: req.user.name });
    res.status(201).json({ success: true, data: task });
});

app.put('/api/tasks/:id/status', protect, async (req, res) => {
    const task = await Task.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json({ success: true, data: task });
});

// 6. SPA Handler
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

module.exports = app;
