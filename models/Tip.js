const mongoose = require('mongoose');

const tipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'הטיפ חייב כותרת'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'הטיפ חייב תוכן'],
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['nutrition', 'training', 'recovery', 'motivation'],
    default: 'nutrition'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const Tip = mongoose.model('Tip', tipSchema);
module.exports = Tip;
