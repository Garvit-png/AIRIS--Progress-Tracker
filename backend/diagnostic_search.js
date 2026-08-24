const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function diagnostic() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('CONNECTED TO DATABASE');

        const allUsers = await User.find({});
        console.log(`TOTAL USERS: ${allUsers.length}`);

        const approved = allUsers.filter(u => u.status === 'approved');
        console.log(`APPROVED USERS: ${approved.length}`);

        approved.forEach(u => {
            console.log(`- NAME: "${u.name}", ID: ${u._id}, EMAIL: ${u.email}, STATUS: ${u.status}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('DIAGNOSTIC FAILED:', error);
        process.exit(1);
    }
}

diagnostic();
