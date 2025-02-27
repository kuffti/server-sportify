const mongoose = require('mongoose');
require('dotenv').config();

async function fixDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // מחיקת כל האינדקסים הקיימים של username
    await mongoose.connection.collection('users').dropIndex('username_1');
    console.log('Dropped username index');

    // יצירת אינדקס חדש רק על email
    await mongoose.connection.collection('users').createIndex(
      { email: 1 },
      { unique: true }
    );
    console.log('Created new email index');

    console.log('Database fixed successfully');
  } catch (error) {
    if (error.code === 26) {
      console.log('Index does not exist, continuing...');
    } else {
      console.error('Error fixing database:', error);
    }
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixDatabase();
