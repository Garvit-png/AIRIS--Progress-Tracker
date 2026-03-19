const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');

// Load .env
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

const setupAdmins = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const adminEmails = ['garvitgandhi0313@gmail.com'];
        const password = 'garvit123';

        for (const email of adminEmails) {
            let user = await User.findOne({ email });

            if (user) {
                user.role = 'Admin';
                user.isAdmin = true;
                user.status = 'approved';
                user.password = password;
                user.isVerified = true;
                await user.save();
                console.log(`Updated existing user to Admin: ${email}`);
            } else {
                await User.create({
                    name: 'Garvit Admin',
                    email,
                    password,
                    role: 'Admin',
                    isAdmin: true,
                    status: 'approved',
                    isVerified: true
                });
                console.log(`Created new Admin user: ${email}`);
            }
        }

        console.log('Admin setup complete');
        process.exit(0);
    } catch (err) {
        console.error('Error during admin setup:', err);
        process.exit(1);
    }
};

setupAdmins();
