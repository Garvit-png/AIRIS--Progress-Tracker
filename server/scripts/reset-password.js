const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load env vars
dotenv.config({ path: '../.env' });

const resetPassword = async () => {
    try {
        // Connect to DB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        const email = 'garvitgandhi0313@gmail.com';
        const newPassword = 'garvit123'; // Temporary password

        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        user.password = newPassword;
        await user.save();

        console.log(`Password reset successfully for ${email}`);
        console.log(`New temporary password: ${newPassword}`);
        
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

resetPassword();
