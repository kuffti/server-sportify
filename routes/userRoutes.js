const express = require('express');
const router = express.Router();
const { register, login, updateProfile } = require('../controllers/userController');
const protect = require('../middleware/auth');

// נתיבים ציבוריים
router.post('/register', register);
router.post('/login', login);

// נתיבים מוגנים - עם אימות משתמש
router.put('/profile', protect, updateProfile);

module.exports = router;
