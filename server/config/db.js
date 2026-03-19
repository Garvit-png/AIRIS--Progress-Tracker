const mongoose = require('mongoose');

// Disable buffering to fail fast if not connected
mongoose.set('bufferCommands', false);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed", error);
        // Don't exit process in serverless; throw error for Vercel logs
        throw error;
    }
};

module.exports = connectDB;
