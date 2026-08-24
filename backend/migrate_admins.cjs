const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the server directory
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const User = require('./server/models/User');

async function migrate() {
    try {
        console.log('Connecting to database...');
        // Use MONGO_URI from the .env file
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27004/airis';
        await mongoose.connect(uri);
        console.log('Connected.');

        console.log('Updating legacy admin accounts...');
        // Update users who have role 'admin' or are the primary email
        // We set isAdmin to true and ensure the role is capitalized 'Admin'
        const result = await User.updateMany(
            { 
                $or: [
                    { role: 'admin' },
                    { role: 'Admin' },
                    { email: 'garvitgandhi0313@gmail.com' }
                ]
            },
            { 
                $set: { 
                    isAdmin: true,
                    role: 'Admin'
                } 
            }
        );

        console.log(`Migration complete. Updated ${result.modifiedCount} users.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
