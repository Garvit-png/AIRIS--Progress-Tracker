const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected');
  const user = await User.findOne({ email: 'japinder.k25649@nst.rishihood.edu.in' });
  if (user) {
     console.log('User found:', user.email);
     console.log('Profile Picture length:', user.profilePicture ? user.profilePicture.length : 0);
  } else {
     console.log('User not found in DB.');
  }
  process.exit(0);
}
check().catch(err => { console.error(err); process.exit(1); });
