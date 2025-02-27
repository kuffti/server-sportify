const express = require('express');
const router = express.Router();
const { createPost, getPosts } = require('../controllers/postController');
const protect = require('../middleware/auth');

// הוספת middleware לבדיקת token
router.use(protect);

// נתיבים בסיסיים
router.route('/')
  .get(getPosts)
  .post(createPost);

router.get('/test', (req, res) => {
  res.json({ message: 'Community route working' }); // נתיב בדיקה
});

module.exports = router;
