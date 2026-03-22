const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function fix() {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email: 'japinder.k25649@nst.rishihood.edu.in' });
  if (user) {
     user.status = 'pending';
     await user.save();
     console.log('Reset to pending.');
  } else {
     console.log('User not found in DB.');
  }
  process.exit(0);
}
fix().catch(err => { console.error(err); process.exit(1); });
