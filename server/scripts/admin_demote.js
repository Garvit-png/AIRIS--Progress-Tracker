const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

const demoteAdmins = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const allowedAdmin = 'garvitgandhi0313@gmail.com';
        
        const result = await User.updateMany(
            { email: { $ne: allowedAdmin }, isAdmin: true },
            { $set: { isAdmin: false, role: 'Member' } }
        );

        console.log(`Demoted ${result.modifiedCount} admin accounts.`);
        
        // Ensure the only admin has the correct password and status
        await User.findOneAndUpdate(
            { email: allowedAdmin },
            { $set: { isAdmin: true, role: 'Admin', status: 'approved' } }
        );

        console.log(`Ensured ${allowedAdmin} is Admin.`);
        process.exit(0);
    } catch (err) {
        console.error('Error during admin demotion:', err);
        process.exit(1);
    }
};

demoteAdmins();
