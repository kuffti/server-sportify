const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
  try {
    console.log('Registration request body:', req.body);
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      console.log('Missing required fields:', { name: !!name, email: !!email, password: !!password });
      return res.status(400).json({ 
        message: 'כל השדות הם חובה',
        details: 'חסרים שדות נדרשים'
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('User already exists with email:', email);
      return res.status(400).json({ 
        message: 'משתמש קיים',
        details: 'כתובת האימייל כבר רשומה במערכת'
      });
    }

    const user = new User({
      name,
      email,
      password
    });

    await user.save();
    console.log('User created successfully:', user._id);

    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ 
      message: 'שגיאה בהרשמה',
      details: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
      });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token
      });
    } else {
      res.status(401).json({ message: 'אימייל או סיסמה לא נכונים' });
    }
  } catch (error) {
    res.status(400).json({ message: 'שגיאה בהתחברות', error: error.message });
  }
};

module.exports = {
  register,
  login
};
