const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const User = require('./models/User');
    const cleanEmail = 'garvitgandhi0313@gmail.com'.toLowerCase().trim();
    
    // Exact match
    const userExact = await User.findOne({ email: cleanEmail });
    console.log(userExact ? 'Exact found: ' + userExact.email : 'Exact NOT found');
    
    // Regex match exactly like authController
    const userRegexStr = await User.findOne({ email: { $regex: new RegExp(`^${cleanEmail}$`, 'i') } });
    console.log(userRegexStr ? 'RegexStr found: ' + userRegexStr.email : 'RegexStr NOT found');
    
    // Another regex approach
    const userRegex2 = await User.findOne({ email: new RegExp(`^${cleanEmail}$`, 'i') });
    console.log(userRegex2 ? 'Regex2 found: ' + userRegex2.email : 'Regex2 NOT found');

    process.exit(0);
}
check().catch(console.error);
