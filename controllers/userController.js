const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// קבע מפתח ברירת מחדל
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log('בקשת הרשמה:', { name, email, passwordLength: password?.length });

    // בדיקות תקינות פשוטות
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'כל השדות הם חובה' });
    }

    // בדיקה אם המשתמש כבר קיים
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'משתמש עם אימייל זה כבר קיים' });
    }

    // יצירת משתמש חדש
    const user = await User.create({
      name,
      email,
      password
    });

    console.log('משתמש נוצר בהצלחה:', user._id);

    // יצירת טוקן
    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: '30d'
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token
    });
  } catch (error) {
    console.error('שגיאה בהרשמה:', error);
    res.status(500).json({ message: 'שגיאת שרת בהרשמה', details: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('בקשת התחברות:', { email, passwordProvided: !!password });

    // בדיקות תקינות
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'אנא הזן אימייל וסיסמה',
        details: 'חסרים פרטי התחברות' 
      });
    }

    // חיפוש המשתמש לפי אימייל
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`משתמש לא נמצא: ${email}`);
      // חשוב: מסיבות אבטחה לא לציין שהאימייל לא נמצא אלא לתת הודעה כללית
      return res.status(401).json({ message: 'אימייל או סיסמה שגויים' });
    }

    // בדיקה אם הסיסמה בכלל קיימת
    if (!user.password) {
      console.log(`סיסמה חסרה למשתמש: ${email}`);
      return res.status(401).json({ message: 'שגיאת אימות, פנה למנהל המערכת' });
    }

    // בדיקת סיסמה
    const isMatch = await user.matchPassword(password);
    console.log('סיסמה תואמת:', isMatch ? 'כן' : 'לא');

    if (!isMatch) {
      return res.status(401).json({ message: 'אימייל או סיסמה שגויים' });
    }

    // יצירת טוקן
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '30d' }
    );

    // שולח תשובה עם נתוני המשתמש (ללא סיסמה)
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token
    });
    
    console.log('התחברות מוצלחת:', user.email);
    
  } catch (error) {
    console.error('שגיאה בהתחברות:', error);
    res.status(500).json({ 
      message: 'שגיאת שרת בהתחברות', 
      details: error.message 
    });
  }
};

module.exports = {
  register,
  login
};
