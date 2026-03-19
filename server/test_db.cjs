const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from current directory
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('MONGO_URI not found in .env');
    process.exit(1);
}

console.log('Attempting to connect to MongoDB...');
// console.log('URI:', MONGO_URI.replace(/:([^@]+)@/, ':****@')); // Hide password

mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000
})
.then(() => {
    console.log('Successfully connected to MongoDB!');
    process.exit(0);
})
.catch(err => {
    console.error('Connection failed:');
    console.error(err);
    process.exit(1);
});
