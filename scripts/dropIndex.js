const { MongoClient } = require('mongodb');
require('dotenv').config();

// נשתמש ישירות ב-MongoClient בלי mongoose
async function dropIndex() {
  const uri = process.env.MONGO_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(); // מחזיר את בסיס הנתונים ברירת המחדל
    const users = db.collection('users');
    
    // נמצא את כל האינדקסים הקיימים
    const indexes = await users.indexes();
    console.log('Current indexes:', indexes);
    
    // ננסה להסיר את האינדקס הבעייתי
    try {
      await users.dropIndex('username_1');
      console.log('Successfully dropped username_1 index');
    } catch (error) {
      // אם האינדקס לא קיים
      console.log('Error dropping index:', error.message);
    }
    
    // נוסיף אינדקס חדש על אימייל
    await users.createIndex({ email: 1 }, { unique: true });
    console.log('Created email index');
    
    // נבדוק שוב שהאינדקסים תקינים
    const updatedIndexes = await users.indexes();
    console.log('Updated indexes:', updatedIndexes);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// הרצה מיידית
dropIndex().catch(console.error);
