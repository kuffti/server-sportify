const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'נא להזין שם'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'נא להזין אימייל'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'נא להזין אימייל תקין']
  },
  password: {
    type: String,
    required: [true, 'נא להזין סיסמה'],
    minlength: [6, 'הסיסמה חייבת להכיל לפחות 6 תווים'],
    select: true // וודא שהסיסמה מגיעה בשאילתות
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// פונקציה להצפנת סיסמה
userSchema.pre('save', async function(next) {
  try {
    // רק אם הסיסמה השתנתה
    if (!this.isModified('password')) {
      return next();
    }
    
    console.log('מצפין סיסמה למשתמש:', this.email);
    
    // הצפנת הסיסמה עם bcrypt
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
    next();
  } catch (error) {
    console.error('שגיאה בהצפנת סיסמה:', error);
    next(error);
  }
});

// פונקציה משופרת להשוואת סיסמאות
userSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    // לוג לפני השוואה
    console.log('משווה סיסמה למשתמש:', this.email);
    
    // אם אין סיסמה או שהיא לא מוצפנת כראוי, מחזיר שקר
    if (!this.password || !this.password.startsWith('$2')) {
      console.log('סיסמה חסרה או לא מוצפנת כראוי');
      return false;
    }
    
    // השוואה עם bcrypt
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log('תוצאת השוואה:', isMatch ? 'תואם' : 'לא תואם');
    return isMatch;
  } catch (error) {
    console.error('שגיאה בהשוואת סיסמאות:', error);
    return false;
  }
};

// מחיקת המודל הקיים (אם יש כזה)
try {
  mongoose.deleteModel('User');
} catch (error) {
  // התעלם מהשגיאה - זה קורה אם המודל לא קיים עדיין
}

const User = mongoose.model('User', userSchema);
module.exports = User;