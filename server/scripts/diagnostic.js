const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars from the correct path
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const diagnostic = async () => {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        
        console.log('Database Name:', mongoose.connection.name);
        
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));
        
        const userCount = await User.countDocuments();
        console.log('User Count:', userCount);
        
        const allUsers = await User.find({}, 'email name isAdmin status');
        console.log('All Users:', JSON.stringify(allUsers, null, 2));
        
        process.exit(0);
    } catch (err) {
        console.error('Diagnostic failed:', err);
        process.exit(1);
    }
};

diagnostic();
