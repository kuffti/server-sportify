const mongoose = require('mongoose');

// הגדרת המבנה של פוסט בקהילה
const communitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // קישור למודל המשתמשים
    required: true
  },
  title: {
    type: String,
    required: [true, 'בבקשה הכנס כותרת'] // חובה להכניס כותרת
  },
  content: {
    type: String,
    required: [true, 'בבקשה הכנס תוכן'] // חובה להכניס תוכן
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // מערך של משתמשים שלחצו לייק
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Community', communitySchema);
