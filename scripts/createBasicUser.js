const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// פונקציה ליצירת משתמש פשוטה (ללא תלות במודל User)
async function createBasicUser() {
  try {
    // התחברות למונגו
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sportify');
    console.log('מחובר למונגו');

    // קבלת קולקציית המשתמשים
    const usersCollection = mongoose.connection.collection('users');

    // הכנת משתמש בסיסי
    const plainPassword = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // בדיקה אם המשתמש קיים
    const existingUser = await usersCollection.findOne({ email: 'test@example.com' });
    
    if (existingUser) {
      console.log('משתמש כבר קיים:', existingUser);
    } else {
      // יצירת משתמש חדש ישירות בקולקציה
      const result = await usersCollection.insertOne({
        name: 'משתמש בדיקה',
        email: 'test@example.com',
        password: hashedPassword,
        isAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log('נוצר משתמש חדש:', result.insertedId);
      console.log('פרטי התחברות:');
      console.log('אימייל: test@example.com');
      console.log('סיסמה: password123');
    }

    await mongoose.disconnect();
    console.log('ניתוק מהמסד נתונים');
  } catch (error) {
    console.error('שגיאה:', error);
  }
}

createBasicUser();
