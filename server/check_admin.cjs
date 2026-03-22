const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const User = require('./models/User');
    const user = await User.findOne({ email: 'garvitgandhi0313@gmail.com' });
    console.log(user ? 'User found: ' + JSON.stringify(user, null, 2) : 'User NOT found');
    process.exit(0);
}
check().catch(console.error);
