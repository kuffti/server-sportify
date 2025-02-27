const express = require('express');
const router = express.Router();
const { getTips, createTip, updateTip, deleteTip } = require('../controllers/tipController');
const protect = require('../middleware/auth');

// נתיב ציבורי לקבלת טיפים
router.get('/', getTips);

// נתיבים מוגנים - רק למשתמשים מחוברים עם הרשאות אדמין
router.post('/', protect, createTip); // יצירת טיפ חדש
router.put('/:id', protect, updateTip); // עדכון טיפ
router.delete('/:id', protect, deleteTip); // מחיקת טיפ

module.exports = router;
