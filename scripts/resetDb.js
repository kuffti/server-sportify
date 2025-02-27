const mongoose = require('mongoose');
require('dotenv').config();

async function resetIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // מחיקת האינדקס הישן
    await mongoose.connection.collection('users').dropIndex('username_1');
    console.log('Dropped old username index');

    // יצירת האינדקס החדש רק על email
    await mongoose.connection.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('Created new email index');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

resetIndexes();
