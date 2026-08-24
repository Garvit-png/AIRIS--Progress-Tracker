const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const ApprovedEmail = require('../models/ApprovedEmail');
const Task = require('../models/Task');

const migrate = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    const dataDir = path.join(__dirname, '../data');

    // Migrate Users
    console.log('Migrating Users...');
    try {
      const usersData = await fs.readFile(path.join(dataDir, 'users.json'), 'utf8');
      const users = JSON.parse(usersData);
      for (const u of users) {
        const exists = await User.findOne({ email: u.email.toLowerCase() });
        if (!exists) {
            // Remove 'id' from JSON to let Mongoose create its own _id OR keep it if needed
            const { id, ...userData } = u;
            await User.create(userData);
            console.log(`Migrated user: ${u.email}`);
        } else {
            console.log(`User already exists: ${u.email}`);
        }
      }
    } catch (err) {
      console.log('No users found to migrate or error:', err.message);
    }

    // Migrate Approved Emails
    console.log('Migrating Approved Emails...');
    try {
      const approvedData = await fs.readFile(path.join(dataDir, 'approved_emails.json'), 'utf8');
      const approved = JSON.parse(approvedData);
      
      // Need a valid user ID for 'addedBy'
      const admin = await User.findOne({ isAdmin: true });
      const adminId = admin ? admin._id : null;

      for (const a of approved) {
        const exists = await ApprovedEmail.findOne({ email: a.email.toLowerCase() });
        if (!exists) {
            await ApprovedEmail.create({
                email: a.email,
                addedBy: adminId || mongoose.Types.ObjectId() // Fallback
            });
            console.log(`Migrated approved email: ${a.email}`);
        } else {
            console.log(`Approved email already exists: ${a.email}`);
        }
      }
    } catch (err) {
      console.log('No approved emails found to migrate or error:', err.message);
    }

    // Migrate Tasks
    console.log('Migrating Tasks...');
    try {
      const tasksData = await fs.readFile(path.join(dataDir, 'tasks.json'), 'utf8');
      const tasks = JSON.parse(tasksData);
      for (const t of tasks) {
        // Simple check: title + targetEmail
        const exists = await Task.findOne({ title: t.title, targetEmail: t.targetEmail });
        if (!exists) {
            const { id, ...taskData } = t;
            await Task.create(taskData);
            console.log(`Migrated task: ${t.title}`);
        } else {
          console.log(`Task already exists: ${t.title}`);
        }
      }
    } catch (err) {
      console.log('No tasks found to migrate or error:', err.message);
    }

    console.log('Migration complete.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
