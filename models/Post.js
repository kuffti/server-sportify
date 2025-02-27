const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'חובה להזין כותרת']
  },
  content: {
    type: String,
    required: [true, 'חובה להזין תוכן']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'חובה לציין מחבר']
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
  timestamps: true,
  toJSON: { 
    transform: function(doc, ret) {
      // Convert timestamps to UTC+2
      if (ret.createdAt) {
        ret.createdAt = new Date(ret.createdAt).toLocaleString('en-US', {
          timeZone: 'Asia/Jerusalem'
        });
      }
      if (ret.updatedAt) {
        ret.updatedAt = new Date(ret.updatedAt).toLocaleString('en-US', {
          timeZone: 'Asia/Jerusalem'
        });
      }
      return ret;
    }
  }
});

// Helper method to get formatted date in UTC+2
postSchema.methods.getFormattedDate = function() {
  return new Date(this.createdAt).toLocaleString('he-IL', {
    timeZone: 'Asia/Jerusalem'
  });
};

// מודל שמייצג פוסט בודד
const Post = mongoose.model('Post', postSchema);

module.exports = Post;
