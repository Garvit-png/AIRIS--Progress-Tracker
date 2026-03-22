const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected');
  const user = await User.findOne({ email: 'japinder.k25649@nst.rishihood.edu.in' });
  if (user) {
     const payload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
        status: user.status,
        profilePicture: user.profilePicture
     };
     console.log('Payload string length:', JSON.stringify(payload).length);
     console.log('Profile Picture string length:', payload.profilePicture ? payload.profilePicture.length : 0);
  } else {
     console.log('User not found in DB.');
  }
  process.exit(0);
}
check().catch(err => { console.error(err); process.exit(1); });
