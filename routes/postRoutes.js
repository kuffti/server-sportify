const express = require('express');
const router = express.Router();
const { createPost, getPosts, toggleLike, adminDeletePost, adminEditPost } = require('../controllers/postController');
const protect = require('../middleware/auth');

// נתיבים ציבוריים - קבלת פוסטים לא דורשת הרשאות
router.get('/', getPosts);

// נתיבים מוגנים - יוצרים פוסט רק עם התחברות
router.post('/', protect, createPost);

// ניהול לייקים
router.put('/:id/like', protect, toggleLike);

// נתיבי אדמין - הוספנו את הנתיבים החסרים!
router.delete('/admin/:id', protect, adminDeletePost);
router.put('/admin/:id', protect, adminEditPost);

// בדיקת נתיבים - מידע על הנתיבים שהוגדרו
router.get('/routes', (req, res) => {
  const routes = [];
  
  router.stack.forEach((r) => {
    if (r.route && r.route.path) {
      routes.push({
        path: r.route.path,
        methods: Object.keys(r.route.methods)
      });
    }
  });
  
  res.json({ routes });
});

module.exports = router;
