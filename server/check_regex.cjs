const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const User = require('./models/User');
    
    const tokenEmail = 'garvitgandhi0313@gmail.com';
    const cleanEmail = tokenEmail.toLowerCase().trim();
    
    console.log('Searching for regex:', `^${cleanEmail}$`);
    
    const user = await User.findOne({ email: { $regex: new RegExp(`^${cleanEmail}$`, 'i') } });
    console.log(user ? 'User found via regex: ' + user.email : 'User NOT found via regex');
    
    const userExact = await User.findOne({ email: cleanEmail });
    console.log(userExact ? 'User found via exact match: ' + userExact.email : 'User NOT found via exact match');
    
    process.exit(0);
}
check().catch(console.error);
