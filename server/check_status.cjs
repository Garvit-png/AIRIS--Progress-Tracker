const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email: 'japinder.k25649@nst.rishihood.edu.in' });
  if (user) {
     console.log('Status: ' + user.status);
     console.log('Role: ' + user.role);
     console.log('IsAdmin: ' + user.isAdmin);
  } else {
     console.log('User not found in DB.');
  }
  process.exit(0);
}
check().catch(err => { console.error(err); process.exit(1); });
