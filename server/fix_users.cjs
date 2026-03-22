const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function fix() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected');
  
  // Find all users with massive profile pictures (e.g., > 1MB)
  const users = await User.find({});
  let fixedCount = 0;
  for (const user of users) {
      if (user.profilePicture && user.profilePicture.length > 1000000) {
          console.log(`Fixing user: ${user.email} (length: ${user.profilePicture.length})`);
          user.profilePicture = ''; // Reset to empty
          await user.save();
          fixedCount++;
      }
  }
  
  console.log(`Fixed ${fixedCount} users.`);
  process.exit(0);
}
fix().catch(err => { console.error(err); process.exit(1); });
