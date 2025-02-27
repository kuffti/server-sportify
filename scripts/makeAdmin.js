const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

/**
 * סקריפט להפיכת משתמש קיים לאדמין
 * שימוש: 
 * node makeAdmin.js user@email.com
 */
async function makeAdmin() {
  try {
    const email = process.argv[2];
    
    if (!email) {
      console.error('אנא ספק כתובת אימייל. דוגמה: node makeAdmin.js user@example.com');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const user = await User.findOne({ email });
    
    if (!user) {
      console.error(`לא נמצא משתמש עם האימייל ${email}`);
      process.exit(1);
    }
    
    user.isAdmin = true;
    await user.save();
    
    console.log(`המשתמש ${user.name} (${user.email}) הוא כעת אדמין!`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

makeAdmin();
