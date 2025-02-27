const mongoose = require('mongoose'); // ייבוא מונגוס
const bcrypt = require('bcryptjs'); // ספרייה להצפנת סיסמאות

// הגדרת המבנה של משתמש במערכת
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'בבקשה הכנס שם'] // חובה להכניס שם
  },
  email: {
    type: String,
    required: [true, 'בבקשה הכנס אימייל'],
    unique: true, // האימייל חייב להיות ייחודי
    match: [/.+@.+\..+/, 'בבקשה הכנס אימייל תקין'] // בדיקת תקינות אימייל
  },
  password: {
    type: String,
    required: [true, 'בבקשה הכנס סיסמה'],
    minlength: [6, 'הסיסמה חייבת להיות לפחות 6 תווים'] // הסיסמה חייבת להיות לפחות 6 תווים
  },
  createdAt: {
    type: Date,
    default: Date.now // תאריך יצירת המשתמש
  }
}, {
  timestamps: true // מוסיף שדות של מתי נוצר ומתי עודכן
});

// לפני שמירת המשתמש, נצפין את הסיסמה
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10); // יוצרים מלח להצפנה
  this.password = await bcrypt.hash(this.password, salt); // מצפינים את הסיסמה
});

module.exports = mongoose.model('User', userSchema);
