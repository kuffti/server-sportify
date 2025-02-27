const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fixUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('מחובר למסד הנתונים');

    // מצא את כל המשתמשים
    const usersCollection = mongoose.connection.collection('users');
    const users = await usersCollection.find({}).toArray();

    console.log(`נמצאו ${users.length} משתמשים`);

    let fixedCount = 0;
    let problemsFound = 0;

    // עבור על כל משתמש ובדוק אם יש לו סיסמה תקינה
    for (const user of users) {
      console.log(`בודק משתמש: ${user.email || 'ללא אימייל'} (ID: ${user._id})`);

      // בעיות לזיהוי
      const issues = [];

      if (!user.email) issues.push('חסר אימייל');
      if (!user.name) issues.push('חסר שם');
      if (!user.password) issues.push('חסרה סיסמה');
      if (user.password && !user.password.startsWith('$2')) issues.push('סיסמה לא מוצפנת');

      if (issues.length > 0) {
        problemsFound++;
        console.log(`---[ בעיות במשתמש ${user.email || user._id} ]---`);
        issues.forEach(issue => console.log(`- ${issue}`));

        // לתקן סיסמה חסרה או לא מוצפנת
        if (issues.includes('חסרה סיסמה') || issues.includes('סיסמה לא מוצפנת')) {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash('password123', salt); // סיסמת ברירת מחדל

          await usersCollection.updateOne(
            { _id: user._id },
            { $set: { password: hashedPassword } }
          );
          
          console.log(`תוקנה סיסמה למשתמש ${user.email || user._id}`);
          fixedCount++;
        }

        // לתקן שם חסר
        if (issues.includes('חסר שם')) {
          const name = user.email ? user.email.split('@')[0] : 'אנונימי';
          await usersCollection.updateOne(
            { _id: user._id },
            { $set: { name: name } }
          );
          
          console.log(`תוקן שם למשתמש ${user.email || user._id}`);
          fixedCount++;
        }

        console.log('----------------------------');
      }
    }

    console.log(`סיכום: ${problemsFound} משתמשים עם בעיות, ${fixedCount} תיקונים בוצעו`);

    // הדפסת רשימת משתמשים תקינים לבדיקה
    console.log('\nמשתמשים תקינים להתחברות:');
    for (const user of users) {
      const isValid = user.email && user.name && user.password && user.password.startsWith('$2');
      if (isValid) {
        console.log(`- ${user.email} (${user.name})`);
      }
    }

    await mongoose.disconnect();
    console.log('ניתוק ממסד הנתונים');
  } catch (error) {
    console.error('שגיאה:', error);
    await mongoose.disconnect();
  }
}

fixUsers();
