const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'שם הקבוצה הוא שדה חובה'],
    trim: true
  },
  sportType: {
    type: String,
    required: [true, 'סוג הספורט הוא שדה חובה'],
    trim: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'חובה לציין יוצר קבוצה']
  },
  location: {
    latitude: {
      type: Number,
      required: [true, 'קו רוחב הוא שדה חובה']
    },
    longitude: {
      type: Number,
      required: [true, 'קו אורך הוא שדה חובה']
    },
    name: {
      type: String,
      default: ''
    }
  },
  activityDate: {
    type: Date,
    required: [true, 'תאריך הפעילות הוא שדה חובה']
  },
  activityTime: {
    type: String,
    required: [true, 'שעת הפעילות היא שדה חובה']
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  maxParticipants: {
    type: Number,
    default: 10
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Group = mongoose.model('Group', groupSchema);
module.exports = Group;
