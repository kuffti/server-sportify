const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    // מציאת הטוקן בכותרות
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('טוקן זוהה בבקשה');
    } else {
      console.log('לא נמצא טוקן בבקשה');
      return res.status(401).json({ message: 'לא נמצא טוקן הזדהות' });
    }

    try {
      // פענוח הטוקן
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
      console.log('פענוח טוקן הצליח, מזהה משתמש:', decoded.id);
      
      // מציאת המשתמש לפי המזהה מהטוקן
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        console.log('לא נמצא משתמש תואם לטוקן');
        return res.status(401).json({ message: 'טוקן לא תקף - משתמש לא נמצא' });
      }
      
      // שמירת פרטי המשתמש בבקשה
      req.user = user;
      console.log('משתמש נמצא והוסף לבקשה');
      next();
    } catch (error) {
      console.error('שגיאה בפענוח הטוקן:', error);
      return res.status(401).json({ message: 'טוקן לא תקף' });
    }
  } catch (error) {
    console.error('שגיאה כללית במידלוור הרשאות:', error);
    res.status(500).json({ message: 'שגיאת שרת', error: error.message });
  }
};

module.exports = protect;
