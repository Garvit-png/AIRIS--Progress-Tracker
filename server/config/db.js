const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed", error);
        // Don't exit process in serverless; throw error for Vercel logs
        throw error;
    }
};

module.exports = connectDB;
