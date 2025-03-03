const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('חיבור למסד הנתונים הצליח.');

    // בדוק אם כבר קיים משתמש אדמין
    const adminExists = await User.findOne({ isAdmin: true });
    
    if (adminExists) {
      console.log('משתמש אדמין כבר קיים במערכת:');
      console.log(`שם: ${adminExists.name}, אימייל: ${adminExists.email}`);
      await mongoose.disconnect();
      return;
    }

    // הגדרות משתמש אדמין ברירת מחדל
    const adminUser = {
      name: 'מנהל המערכת',
      email: 'admin@sportify.com',
      password: 'admin123',
      isAdmin: true
    };

    // יצירת המשתמש
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminUser.password, salt);

    const newAdmin = new User({
      name: adminUser.name,
      email: adminUser.email,
      password: hashedPassword,
      isAdmin: true
    });

    await newAdmin.save();

    console.log('============================');
    console.log('נוצר משתמש אדמין חדש:');
    console.log(`שם: ${adminUser.name}`);
    console.log(`אימייל: ${adminUser.email}`);
    console.log(`סיסמה: ${adminUser.password}`);
    console.log('============================');

    await mongoose.disconnect();
    console.log('ניתוק ממסד הנתונים.');
  } catch (error) {
    console.error('שגיאה ביצירת משתמש אדמין:', error);
    await mongoose.disconnect();
  }
}

createAdmin();
