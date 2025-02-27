const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    // בדיקה אם נשלח טוקן והוא בפורמט הנכון
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // אם אין טוקן, אין הרשאה
    if (!token) {
      return res.status(401).json({ message: 'לא מורשה, נדרשת התחברות' });
    }

    try {
      // פענוח הטוקן
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // שליפת פרטי המשתמש ללא הסיסמה
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ message: 'משתמש לא נמצא' });
      }
      
      // שמירת פרטי המשתמש בבקשה כולל סטטוס אדמין
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'טוקן לא תקין' });
    }
  } catch (error) {
    res.status(500).json({ message: 'שגיאת שרת', error: error.message });
  }
};

module.exports = protect;
