const mongoose = require('mongoose'); // ייבוא הספרייה שעוזרת לנו להתחבר למסד הנתונים

// פונקציה שמתחברת למסד הנתונים
const connectDB = async () => {
  try {
    // מתחברים למסד הנתונים שלנו
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    // אם החיבור הצליח, נראה הודעה בצבע ירוק
    console.log(`🎉 התחברנו למסד הנתונים: ${conn.connection.host}`.cyan.underline);
  } catch (error) {
    // אם יש שגיאה, נראה אותה בצבע אדום
    console.log(`❌ שגיאה: ${error.message}`.red.underline.bold);
    process.exit(1); // סוגרים את השרת אם יש בעיה
  }
};

module.exports = connectDB; // מייצאים את הפונקציה כדי שנוכל להשתמש בה במקומות אחרים
