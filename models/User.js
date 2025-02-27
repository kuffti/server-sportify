const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// נגדיר סכמה חדשה לחלוטין ללא שום זכר לשדה username
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
    minlength: [6, 'הסיסמה חייבת להכיל לפחות 6 תווים']
  },
  isAdmin: {
    type: Boolean,
    default: false // ברירת המחדל היא משתמש רגיל, לא אדמין
  }
}, {
  timestamps: true,
  strict: true // מגדיר שרק השדות המוגדרים מעלה יכולים להיות בקולקציה
});

// הצפנת סיסמה לפני שמירה
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// מתודה להשוואת סיסמאות
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// מחיקת הדגם הישן אם קיים
try {
  mongoose.deleteModel('User');
} catch (e) {
  // אם הדגם לא קיים, נמשיך
}

const User = mongoose.model('User', userSchema);
module.exports = User;